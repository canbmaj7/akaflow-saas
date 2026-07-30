from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

REPO_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    SUPABASE_URL: str
    SUPABASE_PUBLISHABLE_KEY: str
    SUPABASE_SECRET_KEY: str | None = None
    SUPABASE_JWT_SECRET: str | None = None
    CORS_ALLOWED_ORIGINS: str = "http://localhost:3000"
    CORS_ALLOWED_ORIGIN_REGEX: str = r"https://.*\.vercel\.app"
    API_V1_PREFIX: str = "/api/v1"

    GOOGLE_API_KEY: str | None = None
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM: str | None = None
    REMINDER_DAYS_BEFORE: int = 3
    REMINDER_CRON_HOUR: int = 8
    ENABLE_SCHEDULER: bool = True
    GEMINI_MODEL: str = "gemini-2.5-flash"
    DATABASE_URL: str | None = None
    MODEL_PATH: str = str(REPO_ROOT / "models" / "final_logistic_model_v2.pkl")
    THRESHOLD_PATH: str = str(REPO_ROOT / "data" / "final_logistic_threshold_v2.json")

    TEST_USER_A_EMAIL: str | None = None
    TEST_USER_A_PASSWORD: str | None = None
    TEST_USER_B_EMAIL: str | None = None
    TEST_USER_B_PASSWORD: str | None = None


settings = Settings()
