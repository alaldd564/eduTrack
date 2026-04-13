# GitHub 快速上传指南 (Quick GitHub Upload Guide)

## 🔗 5분 안에 GitHub에 업로드하기

### 준비 사항
- GitHub 계정 (https://github.com)
- Git 설치 (Windows용 Git Bash 또는 기본 git)

---

## 📝 단계별 가이드

### 1단계: GitHub 저장소 생성
```
1. https://github.com/new 방문
2. Repository name: edu-platform
3. Public 선택 (Private도 가능)
4. "Create repository" 클릭
```

### 2단계: 로컬 설정
PowerShell에서 프로젝트 디렉토리로 들어가 실행:

```powershell
cd c:\dev\edu

# Git 초기 설정 (처음 1회만)
git config --global user.name "Your Name"
git config --global user.email "your.email@github.com"

# 저장소 초기화
git init
```

### 3단계: 파일 추가 및 커밋
```powershell
# 모든 파일 스테이징
git add .

# 커밋
git commit -m "Initial commit: edu platform with FastAPI backend and Next.js frontend"

# 브랜치명 변경 (기본값: master → main)
git branch -M main
```

### 4단계: GitHub와 연결
```powershell
# YOUR_USERNAME을 실제 GitHub 사용자명으로 변경
git remote add origin https://github.com/YOUR_USERNAME/edu-platform.git

# GitHub에 업로드
git push -u origin main
```

### 5단계: 확인
- https://github.com/YOUR_USERNAME/edu-platform 방문
- 파일들이 정상 업로드되었는지 확인

---

## 🔄 이후 업데이트 방법
```powershell
git add .
git commit -m "Update description here"
git push origin main
```

---

## ⚙️ 추가 설정 (선택사항)

### SSH 키 설정 (비밀번호 입력 생략)
1. PowerShell 관리자 권한으로 실행
2. `ssh-keygen -t ed25519 -C "your.email@github.com"`
3. GitHub Settings → SSH and GPG keys → New SSH key
4. 공개 키 복사 및 추가

### 2factor authentication (2FA) 설정
1. GitHub Settings → Security
2. "Enable two-factor authentication" 클릭
3. 휴대폰 앱 설정 후 저장

---

## 📋 체크리스트
- [ ] GitHub 계정 생성
- [ ] 저장소 생성 완료
- [ ] .gitignore 파일 생성됨
- [ ] git add . 실행
- [ ] git commit 실행
- [ ] git remote add 실행
- [ ] git push 실행
- [ ] GitHub에서 파일 확인

---

## 🆘 문제 해결

### "fatal: not a git repository"
```powershell
# 해결: 프로젝트 디렉토리에서 git init 실행
git init
```

### "error: src refspec main does not match any"
```powershell
# 해결: 커밋이 없을 때의 오류, 먼저 커밋 실행
git add .
git commit -m "Initial commit"
```

### "Permission denied (publickey)"
```powershell
# SSH 키 재설정 필요 - Windows Credentials 제거 후 재시도
# 또는 HTTPS 사용:
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/edu-platform.git
```

---

## 📚 유용한 Git 명령어
```powershell
# 현재 상태 확인
git status

# 변경사항 보기
git diff

# 최근 커밋 보기
git log --oneline

# 특정 파일만 추가
git add filename.txt

# 커밋 메시지 수정 (직전 커밋만)
git commit --amend -m "New message"

# 원격 저장소 확인
git remote -v
```
