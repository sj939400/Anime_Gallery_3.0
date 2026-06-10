from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel

app = FastAPI()

client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client["animenexus_db"]
users_col = db["users"]
vault_col = db["vault"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(BaseModel):
    email: str
    password: str
    phone: str = ""

class VaultItem(BaseModel):
    user_email: str
    anime_id: int
    title: str
    img_url: str
    collection_name: str = "Favorites" 

class UserUpdate(BaseModel):
    username: str = ""
    phone: str = ""
    bio: str = ""
    location: str = ""
    profile_pic: str = "" # Added Profile Picture URL

@app.post("/api/register")
async def register(user: User):
    if await users_col.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    await users_col.insert_one(user.model_dump())
    return {"message": "Success"}

@app.post("/api/login")
async def login(data: dict):
    user = await users_col.find_one({
        "email": data.get("email"), 
        "password": data.get("password")
    })
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"email": user["email"]}

@app.get("/api/user/{email}")
async def get_user_profile(email: str):
    user = await users_col.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "email": user["email"],
        "phone": user.get("phone", ""),
        "username": user.get("username", ""),
        "bio": user.get("bio", ""),
        "location": user.get("location", ""),
        "profile_pic": user.get("profile_pic", "") # Return Profile Pic
    }

@app.put("/api/user/{email}")
async def update_user_profile(email: str, data: UserUpdate):
    result = await users_col.update_one(
        {"email": email},
        {"$set": {
            "phone": data.phone, 
            "username": data.username,
            "bio": data.bio,
            "location": data.location,
            "profile_pic": data.profile_pic # Save Profile Pic
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Profile updated successfully"}

@app.post("/api/vault/add")
async def add_to_vault(item: VaultItem):
    existing = await vault_col.find_one({
        "user_email": item.user_email, 
        "anime_id": item.anime_id,
        "collection_name": item.collection_name
    })
    if existing:
        raise HTTPException(status_code=400, detail=f"Anime already in {item.collection_name}")
    await vault_col.insert_one(item.model_dump())
    return {"message": f"Added to {item.collection_name}"}

@app.get("/api/vault/collections/{user_email}")
async def get_user_collections(user_email: str):
    collections = await vault_col.distinct("collection_name", {"user_email": user_email})
    return collections

@app.get("/api/vault/{user_email}")
async def get_vault(user_email: str):
    cursor = vault_col.find({"user_email": user_email})
    items = await cursor.to_list(length=200) 
    for item in items:
        item["_id"] = str(item["_id"])
    return items

@app.delete("/api/vault/remove/{user_email}/{collection_name}/{anime_id}")
async def remove_from_vault(user_email: str, collection_name: str, anime_id: int):
    result = await vault_col.delete_one({
        "user_email": user_email, 
        "collection_name": collection_name,
        "anime_id": anime_id
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Anime not found in this collection")
    return {"message": "Removed successfully"}