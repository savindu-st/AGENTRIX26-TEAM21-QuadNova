import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "PrajaNavigator AI"
    DATABASE_URL: str = "sqlite:///./prajanavigator.db"
    GEMINI_API_KEY: Optional[str] = None
    
    # Allows reading settings from .env file
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

