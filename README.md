# AAdmin Backend

Production-grade **Module-First** API (Express 5 + MongoDB + JWT RS256) for the AAdmin frontend.

## Setup

```bash
cd "Backend "
npm install
cp .env.example .env
# RSA keys are in keys/ — regenerate with:
# openssl genrsa -out keys/jwt.key 2048
# openssl rsa -in keys/jwt.key -pubout -out keys/jwt.key.pub
npm run seed:admin
npm run dev
```

Requires MongoDB at `MONGO_URI` (default `mongodb://127.0.0.1:27017/aadmin`).

## API base

- **Admin API:** `http://localhost:5000/api/admin`
- **Health:** `GET /health`

### Auth (`/api/admin/auth`)

| Method | Path | Auth |
|--------|------|------|
| POST | `/login` | No |
| POST | `/forgot-password` | No |
| POST | `/reset-password` | No |
| GET | `/google` | OAuth redirect |
| GET | `/google/callback` | OAuth |
| GET | `/github` | OAuth redirect |
| GET | `/github/callback` | OAuth |
| GET | `/profile` | Bearer JWT |
| PUT | `/profile` | Bearer JWT |
| POST | `/profile/avatar` | Bearer JWT (multipart) |

### Global search (`/api/admin/search`)

| Method | Path | Auth |
|--------|------|------|
| GET | `/search?q=term&limit=5` | Bearer JWT |

Searches **users** (name, email) and **products** (name, SKU) in parallel. The frontend also matches **pages** (Dashboard, Users, Products, Settings, Profile) locally.

### Users / Products / Dashboard / Settings

- `GET/POST /api/admin/users`
- `PUT/DELETE /api/admin/users/:id`
- `GET/POST /api/admin/products`
- `PUT/DELETE /api/admin/products/:id`
- `GET /api/admin/dashboard/overview`
- `GET /api/admin/settings` (public)
- `PUT /api/admin/settings` (auth)

## Response format

```json
{
  "success": true,
  "message": "...",
  "data": [],
  "pagination": { "page": 1, "total": 10, "limit": 10, "totalPages": 1, "sort": "createdAt" }
}
```

## Seed admin (production)

```bash
# Set credentials in .env, then:
npm run seed:admin
```

Creates or updates the single AAdmin account from `DEFAULT_ADMIN_EMAIL` and `DEFAULT_ADMIN_PASSWORD`.

Optional demo users/products: `npm run seed:demo`

## Default admin (after seed)

- Email: `aadmin@mailinator.com`
- Password: `aadmin@12345`
