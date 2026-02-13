import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(ENV_PATH)


@dataclass(frozen=True)
class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "")
    ENV: str = os.getenv("ENV", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ADMIN_API_KEY: str = os.getenv("ADMIN_API_KEY", "")


settings = Settings()
