from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./vault67.db"

    secret_key: str = "change-me-in-prod"
    access_token_expire_minutes: int = 60 * 24 * 7
    algorithm: str = "HS256"

    public_base_url: str = "https://vault67.ru"
    upload_dir: str = "./uploads"
    upload_url_prefix: str = "/uploads"

    geocoder: str = "nominatim"
    dadata_api_key: str = ""

    telegram_bot_token: str = ""
    admin_telegram_ids: str = ""
    bot_api_key: str = ""

    gemini_api_key: str = ""

    admin_email: str = ""
    admin_password: str = ""

    @property
    def admin_ids(self) -> set[int]:
        ids: set[int] = set()
        for part in self.admin_telegram_ids.split(","):
            part = part.strip()
            if part.isdigit():
                ids.add(int(part))
        return ids


@lru_cache
def get_settings() -> Settings:
    return Settings()
