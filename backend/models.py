from pydantic import BaseModel, EmailStr, Field

class UserRegisterSchema(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: str = Field(..., min_length=10, max_length=10, pattern=r"^\d{10}$")

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

class CollectionItemSchema(BaseModel):
    user_email: EmailStr
    anime_id: int
    title: str
    eps_watched: str
    status: str
    img_url: str