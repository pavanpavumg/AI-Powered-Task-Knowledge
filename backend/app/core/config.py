from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered Task Knowledge Management System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "SUPER_SECRET_KEY_FOR_JWT_TOKEN_123!@#"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # 60 minutes as per spec

    # Database Configuration (MySQL)
    DATABASE_URL: str = "mysql+pymysql://root:rootpassword@localhost:3306/tasks_db"
    
    # Storage Configuration
    UPLOAD_DIR: str = "uploads"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()
