# ShweMal

ShweMal is a web platform for renting houses, hiring moving services, finding roommates, and connecting users with verified housing agents and drivers.

The monorepo contains a public portal (visitors, users, agents, drivers) and an admin portal (verification, users/roles, master data, reports), backed by a versioned REST API.

## Architecture

```text
┌─────────────────────┐         ┌──────────────────────┐
│  frontend-app       │  HTTP   │  backend-api         │
│  Vite + React       │ ──────► │  Express + Prisma    │
│  Public + Admin UI  │  /api/v1│  JWT auth + Prisma   │
└─────────────────────┘         └──────────┬───────────┘
                                           │
                                           ▼
                                 PostgreSQL (`shawemal`)
```

- **frontend-app** — SPA with feature-based modules, React Query data fetching, role-aware routing, English/Myanmar i18n, and light/dark themes.
- **backend-api** — Layered TypeScript API (`routes` → `controllers` → `services`) with Express Validator, JWT sessions, and Prisma ORM against PostgreSQL.
- **Specs & tooling** — Requirement specification at the repo root; Cursor/GitHub agent skills under `.cursor/` and `.github/`.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | Vite, React 19, TypeScript, TanStack Query, React Router, React Hook Form, shadcn/ui, Tailwind CSS, Vitest |
| Backend | Node.js, Express 5, TypeScript, Prisma 7, PostgreSQL, JWT, bcrypt, Zod, Jest + Supertest |
| Tooling | npm, ESLint (backend), Oxlint (frontend), Prisma Migrate + seed |

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+
- PostgreSQL 16+ (local or remote). Create an empty database named `shawemal` before migrating.

## Setup

### 1. Clone and install

```bash
git clone <repository-url>
cd ShaweMalApp

cd backend-api && npm install && cd ..
cd frontend-app && npm install && cd ..
```

### 2. Configure environment

**Backend** — copy `backend-api/.env.example` to `backend-api/.env` and set at least:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL URL, for example `postgresql://USER:PASSWORD@localhost:5432/shawemal`. Percent-encode special characters in the password (for example `@` → `%40`). |
| `JWT_SECRET` | Signing secret for access tokens |
| `CORS_ORIGIN` | Frontend origin (default `http://localhost:5173`) |
| `PORT` | API port (default `4000`) |
| `SEED_ADMIN_EMAIL` | Admin portal login (default `admin@shawemal.com`) |

**Frontend** — copy `frontend-app/.env.example` to `frontend-app/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_DEFAULT_LOCALE=en
```

### 3. Database

Create the empty database (once):

```sql
CREATE DATABASE shawemal;
```

From `backend-api`:

```bash
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
```

Seed creates roles, status codes, master data, and the default admin user (`SEED_ADMIN_*` in `.env`):

- Email: `admin@shawemal.com`
- Password: `Admin@123456` (change after first login)

Admin portal: [http://localhost:5173/admin/sign-in](http://localhost:5173/admin/sign-in)

### 4. Run locally

Terminal 1 — API:

```bash
cd backend-api
npm run dev
```

Terminal 2 — UI:

```bash
cd frontend-app
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Admin portal: [http://localhost:5173/admin/sign-in](http://localhost:5173/admin/sign-in)
- API health: [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)

## Development workflow

| Task | Backend (`backend-api`) | Frontend (`frontend-app`) |
| --- | --- | --- |
| Dev server | `npm run dev` | `npm run dev` |
| Lint | `npm run lint` | `npm run lint` |
| Test | `npm run test` | `npm test` |
| Build | `npm run build` | `npm run build` |
| Start prod build | `npm start` | `npm run preview` |

Suggested loop:

1. Implement API changes under `backend-api/src` (validators → services → controllers → routes).
2. Add or update Jest tests under `backend-api/tests`.
3. Mirror UI work in the matching `frontend-app/src/features/*` module.
4. Add Vitest coverage for critical forms, guards, and pages.
5. Keep requirement IDs (for example `FR-AUTH-001`) aligned with `ShweMal_Requirement_Specification.md`.

App-specific details (endpoint tables, routes, increment mapping) live in:

- [backend-api/README.md](backend-api/README.md)
- [frontend-app/README.md](frontend-app/README.md)

## Directory structure

```text
ShaweMalApp/
├── README.md
├── ShweMal_Requirement_Specification.md
├── ShweMal_Requirement_Specification.html
├── shwemal-logo.jpg
├── .gitignore
├── .cursor/                 # Cursor agents and skills
├── .github/                 # Shared agent/skill definitions
├── backend-api/
│   ├── prisma/              # Schema, migrations, seed
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   └── utils/
│   └── tests/               # Unit + integration
└── frontend-app/
    ├── public/
    └── src/
        ├── app/             # Providers + router
        ├── components/      # Shared + shadcn UI
        ├── features/        # Domain modules (auth, houses, admin, …)
        ├── lib/             # API client, auth, i18n
        └── test/            # Vitest suites
```

## Roles at a glance

| Role | Capabilities |
| --- | --- |
| Visitor | Browse/search houses |
| User | Book housing, moving, roommates, wishlist, reviews |
| Agent | Register; after admin verification, manage own listings |
| Driver | Register; after verification, accept jobs and update status/ETA |
| Admin | Verifications, users/roles, master data, moving assign, reports |

## Documentation

- Product requirements: [ShweMal_Requirement_Specification.md](ShweMal_Requirement_Specification.md)
- Backend API notes: [backend-api/README.md](backend-api/README.md)
- Frontend app notes: [frontend-app/README.md](frontend-app/README.md)
