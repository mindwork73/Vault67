import logging

import httpx

from .config import get_bot_settings

log = logging.getLogger("vault67.bot.translate")
s = get_bot_settings()

ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

PROMPT = """Ты контент-редактор интернет-магазина гик-товаров «Vault67» (стиль Fallout/Убежище, но текст современный и понятный).
Ниже — описание товара на китайском (иногда с мусором от продавца и ценами).
Сделай на русском:
1) Переведи и перепиши живо, информативно, без воды и без преувеличений.
2) ПОЛНОСТЬЮ УБЕРИ любые цены, скидки, промокоды, суммы, валюты, ссылки, контакты продавца и рекламные слоганы.
3) Сохрани важные факты: материал, размеры, комплектацию, особенности.
4) Структура: одно короткое вступление (1-2 предложения) + маркированный список характеристик, если есть что перечислить.
5) Максимум 900 символов. Без заголовка и без слова «Описание».
Верни ТОЛЬКО готовый текст описания.

Исходный текст:
{text}"""


def _call_gemini(prompt: str) -> str | None:
    if not s.gemini_api_key:
        return None
    url = ENDPOINT.format(model=s.gemini_model)
    try:
        resp = httpx.post(
            url,
            params={"key": s.gemini_api_key},
            json={"contents": [{"parts": [{"text": prompt}]}],
                  "generationConfig": {"temperature": 0.5, "maxOutputTokens": 2048}},
            timeout=60,
        )
        resp.raise_for_status()
        data = resp.json()
        parts = data["candidates"][0]["content"]["parts"]
        return "".join(p.get("text", "") for p in parts).strip()
    except Exception:  # noqa: BLE001
        log.exception("gemini translate failed")
        return None


def translate_description(text: str) -> tuple[str, bool]:
    """Return (text, translated?). Falls back to raw text when no key/error."""
    text = (text or "").strip()
    if not text:
        return "", False
    result = _call_gemini(PROMPT.format(text=text[:6000]))
    if result:
        return result, True
    return text, False
