from datetime import datetime, timedelta, timezone
from typing import Literal

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import get_jwt_expires_minutes, get_jwt_secret

Role = Literal["instructor", "student"]

security = HTTPBearer(auto_error=False)


def create_access_token(
    user_id: int,
    username: str,
    role: Role,
    student_id: str | None = None,
    instructor_code: str | None = None,
    linked_instructor_code: str | None = None,
) -> str:
    expire_at = datetime.now(timezone.utc) + timedelta(minutes=get_jwt_expires_minutes())
    payload = {
        "uid": user_id,
        "sub": username,
        "role": role,
        "studentId": student_id,
        "instructorCode": instructor_code,
        "linkedInstructorCode": linked_instructor_code,
        "exp": expire_at,
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm="HS256")


def _decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, get_jwt_secret(), algorithms=["HS256"])
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    payload = _decode_token(credentials.credentials)
    user_id = payload.get("uid")
    username = payload.get("sub")
    role = payload.get("role")

    if not user_id or not username or role not in {"instructor", "student"}:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    return {
        "id": user_id,
        "username": username,
        "role": role,
        "studentId": payload.get("studentId"),
        "instructorCode": payload.get("instructorCode"),
        "linkedInstructorCode": payload.get("linkedInstructorCode"),
    }


def require_instructor(user: dict = Depends(get_current_user)) -> dict:
    if user["role"] != "instructor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Instructor role required",
        )
    return user


def require_student(user: dict = Depends(get_current_user)) -> dict:
    if user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student role required",
        )
    return user
