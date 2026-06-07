from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

app = FastAPI()

# MongoDB setup
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client["animenexus_db"]
users_col = db["users"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(BaseModel):
    email: EmailStr
    password: str
    phone: str = Field(pattern=r"^\d{10}$")

@app.post("/api/register")
async def register(user: User):
    if await users_col.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    await users_col.insert_one(user.model_dump())
    return {"message": "Success"}

@app.post("/api/login")
async def login(data: dict):
    user = await users_col.find_one({"email": data["email"], "password": data["password"]})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"email": user["email"]}