import logging

import httpx

from .config import get_bot_settings

log = logging.getLogger("vault67.bot.api")
s = get_bot_settings()


class ApiError(Exception):
    pass


class VaultApi:
    def __init__(self, base_url: str | None = None, api_key: str | None = None):
        self.base = (base_url or s.api_base_url).rstrip("/")
        self.key = api_key or s.bot_api_key

    @property
    def headers(self) -> dict:
        return {"X-API-Key": self.key}

    def _url(self, path: str) -> str:
        return f"{self.base}/api{path}"

    def _check(self, resp: httpx.Response):
        if resp.status_code >= 400:
            try:
                detail = resp.json().get("detail")
            except Exception:  # noqa: BLE001
                detail = resp.text
            raise ApiError(f"{resp.status_code}: {detail}")
        return resp.json()

    def categories(self) -> list[dict]:
        with httpx.Client(timeout=15) as c:
            return self._check(c.get(self._url("/categories")))

    def franchises(self) -> list[dict]:
        with httpx.Client(timeout=15) as c:
            return self._check(c.get(self._url("/franchises")))

    def price_preview(self, price_cny: float, weight_g: int) -> dict:
        with httpx.Client(timeout=20) as c:
            return self._check(c.post(self._url("/products/price-preview"), headers=self.headers,
                                      json={"price_cny": price_cny, "weight_g": weight_g}))

    def upload(self, filename: str, content: bytes, content_type: str) -> dict:
        with httpx.Client(timeout=60) as c:
            return self._check(c.post(self._url("/uploads"), headers=self.headers,
                                      files={"file": (filename, content, content_type)}))

    def create_product(self, payload: dict) -> dict:
        with httpx.Client(timeout=30) as c:
            return self._check(c.post(self._url("/products"), headers=self.headers, json=payload))

    def create_category(self, payload: dict) -> dict:
        with httpx.Client(timeout=15) as c:
            return self._check(c.post(self._url("/categories"), headers=self.headers, json=payload))

    def create_franchise(self, payload: dict) -> dict:
        with httpx.Client(timeout=15) as c:
            return self._check(c.post(self._url("/franchises"), headers=self.headers, json=payload))


api = VaultApi()
