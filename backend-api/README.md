# ShweMal Backend API

TypeScript + Express + Prisma + PostgreSQL API for the ShweMal platform.

## Scripts

- `npm run dev` — API with tsx watch mode
- `npm run build` — compile to `dist/`
- `npm run start` — run compiled server
- `npm run test` — all tests
- `npm run test:unit` — unit tests only
- `npm run test:integration` — integration tests only
- `npm run lint` — ESLint
- `npm run prisma:generate` — generate Prisma client
- `npm run prisma:migrate:dev` — development migrations
- `npm run prisma:migrate:deploy` — deploy migrations
- `npm run prisma:seed` — seed roles, status codes, Yangon locations, property types, vehicle types, amenities (§8.3 / MD-009), floor levels (MD-007), and admin user

## Architecture

Layered starter layout under `src/`:

- `config` — environment validation
- `routes` — `/api/v1` composition
- `controllers` — HTTP orchestration
- `services` — business logic
- `middleware` — auth, validation, errors, request id
- `validators` — express-validator chains
- `prisma` — Prisma client bootstrap
- `utils` — JWT, password, API envelope helpers

## Environment

Copy `.env.example` to `.env` and set:

- `DATABASE_TARGET` — `local` (default) or `supabase`
- `LOCAL_DATABASE_URL` — used when target is `local` (example: `postgresql://USER:PASSWORD@localhost:5432/shawemal`). `DATABASE_URL` is a backward-compatible alias. Percent-encode special characters in the password (`@` → `%40`).
- `SUPABASE_DATABASE_URL` — session-mode pooler URL when target is `supabase` (database password, not the anon key)
- `SUPABASE_DIRECT_URL` — direct db host used by Prisma migrate when target is `supabase`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`
- `PORT`
- `UPLOAD_ROOT` (optional; defaults to `./uploads` locally, `/tmp/uploads` when `VERCEL` is set)
- `UPLOAD_MAX_BYTES` (optional; default 5MB)
- `UPLOAD_ALLOWED_MIME` (optional; jpeg/png/webp)
- `SEED_ADMIN_EMAIL` (default `admin@shawemal.com`)
- `SEED_ADMIN_PASSWORD` (default `Admin@123456`)

## Local file uploads

Uploads are stored on local disk (no cloud in this version). See `FileUploadSpecification.md`.

- `POST /api/v1/uploads?category=houses|moving|docs|profile` — multipart field `files` (auth required); returns `{ paths: string[] }`
- Public static: `GET /uploads/houses|moving|profile/...`
- Protected docs: `GET /api/v1/files/docs/:filename` (owner or admin)
- Domain APIs still accept path strings such as `uploads/houses/{uuid}.jpg`

Ensure `uploads/{houses,moving,docs,profile}` exist (created on boot). Binaries are gitignored.

On Vercel, uploads default to `/tmp/uploads` and are **ephemeral** (lost on cold start / redeploy). Set `UPLOAD_ROOT` only if you need a different path.

## Deploy on Vercel (GitHub)

This API runs as a serverless Express function (`api/index.ts` + `vercel.json`). Local `npm run dev` / `npm start` are unchanged.

1. Import the monorepo into a **new** Vercel project (separate from the frontend).
2. Set **Root Directory** to `backend-api`.
3. Framework Preset: **Other** (not Express). Node.js: **20.x** or **22.x**.
4. Build Command: override **on**, leave **empty** (do not run `npm run build`). Output Directory: override **off** or clear — do not type `N/A`.
5. Install Command: leave default (`npm install` runs `postinstall` → `prisma generate`).
6. Optional Ignored Build Step: `git diff --quiet HEAD^ HEAD -- ./backend-api`

`vercel.json` sets `framework: null` and an empty `buildCommand` so Vercel uses `api/index.ts` as a serverless function instead of looking for a compiled Express entrypoint.
6. Set Production environment variables:

| Variable | Notes |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_TARGET` | `supabase` |
| `SUPABASE_DATABASE_URL` | Session pooler URL (db password, not anon key) |
| `SUPABASE_DIRECT_URL` | Direct Postgres URL (migrations) |
| `JWT_SECRET` | Strong random secret |
| `JWT_EXPIRES_IN` | e.g. `15m` |
| `JWT_ALGORITHM` | `HS256` |
| `CORS_ORIGIN` | Exact frontend origin, e.g. `https://shawe-mal-web-smoky.vercel.app` (no trailing slash). Comma-separated list allowed. Must match the browser Origin or preflight fails. |

