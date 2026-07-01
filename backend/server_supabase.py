from dotenv import load_dotenv
load_dotenv()

import os
import re
import base64
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from contextlib import asynccontextmanager

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client

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
SUPABASE_URL = os.environ["SUPABASE_URL"]
# IMPORTANT: use the SERVICE ROLE key here (never the anon key), since the
# backend needs to bypass RLS to write posts/users. Keep it server-side only.
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = "HS256"

sb: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

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
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")[:80]

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

    res = sb.table("users").select("*").eq("id", payload["sub"]).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=401, detail="User not found")
    user = res.data[0]
    user.pop("password_hash", None)
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

class PostIn(BaseModel):
    title: str
    description: str
    price: float
    phone: Optional[str] = ""
    facebook: Optional[str] = ""
    game_slug: str
    category: Optional[str] = "general"
    group: Optional[str] = "300K-900K"   # 300K-900K | 901K-1.5M | 1.6M-15M
    images: List[str] = []
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

# ---------------- Games catalog (seeded via supabase_schema.sql too) ----------------
GAMES_CATALOG = [
    {
        "slug": "mobile-legends",
        "name": "Mobile Legends",
        "tagline": "Домгууд Мөнх Гэрэлт Ертөнцөд Мөргөлддөг.",
        "color": "#0088FF",
        "hero_image": "https://images.unsplash.com/photo-1718632714530-4bb8a792bd51",
        "categories": ["Мифийн", "Домогт", "Скин Багц", "Зэрэглэл", "Эхлэлт"],
    },
    {
        "slug": "pubg-mobile",
        "name": "PUBG Mobile",
        "tagline": "Буулт. Олз. Ноёрхол.",
        "color": "#FF7A18",
        "hero_image": "https://images.unsplash.com/photo-1579912436616-f74ceee1ae07",
        "categories": ["Conqueror", "Ace", "UC Багц", "Скин", "Эхлэлт"],
    },
    {
        "slug": "standoff-2",
        "name": "Standoff 2",
        "tagline": "Тактиктай. Нарийн. Хатуу.",
        "color": "#4CC2FF",
        "hero_image": "https://images.pexels.com/photos/19964747/pexels-photo-19964747.jpeg",
        "categories": ["Домогт", "Immortal", "Хутганы Скин", "Алтан Скин", "Эхлэлт"],
    },
]

# ---------------- Startup ----------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seed games (idempotent upsert on slug/id)
    for g in GAMES_CATALOG:
        sb.table("games").upsert({**g, "id": g["slug"]}, on_conflict="slug").execute()

    # Seed admin
    admin_username = os.environ.get("ADMIN_USERNAME", "admin")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin25")
    existing = sb.table("users").select("*").eq("username", admin_username).limit(1).execute()
    if not existing.data:
        sb.table("users").insert({
            "username": admin_username,
            "password_hash": hash_password(admin_password),
            "role": "admin",
        }).execute()
    else:
        user = existing.data[0]
        if not verify_password(admin_password, user.get("password_hash", "")):
            sb.table("users").update(
                {"password_hash": hash_password(admin_password)}
            ).eq("username", admin_username).execute()

    yield

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
    uname = payload.username.strip().lower()
    res = sb.table("users").select("*").ilike("username", uname).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user = res.data[0]
    if not verify_password(payload.password, user.get("password_hash", "")):
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
async def _game_stats(slug: str) -> dict:
    """Compute real listing count + avg price from published posts."""
    res = sb.table("posts").select("price").eq("game_slug", slug).eq("status", "published").execute()
    rows = res.data or []
    count = len(rows)
    total = sum(float(r.get("price") or 0) for r in rows)
    avg = round(total / count, 0) if count else 0
    return {"listings": count, "avg_price": avg, "gmv": round(total, 0)}

@api.get("/games")
async def list_games():
    res = sb.table("games").select("*").execute()
    games = res.data or []
    for g in games:
        g["stats"] = await _game_stats(g["slug"])
    return games

