import re
import secrets
import unicodedata

_TRANSLIT = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e",
    "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
    "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
    "ф": "f", "х": "h", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "sch", "ъ": "",
    "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
}


def slugify(value: str, max_len: int = 60) -> str:
    value = value.strip().lower()
    out = []
    for ch in value:
        if ch in _TRANSLIT:
            out.append(_TRANSLIT[ch])
        elif ch.isalnum() and ord(ch) < 128:
            out.append(ch)
        else:
            out.append("-")
    slug = re.sub(r"-+", "-", "".join(out)).strip("-")
    slug = slug[:max_len].strip("-")
    return slug or "item"


def unique_slug(base: str, exists) -> str:
    """`exists` is a callable(slug)->bool."""
    slug = slugify(base)
    if not exists(slug):
        return slug
    for _ in range(6):
        candidate = f"{slug}-{secrets.token_hex(2)}"
        if not exists(candidate):
            return candidate
    return f"{slug}-{secrets.token_hex(4)}"


def order_number() -> str:
    return f"V67-{secrets.randbelow(900000) + 100000}"


def normalize_theme(value: str) -> str:
    value = unicodedata.normalize("NFKC", value or "").strip().lower()
    mapping = {
        "аниме": "anime", "anime": "anime",
        "игры": "games", "игра": "games", "games": "games", "game": "games",
        "фильмы": "films", "кино": "films", "films": "films", "movies": "films",
        "комиксы": "comics", "comics": "comics",
    }
    return mapping.get(value, "other")
