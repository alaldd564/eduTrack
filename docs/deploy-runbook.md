# Deploy Runbook

## 1. Prerequisites

- Python 3.13+ installed
- Node.js 20+ installed
- pnpm available (recommended for frontend)
- Workspace path: c:\dev\edu

## 2. Backend Setup (FastAPI)

### 2.1 Install dependencies

- Set working directory to `edu_backend`
- Install Python dependencies in your virtual environment

### 2.2 Database migration

- Ensure `DATABASE_URL` points to the intended DB file/instance
- Run Alembic upgrade to head

### 2.3 Run backend

- Start uvicorn with app-dir:
  - `python -m uvicorn app.main:app --app-dir c:/dev/edu/edu_backend --host 127.0.0.1 --port 4000`
- Verify health:
  - `GET http://127.0.0.1:4000/health` should return `{ "status": "ok" }`

## 3. Frontend Setup (Next.js)

### 3.1 Install dependencies

- Set working directory to `edu_frontend`
- Install packages with pnpm:
  - `pnpm install`

### 3.2 Quality gates

- Type check:
  - `npx tsc --noEmit`
- Lint:
  - `npm run lint`
- Build:
  - `npm run build`

### 3.3 Run frontend

- Development:
  - `npm run dev`
- If port conflict occurs, stop existing Next process:
  - `taskkill /PID <pid> /F`

## 4. Smoke Validation

- Create instructor account
- Upload one material
- Create one community post and one reply
- Create student account
- Link student with instructor code
- Verify bootstrap data for student
- Create one submission as student
- Update score/feedback as instructor

## 5. Troubleshooting

### 5.1 "no such column: users.display_name"

- Cause: DB schema out of sync with migration revision
- Action:
  - Confirm backend DB target path
  - Re-run migration against the same DB actually used by API

### 5.2 Student link succeeds but bootstrap returns 403

- Cause: stale token-only link check
- Action: use backend code version where link check reads current DB user state

### 5.3 Frontend `npm run dev` exits with code 1

- Cause: another Next dev server already running
- Action: stop existing process and rerun

## 6. Rollback Plan

- Keep previous successful deployment artifact/version tag
- Roll back backend deployment first if API regressions appear
- Roll back frontend deployment next if UI-only regression appears
- Re-run health and smoke checks after rollback
