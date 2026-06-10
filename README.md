# AnimeNexus

A fast, interactive web application for anime and manga fans to discover new series and manage their personal collections.

## 🌟 Key Features
* **Explore & Search:** Find trending anime, manga, and characters using the real-time search bar.
* **Personal Vault:** Save your favorite items to custom collections (Requires Sign-In).
* **User Profiles:** Customize your display name, bio, location, and upload a profile picture.
* **Dark/Light Mode:** Instantly toggle the website's theme with a single click.
* **Secure Access:** Built-in user registration and login system.

## 🛠️ Tech Stack
* **Frontend:** React.js, Tailwind CSS, Vite
* **Backend:** Python, FastAPI
* **Database:** MongoDB

## 🚀 How to Run Locally

### 1. Start the Backend
*Ensure MongoDB is installed and running on your computer (port 27017).*

    cd backend
    pip install fastapi uvicorn motor pydantic
    uvicorn main:app --reload

### 2. Start the Frontend
*Open a new terminal window for this step.*

    npm install
    npm run dev

---
*Built with ❤️ for Anime fans.*
