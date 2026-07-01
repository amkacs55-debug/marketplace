# NEXUS ARENA — Test Credentials

## Admin Login
- **Route**: `/admin25`
- **Username**: `admin`
- **Password**: `admin25`
- **Role**: `admin`

## API
- **Base URL**: `${REACT_APP_BACKEND_URL}/api`
- **Login endpoint**: `POST /api/auth/login` (body: `{ "username": "admin", "password": "admin25" }`)
- **Auth header**: `Authorization: Bearer <token>`
- **Me endpoint**: `GET /api/auth/me`

## Notes
- No public registration. Only login at `/admin25`.
- Cloudinary keys are optional; when empty the `/api/upload` endpoint returns base64 data URLs so images still render.
