from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8)
    age: int = Field(gt=0)
    gender: str | None = None
    contact: str | None = None
class UserLogin(BaseModel):
    email: EmailStr
    password: str