# NEXUS ARENA — PRD

## Problem Statement (Original)
Build the most visually stunning AAA Gaming Marketplace ever created. Cinematic quality mixing Riot Games, Steam, Epic Games Store, Valorant, Apple, Tesla, Stripe. Dark futuristic marketplace. Supported games: Mobile Legends, PUBG Mobile, Standoff 2. Admin at `/admin25` (login only, no registration). Roles: Admin, Moderator, Viewer. Groups: 300K-900K, 901K-1.5M, 1.6M-15M. Cloudinary image storage.

## Stack (Actual)
- **Frontend**: React 18 (CRA JS), TailwindCSS, Framer Motion, @react-three/fiber, @react-three/drei, Recharts, lucide-react, sonner, react-router-dom v6
- **Backend**: FastAPI, Motor (MongoDB), PyJWT, bcrypt, cloudinary (optional)
- **DB**: MongoDB (`nexus_arena`)
- **Image storage**: Cloudinary if creds set, else base64 data URLs fallback

## Architecture
- Env-driven config (`REACT_APP_BACKEND_URL`, `MONGO_URL`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `CLOUDINARY_*`)
- All backend routes prefixed with `/api`
- JWT bearer auth stored in localStorage on frontend
- Admin seeded on startup

## Implemented (v1.0 — Jan 2026)
- [x] Premium loading screen (particles, energy ring, progress)
- [x] Custom animated cursor (stretch on hover, magnetic feel)
- [x] Animated background (aurora, particles canvas, grid, noise, mouse parallax, scan line)
- [x] Cinematic Hero with @react-three/fiber (energy rings, holo shapes, sparkles, stars, mouse camera parallax)
- [x] Home page (hero, supported games, latest drops, features, CTA)
- [x] Supported Games (Mobile Legends, PUBG Mobile, Standoff 2) — dedicated hero, colors, stats, categories per game
- [x] Marketplace with realtime search, sort (Newest/Oldest/Highest/Lowest), filters (game, group), URL-synced params
- [x] Product cards with 3D tilt, glass, glow, animated border, corner brackets, hover shine
- [x] Account detail page: gallery, thumbnails, lightbox with prev/next, price, phone/facebook contact, share, favorite, related loadouts
- [x] Admin login at `/admin25` (JWT)
- [x] Admin dashboard: stat cards (posts/published/drafts/views/GMV/storage), Recharts (Area timeline, Pie by game), Recent listings
- [x] Admin Listings table with filters by game/group, edit/delete/view
- [x] Admin Groups tab with 3 tier cards (300K-900K, 901K-1.5M, 1.6M-15M) + GMV per group
- [x] Post creation modal: title, description, price, phone, facebook, game, group, category, multi-image upload (Cloudinary or inline), preview, draft/publish
- [x] Toast notifications (glass, animated, 4 types)
- [x] Navbar hides on scroll, glass, mobile menu
- [x] Premium footer with social icons
- [x] Route protection for /admin
- [x] SEO meta tags (title, description, OG, twitter)
- [x] Responsive layout

## Test Credentials
See `/app/memory/test_credentials.md`.

## Backlog / Future
- P1: Cloudinary credentials wiring by user (env vars in `/app/backend/.env`)
- P1: Moderator + Viewer role management UI (users CRUD)
- P2: Real favorites persistence (currently ephemeral in Account detail)
- P2: Post categories per game linked to the filter chips on Game pages
- P2: Search suggestions dropdown
- P2: Lenis smooth scroll (native smooth for now)
- P2: More Three.js hero details (controller/keyboard GLB models)
- P3: Analytics event tracking (views, favorites) persisted per user
