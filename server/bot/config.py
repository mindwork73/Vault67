from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class BotSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    telegram_bot_token: str = ""
    admin_telegram_ids: str = ""
    bot_api_key: str = ""
    api_base_url: str = "http://127.0.0.1:8090"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"

    @property
    def admin_ids(self) -> set[int]:
        return {int(p) for p in (self.admin_telegram_ids or "").replace(" ", "").split(",") if p.strip().isdigit()}


@lru_cache
def get_bot_settings() -> BotSettings:
    return BotSettings()
