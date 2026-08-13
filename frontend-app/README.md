# ShweMal Frontend App

Independent Vite + React + TypeScript frontend for the ShweMal web application.

## Stack

- Vite + React + TypeScript
- TanStack React Query
- React Router
- React Hook Form
- shadcn/ui + Tailwind CSS
- Lucide icons
- next-themes (light/dark/system)
- react-i18next (English / Myanmar)
- Vitest + Testing Library

## Assumptions

| Item | Value |
| --- | --- |
| Package manager | npm |
| App name | `frontend-app` / ShweMal |
| API base URL | `http://localhost:4000/api/v1` |
| JWT storage | localStorage (Remember Me) or sessionStorage |
| Auth contract | `POST /auth/register`, `POST /auth/login`, `GET /auth/verify`, `GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout` |
| Default locale | `en` |

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
npm test
npm run test:watch
```

## Architecture

```text
src/
  app/providers/     Theme, I18n, Query, Auth, Router composition
  app/router/        Public + admin routes and auth guard
  features/auth/     Auth API, forms, schemas, types
  features/home/     Home page content from GET /home
  features/houses/   Finding House, details, booking, wishlist
  features/moving/   Hire Moving Service request + detail
  features/driver/   Driver registration + job workspace
  features/roommates/ Roommate browse + post
  features/profile/  Profile, wishlist page, history, reviews
  features/agent/    Agent registration + housing listing CRUD
  features/notifications/  Header notifications menu
  features/master-data/    Public master-data dropdowns
  features/public/   Public portal layout and shared pages
  features/admin/    Admin portal layout, API, and Increment C modules
  components/ui/     shadcn primitives
  lib/api/           Shared fetch client + 401 handling
  lib/i18n/          Locale resources
  lib/auth/          Token storage and JWT helpers
  test/              Vitest setup and suites
```

Provider order: Theme → I18n → Query → Auth → Router.

## Implemented feature areas

### Increment A

| Area | Requirement IDs | Notes |
| --- | --- | --- |
| Public auth UX | FR-AUTH-001..003, FR-PROFILE-004 | Remember Me, role-aware redirects, header profile/notifications + logout |
| Home | FR-HOME-001..005 | `GET /home`, global search → Finding House, sections + wishlist hearts |
| Finding House | FR-HOUSE-001..008 | Filters via `GET /houses` + master data, details, booking, confirmation page, user cancel |
| Agent Register | FR-AGENT-001 | Auth-gated form → `POST /registrations/agent` (path placeholders for NRC photos) |

### Increment B

| Area | Requirement IDs | Notes |
| --- | --- | --- |
| Hire Moving | FR-MOVE-001..002, FR-HOUSE-005 | Auth-gated form §8.4 → `POST /moving/requests`; detail via `GET /moving/requests/:id`; booking confirmation Yes → `/hire-moving?bookingId&houseId` |
| Driver Register | FR-DRIVER-001 | `/driver-register` → `POST /registrations/driver` (path placeholders) |
| Roommates | FR-ROOM-001..002 | Browse `GET /roommates` with filters; auth post `POST /roommates` |
| Profile module | FR-PROFILE-001..003, FR-NOTI-001 UI | `/profile`, wishlist, history; `GET/PATCH /profile`, change-password; reviews `POST /reviews`; notifications mark-read kept |
| Driver jobs | FR-DRIVER-003..006 | `/driver/jobs` for `driver` role: available list, accept/reject, ETA, status |

### Increment C

| Area | Requirement IDs | Notes |
| --- | --- | --- |
| Admin shell nav | FR-ADMIN portal | Dashboard, Verifications, Users, Moving Assign, Master Data, Reports |
| Dashboard | FR-ADMIN-006 (summary) | Cards from `GET /admin/reports/overview` + quick links |
| Verifications | FR-ADMIN-001..002 | Agent/driver forms by `userId` + status (`pending\|approve\|reject`); pending counts from reports (no list queue API) |
| Users & roles | FR-ADMIN-003..004 | Create user `POST /admin/users`; assign roles `PATCH /admin/users/:id/roles` by user id |
| Moving assign | FR-MOVE-005 | `POST /admin/moving/requests/:id/assign` with requestId + driverUserId |
| Master data CRUD | FR-ADMIN-005, MD-001..011 | Reusable entity pages for all `/admin/master-data/:entity` entities; DELETE soft-deactivates |
| Reports | FR-ADMIN-006 | From/to filters + overview sections (housing, bookings, moving, top performers) |
| House booking report | FR-ADMIN-007 | `/admin/reports/bookings` lists all booking records with date and status filters |

### Increment D

| Area | Requirement IDs | Notes |
| --- | --- | --- |
| Agent housing CRUD | FR-AGENT-002..003 | `/agent/houses` list/create/edit/delete against `/agent/houses` APIs; public sub-header **Post Housing Information** + UserMenu link for `agent` role; unverified agents see a clear verification banner and mutations stay disabled |
| Agent house bookings | FR-AGENT-004 | `/agent/bookings` lists bookings on own houses with booker details and cancel |

### Increment E

| Area | Requirement IDs | Notes |
| --- | --- | --- |
| Local file upload | §8.3–8.6, FR-PROFILE-001, NFR media | Shared `POST /uploads`; house/moving/profile/docs file pickers; public URL helper; admin protected-doc preview via `GET /admin/agents|drivers/:userId` + `/files/docs/:filename` |

See repo root `FileUploadSpecification.md`.

### Key routes

- `/` Home
- `/finding-house` House search/filters
- `/houses/:id` House details + booking / cancel
- `/houses/:id/bookings/:bookingId/confirmation` Booking confirmation + hire moving offer
- `/hire-moving` Moving request form (auth; accepts `bookingId` / `houseId`)
- `/hire-moving/:id` Moving request detail
- `/finding-roommates` Roommate browse + post
- `/agent-register` Agent registration (requires sign-in)
- `/agent/houses` Agent own listings (agent role)
- `/agent/houses/new` Create housing listing
- `/agent/houses/:id/edit` Edit housing listing
- `/agent/bookings` Bookings on the agent's posted houses
- `/driver-register` Driver registration (requires sign-in)
- `/profile` Account edit, password, reviews
- `/profile/wishlist` Wishlist houses
- `/profile/history` Bookings, moving, notifications summary
- `/driver/jobs` Driver available jobs workspace
- `/driver/jobs/:id` Driver job detail / actions
- `/admin/*` Admin portal (admin role only)
- `/admin/dashboard` Reports overview cards
- `/admin/verifications` Agent/driver verification by user ID
- `/admin/users` Create user + assign roles
- `/admin/moving-assign` Fallback moving assignment
- `/admin/master-data` Master-data entity index
- `/admin/master-data/:entity` Master-data CRUD workspace
- `/admin/reports` Period-filtered reports overview
- `/admin/reports/bookings` House booking report

## Environment

Copy `.env.example` to `.env`:

```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_DEFAULT_LOCALE=en
```

Backend CORS is expected to allow `http://localhost:5173`.
