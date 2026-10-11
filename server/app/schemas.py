from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---------------- Auth / Users ----------------
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    callsign: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str | None
    telegram_id: int | None
    username: str | None
    callsign: str | None
    role: str
    phone: str | None
    avatar: str | None
    bio: str | None
    caps_balance: int
    level: int
    karma: str | None
    region: str | None
    city: str | None
    street: str | None
    building: str | None
    apartment: str | None
    postal_code: str | None
    landmark: str | None


class UserUpdate(BaseModel):
    callsign: str | None = None
    phone: str | None = None
    avatar: str | None = None
    bio: str | None = None
    telegram: str | None = None
    region: str | None = None
    city: str | None = None
    street: str | None = None
    building: str | None = None
    apartment: str | None = None
    postal_code: str | None = None
    landmark: str | None = None


# ---------------- Catalog ----------------
class CategoryIn(BaseModel):
    slug: str | None = None
    name: str
    icon: str | None = None
    description: str | None = None
    has_sizes: bool = False
    size_type: str | None = None
    sort_order: int = 0
    is_active: bool = True


class CategoryOut(CategoryIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class FranchiseIn(BaseModel):
    slug: str | None = None
    name: str
    theme: str = "other"
    icon: str | None = None
    sort_order: int = 0
    is_active: bool = True


class FranchiseOut(FranchiseIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class VariantIn(BaseModel):
    size: str | None = None
    color: str | None = None
    sku: str | None = None
    stock: int = 0
    price_delta_rub: float = 0.0


class VariantOut(VariantIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class StatIn(BaseModel):
    label: str
    value: str
    sort_order: int = 0


class StatOut(StatIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    path: str
    url: str | None = None
    sort_order: int
    is_cover: bool


class ProductIn(BaseModel):
    title_ru: str
    title_original: str | None = None
    description_ru: str | None = None
    lore: str | None = None
    category_id: int | None = None
    franchise_id: int | None = None
    price_cny: float = 0.0
    weight_g: int = 0
    stock: int = 0
    condition_cnd: int = 100
    rarity: str = "COMMON"
    badge: str | None = None
    status: str = "DRAFT"
    featured: bool = False
    source_url: str | None = None
    # price override (optional): if price_override set -> lock price
    price_rub_override: float | None = None
    images: list[str] = []  # uploaded file paths
    variants: list[VariantIn] = []
    stats: list[StatIn] = []


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title_ru: str
    title_original: str | None
    description_ru: str | None
    lore: str | None
    category_id: int | None
    franchise_id: int | None
    price_cny: float
    weight_g: int
    usd_rate: float | None
    k_cost: float | None
    k_client: float | None
    delivery_fee_rub: float
    cost_rub: float
    price_rub: float
    old_price_rub: float | None
    stock: int
    condition_cnd: int
    rarity: str
    badge: str | None
    status: str
    featured: bool
    source_url: str | None
    created_at: datetime
    updated_at: datetime
    images: list[ImageOut] = []
    variants: list[VariantOut] = []
    stats: list[StatOut] = []
    category: CategoryOut | None = None
    franchise: FranchiseOut | None = None


# ---------------- Pricing ----------------
class PricePreviewIn(BaseModel):
    price_cny: float
    weight_g: int


class PricePreviewOut(BaseModel):
    usd_rate: float
    k_cost: float
    k_client: float
    delivery_fee_rub: float
    cost_rub: float
    price_rub: float
    weight_buckets: int


# ---------------- Orders ----------------
class OrderItemIn(BaseModel):
    product_id: int
    variant_id: int | None = None
    quantity: int = 1


class AddressIn(BaseModel):
    recipient_name: str
    phone: str | None = None
    telegram: str | None = None
    region: str | None = None
    city: str | None = None
    street: str | None = None
    building: str | None = None
    apartment: str | None = None
    postal_code: str | None = None
    landmark: str | None = None
    payment_method: str = "SBP"
    comment: str | None = None
    items: list[OrderItemIn]


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int | None
    variant_id: int | None
    title: str
    price_rub: float
    quantity: int


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    public_no: str
    user_id: int | None
    recipient_name: str
    phone: str | None
    telegram: str | None
    region: str | None
    city: str | None
    street: str | None
    building: str | None
    apartment: str | None
    postal_code: str | None
    landmark: str | None
    payment_method: str
    status: str
    total_rub: float
    tracking_number: str | None
    comment: str | None
    created_at: datetime
    items: list[OrderItemOut] = []


class OrderStatusIn(BaseModel):
    status: str
    tracking_number: str | None = None


# ---------------- Geo / Settings ----------------
class GeoResult(BaseModel):
    label: str
    region: str | None = None
    city: str | None = None
    street: str | None = None
    building: str | None = None
    apartment: str | None = None
    postal_code: str | None = None
    lat: float | None = None
    lon: float | None = None


class SettingsOut(BaseModel):
    pricing: dict
    store: dict


class SettingsUpdate(BaseModel):
    pricing: dict | None = None
    store: dict | None = None


TokenOut.model_rebuild()
