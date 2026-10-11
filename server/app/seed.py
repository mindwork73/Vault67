"""Idempotent seeding: categories, franchises, settings, overseer account."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import get_settings
from .models import Category, Franchise, User
from .security import hash_password
from .settings_service import get_settings_dict
from .utils import unique_slug

CATEGORIES = [
    {"name": "Одежда", "icon": "shirt", "has_sizes": True, "size_type": "clothing"},
    {"name": "Обувь", "icon": "footprints", "has_sizes": True, "size_type": "shoes"},
    {"name": "Фигурки и коллекционное", "icon": "bot"},
    {"name": "Аксессуары", "icon": "watch"},
    {"name": "Гаджеты и техника", "icon": "cpu"},
    {"name": "Постеры и декор", "icon": "image"},
    {"name": "Манга и книги", "icon": "book"},
]

FRANCHISES = [
    {"name": "Fallout", "theme": "games"},
    {"name": "Cyberpunk 2077", "theme": "games"},
    {"name": "Warhammer 40,000", "theme": "games"},
    {"name": "The Witcher", "theme": "games"},
    {"name": "Genshin Impact", "theme": "games"},
    {"name": "Naruto", "theme": "anime"},
    {"name": "Attack on Titan", "theme": "anime"},
    {"name": "Demon Slayer", "theme": "anime"},
    {"name": "JoJo's Bizarre Adventure", "theme": "anime"},
    {"name": "Star Wars", "theme": "films"},
]


def seed_categories(db: Session) -> None:
    for i, data in enumerate(CATEGORIES):
        if db.scalar(select(Category).where(Category.name == data["name"])):
            continue
        slug = unique_slug(data["name"], lambda s: db.scalar(select(Category).where(Category.slug == s)) is not None)
        db.add(Category(slug=slug, sort_order=i, **data))
    db.commit()


def seed_franchises(db: Session) -> None:
    for i, data in enumerate(FRANCHISES):
        if db.scalar(select(Franchise).where(Franchise.name == data["name"])):
            continue
        slug = unique_slug(data["name"], lambda s: db.scalar(select(Franchise).where(Franchise.slug == s)) is not None)
        db.add(Franchise(slug=slug, sort_order=i, **data))
    db.commit()


def seed_admin(db: Session) -> None:
    s = get_settings()
    if not s.admin_email or not s.admin_password:
        return
    existing = db.scalar(select(User).where(User.email == s.admin_email))
    if existing:
        return
    db.add(User(
        email=s.admin_email,
        callsign="Overseer",
        password_hash=hash_password(s.admin_password),
        role="overseer",
        caps_balance=999999,
        level=99,
    ))
    db.commit()


def run_seed(db: Session) -> None:
    get_settings_dict(db)  # materialize default settings
    seed_categories(db)
    seed_franchises(db)
    seed_admin(db)
