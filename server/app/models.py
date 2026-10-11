from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ---- statuses ----
PRODUCT_STATUSES = ("PUBLISHED", "PREORDER", "OUT_OF_STOCK", "DRAFT", "ARCHIVED")
ORDER_STATUSES = (
    "ORDER_PLACED",
    "PREPARATION",
    "CARAVAN_DISPATCHED",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED_TO_VAULT",
    "CANCELLED",
)
RARITIES = ("COMMON", "UNCOMMON", "RARE", "LEGENDARY")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    telegram_id: Mapped[int | None] = mapped_column(Integer, unique=True, nullable=True)
    username: Mapped[str | None] = mapped_column(String(64), nullable=True)
    callsign: Mapped[str | None] = mapped_column(String(120), nullable=True)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(20), default="dweller")  # dweller | overseer
    phone: Mapped[str | None] = mapped_column(String(32))
    avatar: Mapped[str | None] = mapped_column(String(512))
    bio: Mapped[str | None] = mapped_column(Text)
    caps_balance: Mapped[int] = mapped_column(Integer, default=0)
    level: Mapped[int] = mapped_column(Integer, default=1)
    karma: Mapped[str | None] = mapped_column(String(64))
    region: Mapped[str | None] = mapped_column(String(255))
    city: Mapped[str | None] = mapped_column(String(255))
    street: Mapped[str | None] = mapped_column(String(255))
    building: Mapped[str | None] = mapped_column(String(64))
    apartment: Mapped[str | None] = mapped_column(String(64))
    postal_code: Mapped[str | None] = mapped_column(String(32))
    landmark: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    orders: Mapped[list["Order"]] = relationship(back_populates="user")


class Category(Base):
    """Тип товара: фигурки, одежда, обувь, аксессуары, игры..."""

    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True)
    name: Mapped[str] = mapped_column(String(120))
    icon: Mapped[str | None] = mapped_column(String(16))
    description: Mapped[str | None] = mapped_column(Text)
    has_sizes: Mapped[bool] = mapped_column(Boolean, default=False)
    size_type: Mapped[str | None] = mapped_column(String(20))  # clothing | shoes
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Franchise(Base):
    """Тематика/франшиза: Аниме (Evangelion), Игры (Cyberpunk), Фильмы..."""

    __tablename__ = "franchises"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(96), unique=True)
    name: Mapped[str] = mapped_column(String(160))
    theme: Mapped[str] = mapped_column(String(32), default="other")  # anime|games|films|comics|other
    icon: Mapped[str | None] = mapped_column(String(16))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True)
    title_ru: Mapped[str] = mapped_column(String(300))
    title_original: Mapped[str | None] = mapped_column(String(300))
    description_ru: Mapped[str | None] = mapped_column(Text)
    lore: Mapped[str | None] = mapped_column(Text)

    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"))
    franchise_id: Mapped[int | None] = mapped_column(ForeignKey("franchises.id"))

    # pricing snapshot
    price_cny: Mapped[float] = mapped_column(default=0.0)
    weight_g: Mapped[int] = mapped_column(Integer, default=0)
    usd_rate: Mapped[float | None] = mapped_column()
    k_cost: Mapped[float | None] = mapped_column()
    k_client: Mapped[float | None] = mapped_column()
    delivery_fee_rub: Mapped[float] = mapped_column(default=0.0)
    cost_rub: Mapped[float] = mapped_column(default=0.0)
    price_rub: Mapped[float] = mapped_column(default=0.0)
    old_price_rub: Mapped[float | None] = mapped_column()
    price_locked: Mapped[bool] = mapped_column(Boolean, default=False)

    stock: Mapped[int] = mapped_column(Integer, default=0)
    condition_cnd: Mapped[int] = mapped_column(Integer, default=100)
    rarity: Mapped[str] = mapped_column(String(20), default="COMMON")
    badge: Mapped[str | None] = mapped_column(String(32))
    status: Mapped[str] = mapped_column(String(20), default="DRAFT")
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    source_url: Mapped[str | None] = mapped_column(String(1024))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    category: Mapped["Category | None"] = relationship()
    franchise: Mapped["Franchise | None"] = relationship()
    images: Mapped[list["ProductImage"]] = relationship(
        back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.sort_order"
    )
    variants: Mapped[list["ProductVariant"]] = relationship(
        back_populates="product", cascade="all, delete-orphan"
    )
    stats: Mapped[list["ProductStat"]] = relationship(
        back_populates="product", cascade="all, delete-orphan", order_by="ProductStat.sort_order"
    )


class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    path: Mapped[str] = mapped_column(String(1024))  # relative to upload_dir
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_cover: Mapped[bool] = mapped_column(Boolean, default=False)

    product: Mapped["Product"] = relationship(back_populates="images")

    @property
    def url(self) -> str:
        from .config import get_settings

        return f"{get_settings().upload_url_prefix}/{self.path}"


class ProductVariant(Base):
    __tablename__ = "product_variants"
    __table_args__ = (UniqueConstraint("product_id", "size", "color", name="uq_variant"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    size: Mapped[str | None] = mapped_column(String(32))
    color: Mapped[str | None] = mapped_column(String(64))
    sku: Mapped[str | None] = mapped_column(String(64))
    stock: Mapped[int] = mapped_column(Integer, default=0)
    price_delta_rub: Mapped[float] = mapped_column(default=0.0)

    product: Mapped["Product"] = relationship(back_populates="variants")


class ProductStat(Base):
    __tablename__ = "product_stats"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    label: Mapped[str] = mapped_column(String(64))
    value: Mapped[str] = mapped_column(String(120))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    product: Mapped["Product"] = relationship(back_populates="stats")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    public_no: Mapped[str] = mapped_column(String(32), unique=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    recipient_name: Mapped[str] = mapped_column(String(160))
    phone: Mapped[str | None] = mapped_column(String(32))
    telegram: Mapped[str | None] = mapped_column(String(120))
    region: Mapped[str | None] = mapped_column(String(255))
    city: Mapped[str | None] = mapped_column(String(255))
    street: Mapped[str | None] = mapped_column(String(255))
    building: Mapped[str | None] = mapped_column(String(64))
    apartment: Mapped[str | None] = mapped_column(String(64))
    postal_code: Mapped[str | None] = mapped_column(String(32))
    landmark: Mapped[str | None] = mapped_column(Text)
    payment_method: Mapped[str] = mapped_column(String(32), default="SBP")
    status: Mapped[str] = mapped_column(String(32), default="ORDER_PLACED")
    total_rub: Mapped[float] = mapped_column(default=0.0)
    tracking_number: Mapped[str | None] = mapped_column(String(64))
    comment: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User | None"] = relationship(back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"))
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id"))
    variant_id: Mapped[int | None] = mapped_column(ForeignKey("product_variants.id"))
    title: Mapped[str] = mapped_column(String(300))
    price_rub: Mapped[float] = mapped_column(default=0.0)
    quantity: Mapped[int] = mapped_column(Integer, default=1)

    order: Mapped["Order"] = relationship(back_populates="items")


class Setting(Base):
    __tablename__ = "settings"

    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    value: Mapped[str] = mapped_column(Text)  # JSON-encoded
