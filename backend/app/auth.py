"""DEV STAND-IN for the team's real authentication module (JWT + RBAC).
Replace this file with the real one; medical_history only needs get_current_user() -> object with .id, .role, .name."""
import os, time
from dataclasses import dataclass
import jwt
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")


@dataclass
class User:
    id: int
    role: str
    name: str


USERS = {"patient": User(1, "patient", "Priya Nair"), "doctor": User(2, "doctor", "Dr. Arjun Shetty"), "admin": User(3, "admin", "Admin")}
bearer = HTTPBearer(auto_error=False)
router = APIRouter(prefix="/auth", tags=["dev-auth"])


@router.post("/dev-login")
def dev_login(role: str):
    u = USERS.get(role)
    if not u:
        raise HTTPException(404, "Unknown role")
    token = jwt.encode({"sub": str(u.id), "role": u.role, "name": u.name, "exp": int(time.time()) + 86400}, SECRET, "HS256")
    return {"token": token, "user": {"id": u.id, "role": u.role, "name": u.name}}


def get_current_user(cred: HTTPAuthorizationCredentials | None = Depends(bearer)) -> User:
    if not cred:
        raise HTTPException(401, "Not signed in")
    try:
        p = jwt.decode(cred.credentials, SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(401, "Session expired. Please sign in again.")
    return User(int(p["sub"]), p["role"], p["name"])
