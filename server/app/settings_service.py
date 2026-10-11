from sqlalchemy.orm import Session

from .config import get_settings
from .models import Setting

settings = get_settings()

_DEFAULT_SETTINGS = {
    "pricing": {
        "usd_cny": 6.8,
        "overhead": 1.07,
        "client_margin": 1.2,
        "k_round_step": 5.0,
        "weight_step_g": 100,
        "shipping_per_100g": 100.0,
        "price_round_step": 1.0,
    },
    "store": {
        "announcement": "ВНИМАНИЕ: Караваны «Красной Ракеты» доставляют заказы в штатном режиме.",
        "announcementActive": True,
        "minOrderRub": 500,
        "caravanFeeRub": 0,
    },
}


def _import_json():
    import json

    return json


def get_settings_dict(db: Session) -> dict:
    json = _import_json()
    result: dict = {}
    for key, default in _DEFAULT_SETTINGS.items():
        row = db.get(Setting, key)
        if row:
            try:
                value = json.loads(row.value)
            except Exception:
                value = default
            merged = {**default, **value} if isinstance(value, dict) else value
        else:
            merged = default
            db.add(Setting(key=key, value=json.dumps(default)))
        result[key] = merged
    db.commit()
    return result


def update_settings(db: Session, patch: dict) -> dict:
    json = _import_json()
    current = get_settings_dict(db)
    for key, value in patch.items():
        if key in current and isinstance(current[key], dict) and isinstance(value, dict):
            merged = {**current[key], **value}
        else:
            merged = value
        row = db.get(Setting, key)
        if row:
            row.value = json.dumps(merged)
        else:
            db.add(Setting(key=key, value=json.dumps(merged)))
    db.commit()
    return get_settings_dict(db)
