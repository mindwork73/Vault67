from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import require_admin
from ..models import Category, Franchise
from ..schemas import CategoryIn, CategoryOut, FranchiseIn, FranchiseOut
from ..utils import normalize_theme, unique_slug

router = APIRouter(tags=["catalog"])


# ---------------- Categories (Тип товара) ----------------
@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return list(db.scalars(select(Category).order_by(Category.sort_order, Category.id)))


@router.post("/categories", response_model=CategoryOut, dependencies=[Depends(require_admin)])
def create_category(data: CategoryIn, db: Session = Depends(get_db)):
    slug = unique_slug(data.slug or data.name, lambda s: db.scalar(select(Category).where(Category.slug == s)) is not None)
    cat = Category(**data.model_dump(exclude={"slug"}), slug=slug)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.patch("/categories/{cat_id}", response_model=CategoryOut, dependencies=[Depends(require_admin)])
def update_category(cat_id: int, data: CategoryIn, db: Session = Depends(get_db)):
    cat = db.get(Category, cat_id)
    if not cat:
        raise HTTPException(404, "Раздел не найден")
    for field, value in data.model_dump(exclude_unset=True, exclude={"slug"}).items():
        setattr(cat, field, value)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/categories/{cat_id}", dependencies=[Depends(require_admin)])
def delete_category(cat_id: int, db: Session = Depends(get_db)):
    cat = db.get(Category, cat_id)
    if not cat:
        raise HTTPException(404, "Раздел не найден")
    db.delete(cat)
    db.commit()
    return {"ok": True}


# ---------------- Franchises ----------------
@router.get("/franchises", response_model=list[FranchiseOut])
def list_franchises(db: Session = Depends(get_db)):
    return list(db.scalars(select(Franchise).order_by(Franchise.sort_order, Franchise.id)))


@router.post("/franchises", response_model=FranchiseOut, dependencies=[Depends(require_admin)])
def create_franchise(data: FranchiseIn, db: Session = Depends(get_db)):
    slug = unique_slug(data.slug or data.name, lambda s: db.scalar(select(Franchise).where(Franchise.slug == s)) is not None)
    fr = Franchise(**{**data.model_dump(exclude={"slug"}), "theme": normalize_theme(data.theme)}, slug=slug)
    db.add(fr)
    db.commit()
    db.refresh(fr)
    return fr


@router.patch("/franchises/{fr_id}", response_model=FranchiseOut, dependencies=[Depends(require_admin)])
def update_franchise(fr_id: int, data: FranchiseIn, db: Session = Depends(get_db)):
    fr = db.get(Franchise, fr_id)
    if not fr:
        raise HTTPException(404, "Франшиза не найдена")
    payload = data.model_dump(exclude_unset=True, exclude={"slug"})
    if "theme" in payload:
        payload["theme"] = normalize_theme(payload["theme"])
    for field, value in payload.items():
        setattr(fr, field, value)
    db.commit()
    db.refresh(fr)
    return fr


@router.delete("/franchises/{fr_id}", dependencies=[Depends(require_admin)])
def delete_franchise(fr_id: int, db: Session = Depends(get_db)):
    fr = db.get(Franchise, fr_id)
    if not fr:
        raise HTTPException(404, "Франшиза не найдена")
    db.delete(fr)
    db.commit()
    return {"ok": True}
