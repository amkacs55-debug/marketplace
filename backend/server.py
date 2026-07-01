from dotenv import load_dotenv
load_dotenv()

import os
import re
import uuid
import base64
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Annotated
from contextlib import asynccontextmanager

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, BeforeValidator
from motor.motor_asyncio import AsyncIOMotorClient

# ---------------- Cloudinary (optional) ----------------
try:
    import cloudinary
    import cloudinary.uploader
    _CLD_OK = bool(os.environ.get("CLOUDINARY_CLOUD_NAME"))
    if _CLD_OK:
        cloudinary.config(
            cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
            api_key=os.environ.get("CLOUDINARY_API_KEY"),
            api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
            secure=True,
        )
except Exception:
    _CLD_OK = False

# ---------------- Config ----------------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = "HS256"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ---------------- Utils ----------------
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(p: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(p.encode("utf-8"), h.encode("utf-8"))
    except Exception:
        return False

def create_token(user_id: str, username: str, role: str, days: int = 7) -> str:
    payload = {
        "sub": user_id,
        "username": username,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=days),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def slugify(t: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")[:80] or uuid.uuid4().hex[:8]

# ---------------- Auth Dependency ----------------
async def get_current_user(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    token = None
    if auth.startswith("Bearer "):
        token = auth[7:]
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    user.pop("password_hash", None)
    user.pop("_id", None)
    return user

def require_role(*roles):
    async def _dep(user: dict = Depends(get_current_user)):
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user
    return _dep

# ---------------- Models ----------------
class LoginIn(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: str
    username: str
    role: str
    created_at: str

class GameOut(BaseModel):
    id: str
    slug: str
    name: str
    tagline: str
    color: str
    hero_image: str
    stats: dict

class PostIn(BaseModel):
    title: str
    description: str
    price: float
    phone: Optional[str] = ""
    facebook: Optional[str] = ""
    game_slug: str
    category: Optional[str] = "general"
    group: Optional[str] = "300K-900K"   # 300K-900K | 901K-1.5M | 1.6M-15M
    images: List[str] = []               # cloudinary or data urls
    status: str = "published"            # draft | published

class PostUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    phone: Optional[str] = None
    facebook: Optional[str] = None
    game_slug: Optional[str] = None
    category: Optional[str] = None
    group: Optional[str] = None
    images: Optional[List[str]] = None
    status: Optional[str] = None

# ---------------- Games catalog ----------------
GAMES_CATALOG = [
    {
        "slug": "mobile-legends",
        "name": "Mobile Legends",
        "tagline": "Bang Bang — Legends collide in the Land of Dawn.",
        "color": "#0088FF",
        "hero_image": "https://images.unsplash.com/photo-1718632714530-4bb8a792bd51",
        "stats": {"players": "120M+", "listings": "2.4K", "avg_price": "$140"},
        "categories": ["Mythic", "Legend", "Skins Bundle", "Rank Boost", "Starter"],
    },
    {
        "slug": "pubg-mobile",
        "name": "PUBG Mobile",
        "tagline": "Drop in. Loot up. Dominate the battleground.",
        "color": "#FF7A18",
        "hero_image": "https://images.unsplash.com/photo-1579912436616-f74ceee1ae07",
        "stats": {"players": "1B+", "listings": "3.1K", "avg_price": "$220"},
        "categories": ["Conqueror", "Ace", "UC Bundle", "Skins", "Starter"],
    },
    {
        "slug": "standoff-2",
        "name": "Standoff 2",
        "tagline": "Tactical firefights. Precision. Adrenaline.",
        "color": "#4CC2FF",
        "hero_image": "https://images.pexels.com/photos/19964747/pexels-photo-19964747.jpeg",
        "stats": {"players": "200M+", "listings": "1.8K", "avg_price": "$90"},
        "categories": ["Legendary", "Immortal", "Knife Skins", "Gold Skins", "Starter"],
    },
]

# ---------------- Startup ----------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Indexes
    await db.users.create_index("username", unique=True)
    await db.posts.create_index([("created_at", -1)])
    await db.posts.create_index("game_slug")
    await db.posts.create_index("status")
    await db.games.create_index("slug", unique=True)

    # Seed games
    for g in GAMES_CATALOG:
        await db.games.update_one(
            {"slug": g["slug"]},
            {"$set": {**g, "id": g["slug"]}},
            upsert=True,
        )

    # Seed admin
    admin_username = os.environ.get("ADMIN_USERNAME", "admin")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin25")
    existing = await db.users.find_one({"username": admin_username})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "username": admin_username,
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "created_at": now_iso(),
        })
    else:
        if not verify_password(admin_password, existing.get("password_hash", "")):
            await db.users.update_one(
                {"username": admin_username},
                {"$set": {"password_hash": hash_password(admin_password)}}
            )

    yield
    client.close()

app = FastAPI(title="NEXUS ARENA API", lifespan=lifespan)
api = APIRouter(prefix="/api")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Health ----------------
@api.get("/")
async def root():
    return {"service": "nexus-arena", "status": "online", "time": now_iso()}

# ---------------- Auth ----------------
@api.post("/auth/login")
async def login(payload: LoginIn):
    user = await db.users.find_one({"username": payload.username.strip().lower()})
    if not user:
        # try case-insensitive
        user = await db.users.find_one({"username": {"$regex": f"^{re.escape(payload.username)}$", "$options": "i"}})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user["id"], user["username"], user["role"])
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "role": user["role"],
            "created_at": user.get("created_at", ""),
        },
    }

@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user