Do **not** put `SEED_ADMIN_*` on Vercel. Run `npm run prisma:migrate:deploy` and `npm run prisma:seed` once against Supabase from your machine or CI.

After the first deploy, set the frontend `VITE_API_BASE_URL` to `https://<this-api>.vercel.app/api/v1` and redeploy the frontend.

## Database setup

The API always uses Prisma against PostgreSQL. `DATABASE_TARGET` selects the host:

- `local` — `LOCAL_DATABASE_URL` or `DATABASE_URL`
- `supabase` — `SUPABASE_DATABASE_URL` for the running API; `SUPABASE_DIRECT_URL` for migrate

### Local

1. Create an empty PostgreSQL database named `shawemal`.
2. Set `DATABASE_TARGET=local` and `LOCAL_DATABASE_URL` in `.env`.
3. `npm run prisma:generate`
4. `npm run prisma:migrate:dev` (or `npm run prisma:migrate:deploy` in production)
5. `npm run prisma:seed`

### Supabase

1. Create a Supabase project and copy the session-mode pooler URI and the direct URI (Project Settings → Database).
2. Set `DATABASE_TARGET=supabase`, `SUPABASE_DATABASE_URL`, and `SUPABASE_DIRECT_URL`. Do not use the anon key.
3. `npm run prisma:generate`
4. `npm run prisma:migrate:deploy`
5. `npm run prisma:seed` (optional if you only need schema)

SSL (`sslmode=require`) is appended for Supabase URLs when it is not already present. If the deploy host has no IPv6, use the pooler and/or the Supabase IPv4 add-on.

Seed creates roles, status codes, Yangon locations, property types, vehicle types, amenities, floor levels, moving inventory items, and the admin portal user `admin@shawemal.com` / `Admin@123456`. Change that password after first login.

## API overview (`/api/v1`)

| Area | Endpoints |
|------|-----------|
| Health | `GET /health` |
| Home | `GET /home` |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`, `GET /auth/verify` |
| Profile | `GET/PATCH /profile`, `GET /profile/history`, `PATCH /profile/change-password` |
| Houses | `GET /houses`, `GET /houses/:id`, `POST /houses/:id/bookings` |
| Bookings | `GET /bookings`, `GET /bookings/:id`, `PATCH /bookings/:id/status` |
| Registrations | `POST /registrations/agent`, `POST /registrations/driver` |
| Agent | `POST /agent/profile`, CRUD `/agent/houses`, `GET /agent/bookings` |
| Driver | profile + available/assigned moving requests + accept/reject/eta/status |
| Moving | `POST /moving/quote`, `POST /moving/requests`, `GET /moving/requests`, `GET /moving/requests/:id` |
| Uploads | `POST /uploads?category=...` |
| Files | `GET /files/docs/:filename` (protected) |
| Roommates | `GET/POST /roommates` |
| Wishlist | `GET/POST/DELETE /wishlist/:houseId` |
| Reviews | `GET/POST /reviews` (POST upserts by `bookingId` or `movingRequestId`) |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read` |
| Public master data | `GET /master-data/:entity` |
| Admin | users, agent/driver verification queues (`GET /admin/agents`, `GET /admin/drivers`), jobs assign (`GET /admin/moving/assignable-requests`, `GET /admin/moving/assignable-drivers`, `POST /admin/moving/requests/:id/assign`), overview reports, `GET /admin/reports/bookings`, `GET /admin/reports/moving` |
| Admin master data | CRUD `/admin/master-data/:entity` including `roles` |

## Requirement mapping (backend)

Implemented requirement groups:

- FR-AUTH-001..004 — auth, RBAC, registration notification
- FR-HOME-002..003, FR-HOME-005 — home feed + public house discovery
- FR-HOUSE-001..008 — search, details, booking, confirmation status, duplicate rule, user cancel
- FR-AGENT-001..004 — self-service registration + verified agent CRUD + house bookings
- FR-DRIVER-001..006 — self-service registration + moving workflow + estimated earnings
- FR-MOVE-001..007 — moving request lifecycle, quote, and Moving Status tracking
- FR-ROOM-001..002 — roommate browse/post
- FR-PROFILE-001..004 — profile, history, reviews, logout via refresh revoke
- FR-NOTI-001 — in-app notifications for core events
- FR-ADMIN-001..008 — verification, users, roles, master data, overview reports, house booking report, moving request report
- MD-001..012 — master data CRUD including roles and moving inventory items

## Notes

- Local-disk binary upload is available via `POST /uploads`; domain create/update APIs still persist returned path strings.
- Integration tests mock Prisma (except upload disk tests); run migrations against PostgreSQL for full database verification.
