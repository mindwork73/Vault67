from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..deps import get_current_user_optional, require_admin
from ..models import Product, ProductImage, ProductStat, ProductVariant
from ..pricing import compute_pricing
from ..schemas import PricePreviewIn, PricePreviewOut, ProductIn, ProductOut
from ..settings_service import get_settings_dict
from ..utils import unique_slug

router = APIRouter(prefix="/products", tags=["products"])


def _load_options():
    return (
        selectinload(Product.images),
        selectinload(Product.variants),
        selectinload(Product.stats),
        selectinload(Product.category),
        selectinload(Product.franchise),
    )


def _pricing_params(db: Session) -> dict:
    return get_settings_dict(db).get("pricing", {})


@router.get("", response_model=list[ProductOut])
def list_products(
    db: Session = Depends(get_db),
    q: str | None = None,
    category_id: int | None = None,
    franchise_id: int | None = None,
    status: str | None = "PUBLISHED",
    featured: bool | None = None,
    include_drafts: bool = False,
    user=Depends(get_current_user_optional),
    limit: int = Query(60, le=200),
    offset: int = 0,
):
    stmt = select(Product).options(*_load_options())
    is_admin = user is not None and user.role == "overseer"
    if not is_admin:
        status = status or "PUBLISHED"
        stmt = stmt.where(Product.status == (status or "PUBLISHED"))
    elif status:
        stmt = stmt.where(Product.status == status)
    if category_id:
        stmt = stmt.where(Product.category_id == category_id)
    if franchise_id:
        stmt = stmt.where(Product.franchise_id == franchise_id)
    if featured is not None:
        stmt = stmt.where(Product.featured == featured)
    if q:
        like = f"%{q.lower()}%"
        stmt = stmt.where(
            or_(
                Product.title_ru.ilike(like),
                Product.title_original.ilike(like),
                Product.description_ru.ilike(like),
            )
        )
    stmt = stmt.order_by(Product.featured.desc(), Product.created_at.desc()).limit(limit).offset(offset)
    return list(db.scalars(stmt).unique())


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: str, db: Session = Depends(get_db)):
    stmt = select(Product).options(*_load_options())
    if product_id.isdigit():
        stmt = stmt.where(Product.id == int(product_id))
    else:
        stmt = stmt.where(Product.slug == product_id)
    product = db.scalars(stmt).unique().first()
    if not product:
        raise HTTPException(404, "Товар не найден")
    return product


@router.post("/price-preview", response_model=PricePreviewOut)
def price_preview(data: PricePreviewIn, db: Session = Depends(get_db), _=Depends(require_admin)):
    try:
        result = compute_pricing(data.price_cny, data.weight_g, _pricing_params(db))
        result.pop("params", None)
        return PricePreviewOut(**result)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(502, f"Не удалось получить курс ЦБ: {exc}") from exc


def _apply_related(db: Session, product: Product, data: ProductIn):
    # images
    for img in list(product.images):
        db.delete(img)
    product.images.clear()
    for idx, path in enumerate(data.images):
        product.images.append(ProductImage(path=path, sort_order=idx, is_cover=(idx == 0)))
    # variants
    for var in list(product.variants):
        db.delete(var)
    product.variants.clear()
    for v in data.variants:
        product.variants.append(ProductVariant(**v.model_dump()))
    # stats
    for st in list(product.stats):
        db.delete(st)
    product.stats.clear()
    for s in data.stats:
        product.stats.append(ProductStat(**s.model_dump()))


def _apply_pricing(db: Session, product: Product, data: ProductIn):
    pricing = compute_pricing(data.price_cny, data.weight_g, _pricing_params(db))
    product.usd_rate = pricing["usd_rate"]
    product.k_cost = pricing["k_cost"]
    product.k_client = pricing["k_client"]
    product.delivery_fee_rub = pricing["delivery_fee_rub"]
    product.cost_rub = pricing["cost_rub"]
    product.price_rub = data.price_rub_override if data.price_rub_override else pricing["price_rub"]
    product.price_locked = bool(data.price_rub_override)


@router.post("", response_model=ProductOut, dependencies=[Depends(require_admin)])
def create_product(data: ProductIn, db: Session = Depends(get_db)):
    slug = unique_slug(data.title_ru, lambda s: db.scalar(select(Product).where(Product.slug == s)) is not None)
    product = Product(slug=slug)
    for field in ("title_ru", "title_original", "description_ru", "lore", "category_id",
                  "franchise_id", "price_cny", "weight_g", "stock", "condition_cnd",
                  "rarity", "badge", "status", "featured", "source_url"):
        setattr(product, field, getattr(data, field))
    _apply_pricing(db, product, data)
    if product.status == "PUBLISHED":
        product.published_at = datetime.now(timezone.utc)
    db.add(product)
    _apply_related(db, product, data)
    db.commit()
    db.refresh(product)
    return get_product(str(product.id), db)


@router.patch("/{product_id}", response_model=ProductOut, dependencies=[Depends(require_admin)])
def update_product(product_id: int, data: ProductIn, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(404, "Товар не найден")
    was_published = product.status == "PUBLISHED"
    provided = data.model_dump(exclude_unset=True)
    for field in ("title_ru", "title_original", "description_ru", "lore", "category_id",
                  "franchise_id", "price_cny", "weight_g", "stock", "condition_cnd",
                  "rarity", "badge", "status", "featured", "source_url"):
        if field in provided:
            setattr(product, field, getattr(data, field))
    if "price_cny" in provided or "weight_g" in provided or "price_rub_override" in provided:
        _apply_pricing(db, product, data)
    if any(k in provided for k in ("images", "variants", "stats")):
        _apply_related(db, product, data)
    if product.status == "PUBLISHED" and not was_published:
        product.published_at = datetime.now(timezone.utc)
    db.commit()
    return get_product(str(product.id), db)


@router.delete("/{product_id}", dependencies=[Depends(require_admin)])
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(404, "Товар не найден")
    db.delete(product)
    db.commit()
    return {"ok": True}
