import os


def get_database_url() -> str:
    raw = os.getenv("DATABASE_URL", "sqlite:///./edu.db")

    # Render often provides postgres:// URLs; SQLAlchemy with psycopg needs postgresql+psycopg://
    if raw.startswith("postgres://"):
        return raw.replace("postgres://", "postgresql+psycopg://", 1)

    if raw.startswith("postgresql://") and "+psycopg" not in raw:
        return raw.replace("postgresql://", "postgresql+psycopg://", 1)

    return raw


def get_cors_origins() -> list[str]:
    # Comma-separated origins. Backward compatible with CORS_ORIGIN.
    origins = os.getenv("CORS_ORIGINS") or os.getenv("CORS_ORIGIN") or (
        "http://localhost:3000,http://127.0.0.1:3000,"
        "http://localhost:3001,http://127.0.0.1:3001"
    )
    return [origin.strip() for origin in origins.split(",") if origin.strip()]


def should_auto_create_tables() -> bool:
    return os.getenv("AUTO_CREATE_TABLES", "true").lower() == "true"


def should_seed_on_startup() -> bool:
    return os.getenv("SEED_ON_STARTUP", "true").lower() == "true"


def get_jwt_secret() -> str:
    return os.getenv("JWT_SECRET", "dev-only-secret-change-in-production")


def get_jwt_expires_minutes() -> int:
    value = os.getenv("JWT_EXPIRES_MINUTES", "120")
    try:
        return max(int(value), 1)
    except ValueError:
        return 120
