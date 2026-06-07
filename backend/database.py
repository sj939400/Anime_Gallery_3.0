import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# Replace with your actual MongoDB URI (local or cloud)
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URI)
db = client["animenexus_db"]

# Collections
users_collection = db["users"]
collections_collection = db["collections"]