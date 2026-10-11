import logging

import requests

from .config import get_settings

log = logging.getLogger("vault67.notify")


def send_telegram(text: str, chat_id: int | str) -> bool:
    s = get_settings()
    if not s.telegram_bot_token:
        return False
    try:
        resp = requests.post(
            f"https://api.telegram.org/bot{s.telegram_bot_token}/sendMessage",
            json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"},
            timeout=8,
        )
        return resp.ok
    except Exception:  # noqa: BLE001
        log.exception("telegram send failed")
        return False


def notify_admins(text: str) -> None:
    for admin_id in get_settings().admin_ids:
        send_telegram(text, admin_id)
