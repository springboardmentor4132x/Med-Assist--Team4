import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+psycopg2://postgres:postgres@localhost:5432/medassist"
)
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")]

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@medassist.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin@12345")
ADMIN_NAME = os.getenv("ADMIN_NAME", "System Admin")
