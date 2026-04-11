# edu_backend (FastAPI + SQLAlchemy + Alembic)

## 1) Install

```powershell
C:/Users/kimbr/AppData/Local/Programs/Python/Python313/python.exe -m pip install -r requirements.txt
```

## 2) Environment

Copy `.env.example` to `.env` and edit values.

Key values:

- `DATABASE_URL`
  - SQLite: `sqlite:///./edu.db`
  - PostgreSQL: `postgresql+psycopg://postgres:postgres@localhost:5432/edu`
- `AUTO_CREATE_TABLES`
  - `true`: startup creates tables from ORM models
  - `false`: disable startup DDL (recommended with Alembic)
- `SEED_ON_STARTUP`
  - `true`: inserts sample data if empty
  - `false`: no seed on startup

## 3) Migration (Alembic)

```powershell
# Apply all migrations
C:/Users/kimbr/AppData/Local/Programs/Python/Python313/python.exe -m alembic -c alembic.ini upgrade head

# Create a new migration revision
C:/Users/kimbr/AppData/Local/Programs/Python/Python313/python.exe -m alembic -c alembic.ini revision -m "message"
```

## 4) Run API

```powershell
C:/Users/kimbr/AppData/Local/Programs/Python/Python313/python.exe -m uvicorn app.main:app --app-dir c:/dev/edu/edu_backend --host 127.0.0.1 --port 4000
```

## 5) Deploy on Render

The repository root has `render.yaml` that defines:

- PostgreSQL database (`edu-postgres`)
- Backend web service (`edu-backend`)
- Frontend web service (`edu-frontend`)

After creating services from Blueprint, set these environment variables:

1. Backend `CORS_ORIGINS`
  - Example: `https://edu-frontend.onrender.com,http://localhost:3000`
2. Frontend `NEXT_PUBLIC_API_BASE_URL`
  - Example: `https://edu-backend.onrender.com`
3. Backend `JWT_SECRET`
  - Use a strong random secret in production.
4. Backend/Frontend demo credentials for current auth flow
  - `INSTRUCTOR_USERNAME`, `INSTRUCTOR_PASSWORD`
  - `STUDENT_USERNAME`, `STUDENT_PASSWORD`
  - `NEXT_PUBLIC_INSTRUCTOR_USERNAME`, `NEXT_PUBLIC_INSTRUCTOR_PASSWORD`
  - `NEXT_PUBLIC_STUDENT_USERNAME`, `NEXT_PUBLIC_STUDENT_PASSWORD`

Production recommendation:

- `AUTO_CREATE_TABLES=false`
- `SEED_ON_STARTUP=false`
- Schema changes via Alembic migration only
- Replace username/password login with real auth provider (OIDC/Auth0/Clerk, etc.) before launch

## 6) Auth Flow

Current implementation supports role-based signup/login:

- `POST /api/auth/signup`
  - role=`instructor`: issues unique `instructorCode`
  - role=`student`: creates student profile and account
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/link-instructor` (student only)

Student users must link to an instructor code before accessing dashboard data.
