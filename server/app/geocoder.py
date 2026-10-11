import logging

import requests

from .config import get_settings

log = logging.getLogger("vault67.geo")


def _nominatim(q: str, limit: int) -> list[dict]:
    resp = requests.get(
        "https://nominatim.openstreetmap.org/search",
        params={"q": q, "format": "jsonv2", "addressdetails": 1, "limit": limit, "accept-language": "ru"},
        headers={"User-Agent": "Vault67/1.0 (https://vault67.ru)"},
        timeout=10,
    )
    resp.raise_for_status()
    out = []
    for item in resp.json():
        a = item.get("address", {})
        out.append({
            "label": item.get("display_name"),
            "region": a.get("state") or a.get("region") or a.get("province"),
            "city": a.get("city") or a.get("town") or a.get("village") or a.get("hamlet"),
            "street": a.get("road"),
            "building": a.get("house_number"),
            "apartment": None,
            "postal_code": a.get("postcode"),
            "lat": float(item["lat"]) if item.get("lat") else None,
            "lon": float(item["lon"]) if item.get("lon") else None,
        })
    return out


def _photon(q: str, limit: int) -> list[dict]:
    resp = requests.get(
        "https://photon.komoot.io/api/",
        params={"q": q, "limit": limit, "lang": "ru"},
        timeout=10,
    )
    resp.raise_for_status()
    out = []
    for f in resp.json().get("features", []):
        p = f.get("properties", {})
        coords = f.get("geometry", {}).get("coordinates", [None, None])
        parts = [p.get("name"), p.get("street"), p.get("housenumber"), p.get("city"), p.get("state"), p.get("country")]
        out.append({
            "label": ", ".join([x for x in parts if x]),
            "region": p.get("state"),
            "city": p.get("city"),
            "street": p.get("street"),
            "building": p.get("housenumber"),
            "apartment": None,
            "postal_code": p.get("postcode"),
            "lat": coords[1],
            "lon": coords[0],
        })
    return out


def _dadata(q: str, limit: int) -> list[dict]:
    s = get_settings()
    resp = requests.post(
        "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
        headers={"Authorization": f"Token {s.dadata_api_key}", "Content-Type": "application/json"},
        json={"query": q, "count": limit},
        timeout=10,
    )
    resp.raise_for_status()
    out = []
    for item in resp.json().get("suggestions", []):
        d = item.get("data", {})
        out.append({
            "label": item.get("value"),
            "region": d.get("region_with_type"),
            "city": d.get("city_with_type") or d.get("settlement_with_type"),
            "street": d.get("street_with_type"),
            "building": d.get("house"),
            "apartment": d.get("flat"),
            "postal_code": d.get("postal_code"),
            "lat": float(d["geo_lat"]) if d.get("geo_lat") else None,
            "lon": float(d["geo_lon"]) if d.get("geo_lon") else None,
        })
    return out


def geocode(q: str, limit: int = 6) -> list[dict]:
    q = (q or "").strip()
    if not q:
        return []
    s = get_settings()
    providers = []
    if s.dadata_api_key:
        providers.append(_dadata)
    if s.geocoder == "photon":
        providers.extend([_photon, _nominatim])
    else:
        providers.extend([_nominatim, _photon])
    for provider in providers:
        try:
            results = provider(q, limit)
            if results:
                return results
        except Exception:  # noqa: BLE001
            log.exception("geocoder %s failed", provider.__name__)
    return []
