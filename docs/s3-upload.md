# S3 file uploads

When all `AWS_*` variables are set, uploads go to a **private** S3 bucket. The database stores object keys only (e.g. `uploads3/profile/1717344000000-uuid-photo.png`). API responses return **presigned GET URLs** that expire after `AWS_PRESIGN_EXPIRES_SECONDS` (default 3600).

## Endpoints

| Method | Path | Field | Storage prefix |
|--------|------|-------|----------------|
| POST | `/api/admin/auth/profile/avatar` | `avatar` | `uploads3/profile/` |
| POST | `/api/admin/products/:id/image` | `image` | `uploads3/products/` |

## Local development without S3

Omit `AWS_*` variables. Files are saved under `Backend /uploads3/` and served at `/uploads3/...`.

## Vercel

Set all four required variables on the backend Vercel project and redeploy. See `S3-Bucket-Setup-Guide.pdf` in the repo root for IAM and bucket setup.
