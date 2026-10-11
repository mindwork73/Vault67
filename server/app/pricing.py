"""Pricing logic ported from @ConverterCSC_bot (/root/myenv/Converter.py).

CNY formula:
    K_cost   = usd_rub * overhead / usd_cny        (default 1.07 / 6.8)
    K_client = ceil(K_cost * client_margin / round_step) * round_step  (default 1.2, step 5)
    delivery = ceil(weight_g / weight_step_g) * shipping_per_100g
    cost_rub  = price_cny * K_cost   + delivery
    price_rub = price_cny * K_client + delivery
"""

import logging
import math
import time
import xml.etree.ElementTree as ET

import requests

log = logging.getLogger("vault67.pricing")

CBR_MIRROR = "https://www.cbr-xml-daily.ru/daily_json.js"
CBR_OFFICIAL = "https://www.cbr.ru/scripts/XML_daily.asp"
RATE_TTL = 3600.0
RATE_MAX_STALE = 86400.0

_session = requests.Session()
_session.headers.update({"User-Agent": "Vault67/1.0", "Connection": "keep-alive"})

_cache: float | None = None
_cache_mono: float = 0.0


def _fetch_mirror() -> float:
    last_exc: Exception | None = None
    for attempt in range(3):
        try:
            resp = _session.get(CBR_MIRROR, timeout=(5, 15))
            resp.raise_for_status()
            return float(resp.json()["Valute"]["USD"]["Value"])
        except Exception as exc:  # noqa: BLE001
            last_exc = exc
            log.warning("CBR mirror %d/3 failed: %s", attempt + 1, exc)
            if attempt < 2:
                time.sleep(1.5 * (attempt + 1))
    raise last_exc  # type: ignore[misc]


def _fetch_official() -> float:
    resp = _session.get(CBR_OFFICIAL, timeout=(5, 15))
    resp.raise_for_status()
    root = ET.fromstring(resp.content)
    for valute in root.findall("Valute"):
        if valute.findtext("CharCode") == "USD":
            nominal = int(valute.findtext("Nominal") or 1)
            value = float((valute.findtext("Value") or "").replace(",", "."))
            return value / nominal
    raise KeyError("USD not found in CBR XML")


def get_usd_rate() -> float:
    global _cache, _cache_mono
    now = time.monotonic()
    if _cache is not None and now - _cache_mono < RATE_TTL:
        return _cache
    try:
        rate = _fetch_mirror()
    except Exception:
        log.exception("CBR mirror unavailable, trying official cbr.ru")
        try:
            rate = _fetch_official()
        except Exception:
            log.exception("Both CBR sources failed")
            if _cache is not None and now - _cache_mono < RATE_MAX_STALE:
                return _cache
            raise
    _cache, _cache_mono = rate, now
    log.info("USD/RUB rate updated: %.4f", rate)
    return rate


DEFAULT_PRICING = {
    "usd_cny": 6.8,            # курс USD -> CNY (условный)
    "overhead": 1.07,          # +7% накладные
    "client_margin": 1.2,      # +20% наценка клиента
    "k_round_step": 5.0,       # округление коэффициента до ×5
    "weight_step_g": 100,      # шаг веса = 100 г
    "shipping_per_100g": 100.0,  # ₽ за каждые 100 г (согласовать!)
    "price_round_step": 1.0,   # округление итоговой цены до N ₽ (1 = без округления)
}


def _round_to(value: float, step: float) -> float:
    if step <= 1:
        return value
    return math.ceil(value / step) * step


def compute_pricing(price_cny: float, weight_g: int, params: dict | None = None) -> dict:
    p = {**DEFAULT_PRICING, **(params or {})}
    rate = get_usd_rate()

    k_cost = rate * float(p["overhead"]) / float(p["usd_cny"])
    k_client = math.ceil(k_cost * float(p["client_margin"]) / float(p["k_round_step"])) * float(p["k_round_step"])

    weight_step = max(1, int(p["weight_step_g"]))
    buckets = math.ceil(max(0, weight_g) / weight_step) if weight_g else 0
    delivery = buckets * float(p["shipping_per_100g"])

    cost_rub = _round_to(price_cny * k_cost + delivery, float(p["price_round_step"]))
    price_rub = _round_to(price_cny * k_client + delivery, float(p["price_round_step"]))

    return {
        "usd_rate": round(rate, 4),
        "k_cost": round(k_cost, 4),
        "k_client": round(k_client, 4),
        "delivery_fee_rub": round(delivery, 2),
        "cost_rub": round(cost_rub, 2),
        "price_rub": round(price_rub, 2),
        "weight_buckets": buckets,
        "params": p,
    }
