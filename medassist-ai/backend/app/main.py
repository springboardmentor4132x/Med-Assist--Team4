import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from . import models  # noqa: F401  (registers tables)
from .config import ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD, CORS_ORIGINS
from .database import Base, SessionLocal, engine
from .models import User
from .routers import access, admin, auth, history, users
from .security import hash_password

log = logging.getLogger("medassist")


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)  # creates tables on first run
    with SessionLocal() as db:
        if not db.execute(select(User.id).where(User.email == ADMIN_EMAIL.lower())).first():
            db.add(
                User(
                    full_name=ADMIN_NAME,
                    email=ADMIN_EMAIL.lower(),
                    hashed_password=hash_password(ADMIN_PASSWORD),
                    age=30,
                    gender="other",
                    role="admin",
                )
            )
            db.commit()
            log.warning("Default admin created: %s", ADMIN_EMAIL)
    yield


app = FastAPI(title="MedAssist AI - User Management", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (auth.router, users.router, history.router, access.router, admin.router):
    app.include_router(r)


@app.get("/api/health", tags=["System"])
def health():
    return {"status": "ok"}
