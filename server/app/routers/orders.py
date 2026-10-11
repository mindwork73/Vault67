from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user, get_current_user_optional, require_admin
from ..models import Order, OrderItem, Product, User
from ..notify import notify_admins
from ..schemas import AddressIn, OrderOut, OrderStatusIn
from ..utils import order_number

router = APIRouter(prefix="/orders", tags=["orders"])


def _build_notification(order: Order) -> str:
    items = "\n".join(f"• {i.title} ×{i.quantity} — {i.price_rub:.0f} ₽" for i in order.items)
    addr = f"{order.region or ''}, {order.city or ''}, {order.street or ''}, {order.building or ''}" \
        + (f", кв. {order.apartment}" if order.apartment else "")
    return (
        f"🧾 <b>Новый заказ {order.public_no}</b>\n"
        f"{items}\n\n"
        f"Итого: <b>{order.total_rub:.0f} ₽</b>\n"
        f"Получатель: {order.recipient_name}\n"
        f"Телефон: {order.phone or '—'}\n"
        f"TG: {order.telegram or '—'}\n"
        f"Адрес: {addr or '—'}\n"
        f"Индекс: {order.postal_code or '—'}\n"
        f"Оплата: {order.payment_method}"
    )


@router.post("", response_model=OrderOut)
def create_order(
    data: AddressIn,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    if not data.items:
        raise HTTPException(400, "Корзина пуста")
    order = Order(
        public_no=order_number(),
        user_id=user.id if user else None,
        recipient_name=data.recipient_name,
        phone=data.phone,
        telegram=data.telegram,
        region=data.region,
        city=data.city,
        street=data.street,
        building=data.building,
        apartment=data.apartment,
        postal_code=data.postal_code,
        landmark=data.landmark,
        payment_method=data.payment_method,
        comment=data.comment,
        status="ORDER_PLACED",
    )
    total = 0.0
    for item in data.items:
        product = db.get(Product, item.product_id)
        if not product:
            raise HTTPException(400, f"Товар {item.product_id} не найден")
        price = product.price_rub
        variant = None
        if item.variant_id:
            variant = next((v for v in product.variants if v.id == item.variant_id), None)
            if variant:
                price += variant.price_delta_rub
        qty = max(1, item.quantity)
        total += price * qty
        order.items.append(OrderItem(
            product_id=product.id,
            variant_id=variant.id if variant else None,
            title=product.title_ru,
            price_rub=price,
            quantity=qty,
        ))
    order.total_rub = total
    db.add(order)
    db.commit()
    db.refresh(order)
    try:
        notify_admins(_build_notification(order))
    except Exception:  # noqa: BLE001
        pass
    return order


@router.get("/my", response_model=list[OrderOut])
def my_orders(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return list(db.scalars(
        select(Order).where(Order.user_id == user.id).order_by(Order.created_at.desc())
    ))


@router.get("", response_model=list[OrderOut], dependencies=[Depends(require_admin)])
def list_orders(db: Session = Depends(get_db), status: str | None = None, limit: int = 200):
    stmt = select(Order).order_by(Order.created_at.desc()).limit(limit)
    if status:
        stmt = stmt.where(Order.status == status)
    return list(db.scalars(stmt))


@router.get("/{order_id}", response_model=OrderOut, dependencies=[Depends(require_admin)])
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(404, "Заказ не найден")
    return order


@router.patch("/{order_id}/status", response_model=OrderOut, dependencies=[Depends(require_admin)])
def update_status(order_id: int, data: OrderStatusIn, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(404, "Заказ не найден")
    order.status = data.status
    if data.tracking_number:
        order.tracking_number = data.tracking_number
    db.commit()
    db.refresh(order)
    return order
