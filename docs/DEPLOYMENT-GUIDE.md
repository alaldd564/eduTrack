# 🚀 배포 가이드 (GitHub, Vercel, Render)

## 📊 Render vs Vercel 비교

| 항목 | Vercel | Render |
|------|--------|--------|
| **프론트엔드** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **백엔드** | 불가능 | ⭐⭐⭐⭐ |
| **DB** | 별도 필요 | PostgreSQL 포함 |
| **자동 배포** | Git 연동 | Git 연동 |
| **무료 계정** | ✅ | ✅ |

### 🎯 추천: 하이브리드 배포
- **프론트엔드**: Vercel (Next.js 최적화)
- **백엔드**: Render (FastAPI + PostgreSQL)

---

## ✅ 1단계: GitHub 업로드

### 1.1 GitHub 저장소 생성
1. https://github.com/new 방문
2. Repository name: `edu-platform`
3. Public 선택
4. Create repository

### 1.2 로컬에서 Git 설정
```powershell
cd c:\dev\edu
git init
git config user.name "Your Name"
git config user.email "your.email@github.com"
```

### 1.3 첫 커밋 및 푸시
```powershell
git add .
git commit -m "Initial commit: edu platform with FastAPI backend and Next.js frontend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/edu-platform.git
git push -u origin main
```

---

## 🌐 2단계: 프론트엔드 배포 (Vercel)

### 2.1 Vercel 배포
1. https://vercel.com/new 방문 (GitHub 계정으로 로그인)
2. Import Git Repository → 저장소 선택
3. Framework Preset: Next.js (자동 감지)
4. Root Directory: `edu_frontend`
5. Environment Variables 설정:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```
6. Deploy 클릭

### 2.2 배포 후 확인
- URL: https://your-project.vercel.app
- 자동 배포 설정됨 (git push 시 자동 배포)

---

## 🔧 3단계: 백엔드 배포 (Render)

### 3.1 Render 배포 준비

#### 3.1.1 필수 파일 생성

**`edu_backend/runtime.txt`**
```
python-3.13
```

**`edu_backend/Procfile`**
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**`.env.render`** (참고용, 실제 값은 Render에서 설정)
```
DATABASE_URL=postgresql://user:password@hostname/dbname
ALLOWED_ORIGINS=https://your-project.vercel.app,http://localhost:3000
```

### 3.2 Render 배포
1. https://dashboard.render.com/blueprints 방문 (GitHub 연결)
2. New Blueprint → GitHub 저장소 선택
3. `render.yaml` 생성 또는 수동 설정:

**`render.yaml` 예시:**
```yaml
services:
  - type: web
    name: edu-backend
    runtime: python
    buildCommand: cd edu_backend && pip install -r requirements.txt
    startCommand: cd edu_backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        scope: service
        value: postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}
      - key: ALLOWED_ORIGINS
        value: https://your-project.vercel.app
  
  - type: pserv
    name: edu-db
    plan: starter
    dbName: edu_db
    user: edu_user
```

### 3.3 수동 배포 (render.yaml 없을 경우)
1. https://dashboard.render.com 방문
2. New + → Web Service
3. Deploy existing repository 선택 → GitHub 계정 연결
4. Repository: `your-username/edu-platform`
5. Settings:
   - Name: `edu-backend`
   - Runtime: `Python 3`
   - Build Command: `cd edu_backend && pip install -r requirements.txt && alembic upgrade head`
   - Start Command: `cd edu_backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Instance Type: Free (처음엔 이것)
6. Environment Variables 추가:
   ```
   DATABASE_URL=postgresql://...
   ALLOWED_ORIGINS=https://your-project.vercel.app,http://localhost:3000
   ```
7. Create Web Service

### 3.4 PostgreSQL 연결
1. Render 대시보드 → New + → PostgreSQL
2. Name: `edu-db`
3. Database: `edu_db`
4. User: `edu_user`
5. 생성 후 CONNECTION STRING 복사
6. `DATABASE_URL` 환경변수로 설정

---

## 📝 4단계: 환경 변수 설정

### Vercel (프론트엔드)
Settings → Environment Variables
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### Render (백엔드)
Dashboard → Web Service → Environment
```
DATABASE_URL=postgresql://user:pass@db.onrender.com:5432/edu_db
ALLOWED_ORIGINS=https://your-project.vercel.app,http://localhost:3000
DEBUG=false
JWT_SECRET=your-secret-key-here
```

---

## ✨ 5단계: 최종 체크리스트

### 배포 전
- [ ] `.gitignore` 파일 생성 (민감한 파일 제외)
- [ ] `.env` 파일이 .gitignore에 포함됨
- [ ] `requirements.txt` 최신화
- [ ] `package.json` 최신화
- [ ] 로컬에서 빌드 테스트: `npm run build` (frontend)
- [ ] 로컬에서 백엔드 테스트: `python -m uvicorn app.main:app`

### 배포 후
- [ ] Vercel 프론트엔드 정상 로드
- [ ] API 호출 테스트 (`/health`)
- [ ] 로그인/가입 기능 테스트
- [ ] 데이터베이스 연결 확인
- [ ] 환경 변수 모두 설정 확인

---

## 🔒 보안 팁

### GitHub
```bash
# 민감한 파일은 절대 커밋하지 말기
# .gitignore 확인:
# - .env 파일
# - __pycache__/
# - node_modules/
# - .vscode/
```

### 배포
- Render/Vercel에서만 환경 변수 관리
- JWT_SECRET은 강력한 값으로 설정
- GitHub에서 민감한 정보 노출 금지
- CORS 설정으로 허가된 도메인만 접근

---

## 🐛 배포 후 문제 해결

### "ModuleNotFoundError: No module named app"
→ Backend root 디렉토리 확인, `PYTHONPATH` 설정

### "CORS 오류"
→ `ALLOWED_ORIGINS` 환경변수 확인

### "503 Service Unavailable"
→ Render 무료 계정은 15분 유휴 시 대기 상태, 재시작 필요

### "데이터베이스 연결 실패"
→ `DATABASE_URL` 형식 확인, PostgreSQL 인스턴스 실행 확인

---

## 📞 배포된 URL 예시
- **Frontend**: https://edu-platform.vercel.app
- **Backend**: https://edu-backend.onrender.com
- **API 요청**: `https://edu-backend.onrender.com/health`

---

## 🔄 자동 배포 설정
Git push 시 자동으로:
1. Vercel: 프론트엔드 자동 빌드 및 배포
2. Render: 백엔드 자동 빌드 및 배포
