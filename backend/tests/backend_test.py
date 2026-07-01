"""Backend API tests for NEXUS ARENA."""
import os
import io
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or "https://nexus-gaming-hub-16.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_USER = "admin"
ADMIN_PASS = "admin25"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and data["user"]["role"] == "admin"
    return data["token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# --- Health ---
def test_health(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    d = r.json()
    assert d.get("service") == "nexus-arena"


# --- Auth ---
def test_login_invalid(session):
    r = session.post(f"{API}/auth/login", json={"username": "admin", "password": "wrong"})
    assert r.status_code == 401


def test_login_success(session):
    r = session.post(f"{API}/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
    assert r.status_code == 200
    d = r.json()
    assert d["user"]["username"] == "admin"
    assert d["user"]["role"] == "admin"


def test_me_no_token(session):
    r = requests.get(f"{API}/auth/me")
    assert r.status_code == 401


def test_me_with_token(admin_token):
    r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    d = r.json()
    assert d["role"] == "admin"
    assert d["username"] == "admin"


# --- Games ---
def test_list_games(session):
    r = session.get(f"{API}/games")
    assert r.status_code == 200
    games = r.json()
    slugs = {g["slug"] for g in games}
    assert {"mobile-legends", "pubg-mobile", "standoff-2"}.issubset(slugs)
    for g in games:
        assert "name" in g and "tagline" in g and "color" in g and "hero_image" in g and "stats" in g


def test_get_game_ml(session):
    r = session.get(f"{API}/games/mobile-legends")
    assert r.status_code == 200
    assert r.json()["slug"] == "mobile-legends"


def test_get_game_missing(session):
    r = session.get(f"{API}/games/does-not-exist")
    assert r.status_code == 404


# --- Upload ---
def test_upload_requires_auth():
    files = {"file": ("test.png", b"\x89PNG\r\n\x1a\n", "image/png")}
    r = requests.post(f"{API}/upload", files=files)
    assert r.status_code == 401


def test_upload_inline(admin_token):
    files = {"file": ("test.png", b"\x89PNG\r\n\x1a\nfakedata", "image/png")}
    r = requests.post(f"{API}/upload", files=files, headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["provider"] == "inline"
    assert d["url"].startswith("data:image/png;base64,")


# --- Posts CRUD ---
@pytest.fixture(scope="session")
def created_post(auth_headers):
    payload = {
        "title": "TEST_ML Mythic Account",
        "description": "TEST post - full-featured ML mythic account",
        "price": 149.99,
        "phone": "+1234567890",
        "facebook": "fb.me/test",
        "game_slug": "mobile-legends",
        "category": "Mythic",
        "group": "300K-900K",
        "images": ["data:image/png;base64,iVBORw0KGgo="],
        "status": "published",
    }
    r = requests.post(f"{API}/posts", json=payload, headers=auth_headers)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["title"] == payload["title"]
    assert d["views"] == 0
    assert "id" in d and "created_at" in d
    yield d
    # cleanup
    requests.delete(f"{API}/posts/{d['id']}", headers=auth_headers)


def test_create_post_requires_auth():
    r = requests.post(f"{API}/posts", json={
        "title": "x", "description": "y", "price": 1, "game_slug": "mobile-legends"
    })
    assert r.status_code == 401


def test_list_posts_contains_created(created_post):
    r = requests.get(f"{API}/posts")
    assert r.status_code == 200
    d = r.json()
    assert "items" in d and "total" in d
    ids = [p["id"] for p in d["items"]]
    assert created_post["id"] in ids


def test_list_posts_filter_game(created_post):
    r = requests.get(f"{API}/posts", params={"game": "mobile-legends"})
    assert r.status_code == 200
    for p in r.json()["items"]:
        assert p["game_slug"] == "mobile-legends"


def test_list_posts_search(created_post):
    r = requests.get(f"{API}/posts", params={"q": "TEST_ML Mythic"})
    assert r.status_code == 200
    ids = [p["id"] for p in r.json()["items"]]
    assert created_post["id"] in ids


def test_list_posts_sort_price(created_post):
    r = requests.get(f"{API}/posts", params={"sort": "price_desc"})
    assert r.status_code == 200
    prices = [p["price"] for p in r.json()["items"]]
    assert prices == sorted(prices, reverse=True)


def test_get_post_and_views_increment(created_post):
    r1 = requests.get(f"{API}/posts/{created_post['id']}")
    assert r1.status_code == 200
    d1 = r1.json()
    assert "post" in d1 and "related" in d1
    v1 = d1["post"]["views"]
    r2 = requests.get(f"{API}/posts/{created_post['id']}")
    v2 = r2.json()["post"]["views"]
    assert v2 == v1 + 1


def test_patch_post(created_post, auth_headers):
    r = requests.patch(f"{API}/posts/{created_post['id']}", json={"price": 199.99}, headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["price"] == 199.99
    # verify persistence
    r2 = requests.get(f"{API}/posts/{created_post['id']}")
    assert r2.json()["post"]["price"] == 199.99


def test_patch_requires_auth(created_post):
    r = requests.patch(f"{API}/posts/{created_post['id']}", json={"price": 1})
    assert r.status_code == 401


def test_delete_requires_auth(created_post):
    r = requests.delete(f"{API}/posts/{created_post['id']}")
    assert r.status_code == 401


def test_delete_post_and_verify(auth_headers):
    # Create separate post for delete test
    payload = {
        "title": "TEST_todelete", "description": "d", "price": 1.0,
        "game_slug": "pubg-mobile", "group": "300K-900K",
    }
    r = requests.post(f"{API}/posts", json=payload, headers=auth_headers)
    pid = r.json()["id"]
    rd = requests.delete(f"{API}/posts/{pid}", headers=auth_headers)
    assert rd.status_code == 200
    rg = requests.get(f"{API}/posts/{pid}")
    assert rg.status_code == 404


# --- Analytics ---
def test_analytics_requires_auth():
    r = requests.get(f"{API}/admin/analytics")
    assert r.status_code == 401


def test_analytics(admin_token, created_post):
    r = requests.get(f"{API}/admin/analytics", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    d = r.json()
    assert "totals" in d and "per_game" in d and "per_group" in d and "recent" in d and "timeline" in d
    t = d["totals"]
    for k in ["posts", "published", "drafts", "views", "revenue", "storage_mb"]:
        assert k in t
    assert len(d["timeline"]) == 7