# ---------------- Games ----------------
@api.get("/games")
async def list_games():
    games = await db.games.find({}, {"_id": 0}).to_list(100)
    return games

@api.get("/games/{slug}")
async def get_game(slug: str):
    g = await db.games.find_one({"slug": slug}, {"_id": 0})
    if not g:
        raise HTTPException(status_code=404, detail="Game not found")
    return g

# ---------------- Image Upload ----------------
@api.post("/upload")
async def upload_image(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 10MB)")
    if _CLD_OK:
        try:
            result = cloudinary.uploader.upload(
                data,
                folder="nexus-arena",
                resource_type="image",
                transformation=[{"quality": "auto", "fetch_format": "auto"}],
            )
            return {"url": result.get("secure_url"), "provider": "cloudinary"}
        except Exception as e:
            # fallback to data-url
            pass
    # Fallback: data URL
    mime = file.content_type or "image/png"
    b64 = base64.b64encode(data).decode("utf-8")
    return {"url": f"data:{mime};base64,{b64}", "provider": "inline"}

# ---------------- Posts ----------------
@api.get("/posts")
async def list_posts(
    game: Optional[str] = None,
    q: Optional[str] = None,
    sort: Optional[str] = "newest",  # newest|oldest|price_desc|price_asc
    group: Optional[str] = None,
    status: Optional[str] = "published",
    limit: int = 60,
    skip: int = 0,
):
    query = {}
    if status:
        query["status"] = status
    if game:
        query["game_slug"] = game
    if group:
        query["group"] = group
    if q:
        query["$or"] = [
            {"title": {"$regex": re.escape(q), "$options": "i"}},
            {"description": {"$regex": re.escape(q), "$options": "i"}},
        ]
    sort_map = {
        "newest": [("created_at", -1)],
        "oldest": [("created_at", 1)],
        "price_desc": [("price", -1)],
        "price_asc": [("price", 1)],
    }
    cursor = db.posts.find(query, {"_id": 0}).sort(sort_map.get(sort, [("created_at", -1)])).skip(skip).limit(limit)
    items = await cursor.to_list(limit)
    total = await db.posts.count_documents(query)
    return {"items": items, "total": total}

@api.get("/posts/{post_id}")
async def get_post(post_id: str):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    # Increment views
    await db.posts.update_one({"id": post_id}, {"$inc": {"views": 1}})
    post["views"] = post.get("views", 0) + 1
    # Related posts (same game, exclude self)
    related = await db.posts.find(
        {"game_slug": post["game_slug"], "id": {"$ne": post_id}, "status": "published"},
        {"_id": 0}
    ).sort("created_at", -1).limit(6).to_list(6)
    return {"post": post, "related": related}

@api.post("/posts")
async def create_post(payload: PostIn, user: dict = Depends(require_role("admin", "moderator"))):
    post = payload.model_dump()
    post["id"] = str(uuid.uuid4())
    post["created_at"] = now_iso()
    post["updated_at"] = now_iso()
    post["created_by"] = user["username"]
    post["views"] = 0
    post["favorites"] = 0
    await db.posts.insert_one(post)
    post.pop("_id", None)
    return post

@api.patch("/posts/{post_id}")
async def update_post(post_id: str, payload: PostUpdate, user: dict = Depends(require_role("admin", "moderator"))):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    update["updated_at"] = now_iso()
    result = await db.posts.update_one({"id": post_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    return post

@api.delete("/posts/{post_id}")
async def delete_post(post_id: str, user: dict = Depends(require_role("admin"))):
    result = await db.posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"ok": True}

# ---------------- Analytics ----------------
@api.get("/admin/analytics")
async def analytics(user: dict = Depends(require_role("admin", "moderator", "viewer"))):
    total_posts = await db.posts.count_documents({})
    published = await db.posts.count_documents({"status": "published"})
    drafts = await db.posts.count_documents({"status": "draft"})

    # Views total
    pipeline_views = [{"$group": {"_id": None, "views": {"$sum": "$views"}, "revenue": {"$sum": "$price"}}}]
    stats = await db.posts.aggregate(pipeline_views).to_list(1)
    total_views = stats[0]["views"] if stats else 0
    total_revenue = stats[0]["revenue"] if stats else 0

    # Per game
    per_game = await db.posts.aggregate([
        {"$group": {"_id": "$game_slug", "count": {"$sum": 1}, "views": {"$sum": "$views"}, "revenue": {"$sum": "$price"}}}
    ]).to_list(20)

    # Per group
    per_group = await db.posts.aggregate([
        {"$group": {"_id": "$group", "count": {"$sum": 1}, "revenue": {"$sum": "$price"}}}
    ]).to_list(10)

    # Recent posts
    recent = await db.posts.find({}, {"_id": 0}).sort("created_at", -1).limit(6).to_list(6)

    # Timeline last 7 days
    timeline = []
    now = datetime.now(timezone.utc)
    for i in range(6, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        c = await db.posts.count_documents({
            "created_at": {"$gte": day_start.isoformat(), "$lt": day_end.isoformat()}
        })
        timeline.append({"day": day_start.strftime("%a"), "count": c})

    return {
        "totals": {
            "posts": total_posts,
            "published": published,
            "drafts": drafts,
            "views": total_views,
            "revenue": round(total_revenue, 2),
            "storage_mb": round(total_posts * 1.2, 1),
        },
        "per_game": per_game,
        "per_group": per_group,
        "recent": recent,
        "timeline": timeline,
    }

app.include_router(api)

@app.get("/")
async def root_no_prefix():
    return {"service": "nexus-arena", "message": "API is at /api"}