@api.get("/games/{slug}")
async def get_game(slug: str):
    res = sb.table("games").select("*").eq("slug", slug).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Game not found")
    g = res.data[0]
    g["stats"] = await _game_stats(slug)
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
        except Exception:
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
    query = sb.table("posts").select("*", count="exact")
    if status:
        query = query.eq("status", status)
    if game:
        query = query.eq("game_slug", game)
    if group:
        query = query.eq("group", group)
    if q:
        escaped = q.replace("%", "").replace(",", "")
        query = query.or_(f"title.ilike.%{escaped}%,description.ilike.%{escaped}%")

    sort_map = {
        "newest": ("created_at", True),
        "oldest": ("created_at", False),
        "price_desc": ("price", True),
        "price_asc": ("price", False),
    }
    col, desc = sort_map.get(sort, ("created_at", True))
    query = query.order(col, desc=desc).range(skip, skip + limit - 1)

    res = query.execute()
    return {"items": res.data or [], "total": res.count or 0}

@api.get("/posts/{post_id}")
async def get_post(post_id: str):
    res = sb.table("posts").select("*").eq("id", post_id).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Post not found")
    post = res.data[0]

    # Increment views
    new_views = (post.get("views") or 0) + 1
    sb.table("posts").update({"views": new_views}).eq("id", post_id).execute()
    post["views"] = new_views

    # Related posts (same game, exclude self)
    related_res = (
        sb.table("posts")
        .select("*")
        .eq("game_slug", post["game_slug"])
        .neq("id", post_id)
        .eq("status", "published")
        .order("created_at", desc=True)
        .limit(6)
        .execute()
    )
    return {"post": post, "related": related_res.data or []}

@api.post("/posts")
async def create_post(payload: PostIn, user: dict = Depends(require_role("admin", "moderator"))):
    post = payload.model_dump()
    post["created_by"] = user["username"]
    post["views"] = 0
    post["favorites"] = 0
    res = sb.table("posts").insert(post).execute()
    return res.data[0]

@api.patch("/posts/{post_id}")
async def update_post(post_id: str, payload: PostUpdate, user: dict = Depends(require_role("admin", "moderator"))):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    res = sb.table("posts").update(update).eq("id", post_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Post not found")
    return res.data[0]

@api.delete("/posts/{post_id}")
async def delete_post(post_id: str, user: dict = Depends(require_role("admin"))):
    res = sb.table("posts").delete().eq("id", post_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"ok": True}

# ---------------- Analytics ----------------
@api.get("/admin/analytics")
async def analytics(user: dict = Depends(require_role("admin", "moderator", "viewer"))):
    all_posts_res = sb.table("posts").select("*").execute()
    all_posts = all_posts_res.data or []

    total_posts = len(all_posts)
    published = sum(1 for p in all_posts if p.get("status") == "published")
    drafts = sum(1 for p in all_posts if p.get("status") == "draft")
    total_views = sum(p.get("views") or 0 for p in all_posts)
    total_revenue = sum(float(p.get("price") or 0) for p in all_posts)

    # Per game
    per_game_map = {}
    for p in all_posts:
        slug = p.get("game_slug")
        d = per_game_map.setdefault(slug, {"_id": slug, "count": 0, "views": 0, "revenue": 0.0})
        d["count"] += 1
        d["views"] += p.get("views") or 0
        d["revenue"] += float(p.get("price") or 0)
    per_game = list(per_game_map.values())

    # Per group
    per_group_map = {}
    for p in all_posts:
        grp = p.get("group")
        d = per_group_map.setdefault(grp, {"_id": grp, "count": 0, "revenue": 0.0})
        d["count"] += 1
        d["revenue"] += float(p.get("price") or 0)
    per_group = list(per_group_map.values())

    # Recent posts
    recent = sorted(all_posts, key=lambda p: p.get("created_at") or "", reverse=True)[:6]

    # Timeline last 7 days
    timeline = []
    now = datetime.now(timezone.utc)
    for i in range(6, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        c = 0
        for p in all_posts:
            ca = p.get("created_at")
            if not ca:
                continue
            try:
                ca_dt = datetime.fromisoformat(ca.replace("Z", "+00:00"))
            except ValueError:
                continue
            if day_start <= ca_dt < day_end:
                c += 1
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

