# ShweMal Backend API

TypeScript + Express + Prisma + MySQL API for the ShweMal platform.

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

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`
- `PORT`
- `UPLOAD_ROOT` (optional; defaults to `./uploads`)
- `UPLOAD_MAX_BYTES` (optional; default 5MB)
- `UPLOAD_ALLOWED_MIME` (optional; jpeg/png/webp)

## Local file uploads

Uploads are stored on local disk (no cloud in this version). See `FileUploadSpecification.md`.

- `POST /api/v1/uploads?category=houses|moving|docs|profile` — multipart field `files` (auth required); returns `{ paths: string[] }`
- Public static: `GET /uploads/houses|moving|profile/...`
- Protected docs: `GET /api/v1/files/docs/:filename` (owner or admin)
- Domain APIs still accept path strings such as `uploads/houses/{uuid}.jpg`

Ensure `uploads/{houses,moving,docs,profile}` exist (created on boot). Binaries are gitignored.

## Database setup

1. `npm run prisma:generate`
2. `npm run prisma:migrate:dev -- --name init`
3. `npm run prisma:seed`

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
| Driver | profile + moving request accept/reject/eta/status |
| Moving | `POST /moving/requests`, `GET /moving/requests/:id` |
| Uploads | `POST /uploads?category=...` |
| Files | `GET /files/docs/:filename` (protected) |
| Roommates | `GET/POST /roommates` |
| Wishlist | `GET/POST/DELETE /wishlist/:houseId` |
| Reviews | `GET/POST /reviews` |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read` |
| Public master data | `GET /master-data/:entity` |
| Admin | users, verification, moving assignment, overview reports, `GET /admin/reports/bookings` |
| Admin master data | CRUD `/admin/master-data/:entity` including `roles` |

## Requirement mapping (backend)

Implemented requirement groups:

- FR-AUTH-001..004 — auth, RBAC, registration notification
- FR-HOME-002..003, FR-HOME-005 — home feed + public house discovery
- FR-HOUSE-001..008 — search, details, booking, confirmation status, duplicate rule, user cancel
- FR-AGENT-001..004 — self-service registration + verified agent CRUD + house bookings
- FR-DRIVER-001..006 — self-service registration + moving workflow + estimated earnings
- FR-MOVE-001..005 — moving request lifecycle
- FR-ROOM-001..002 — roommate browse/post
- FR-PROFILE-001..004 — profile, history, reviews, logout via refresh revoke
- FR-NOTI-001 — in-app notifications for core events
- FR-ADMIN-001..007 — verification, users, roles, master data, overview reports, house booking report
- MD-001..011 — master data CRUD including roles

## Notes

- Local-disk binary upload is available via `POST /uploads`; domain create/update APIs still persist returned path strings.
- Integration tests mock Prisma (except upload disk tests); run migrations against MySQL for full database verification.
