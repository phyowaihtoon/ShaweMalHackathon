---
name: frontend-api-starter
description: "Create a Vite + React + TypeScript frontend starter with Vitest, TanStack React Query, React Router, React Hook Form, shadcn/ui + Tailwind CSS, Lucide icons, light/dark mode toggle, English/Myanmar localization files, public/admin portals, JWT auth flow, providers, and baseline tests. Use when scaffolding a modern frontend API starter blueprint without generating full business features."
---

# Frontend API Starter Skill

## Purpose
Use this skill to design and scaffold a production-oriented frontend starter architecture (not business features) with these requirements:

- Vite
- React
- TypeScript
- Vitest
- TanStack React Query
- React Router
- React Hook Form
- shadcn/ui with Tailwind CSS
- Lucide React icons
- Light and dark mode with toggle
- Localization with English and Myanmar toggles and translation JSON files
- Public portal with empty layout and routes: Home, About Us, Agent Register, Sign Up, Sign In
- Admin portal with JWT register/login and token verification guard
- Proper app-wide providers
- Standard baseline tests

This skill is intended to let an agent build the codebase later with clear, modern defaults.

## Inputs Expected From User
Collect these before making code changes:

1. Package manager: `npm`, `pnpm`, `yarn`, or `bun`
2. Project/app name
3. API base URL(s): public and admin if different
4. JWT storage preference: memory+refresh-cookie or localStorage (default: localStorage for starter simplicity)
5. Admin auth API contract:
- Register endpoint
- Login endpoint
- Verify/me endpoint
- Token refresh endpoint (if available)
6. Localization default language: `en` or `my`

If any is missing, proceed with sensible defaults and document assumptions.

## Required Output
Produce:

1. A working starter app with a clear folder structure.
2. Public and admin route shells.
3. Providers composed at app root.
4. Auth flow with JWT verification gate for admin routes.
5. Translation resource files for English and Myanmar.
6. Standard tests that pass.
7. Short README section on scripts and architecture.

## Recommended Project Structure
Use this layout as default:

```text
src/
  app/
    providers/
      AppProviders.tsx
      ThemeProvider.tsx
      QueryProvider.tsx
      RouterProvider.tsx
      I18nProvider.tsx
      AuthProvider.tsx
    router/
      index.tsx
      public-routes.tsx
      admin-routes.tsx
      guards.tsx
  features/
    auth/
      api/
      hooks/
      pages/
      schemas/
      types/
    public/
      layout/
      pages/
    admin/
      layout/
      pages/
  components/
    ui/
    common/
  lib/
    api/
      client.ts
      interceptors.ts
    i18n/
      index.ts
      locales/
        en.json
        my.json
    auth/
      token-storage.ts
      jwt.ts
  test/
    setup.ts
    utils.tsx
```

## Procedure

### 1. Initialize App Foundation

1. Scaffold with Vite React TypeScript template.
2. Install runtime dependencies:
- `react-router`
- `@tanstack/react-query`
- `react-hook-form`
- `react-i18next i18next`
- `lucide-react`
- `next-themes` (or equivalent class-based theme manager)
3. Install UI/style dependencies:
- `tailwindcss @tailwindcss/vite`
- shadcn tooling and selected base components
4. Install testing dependencies:
- `vitest`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- `jsdom`

Reference: [official links and latest notes](./references/latest-web-notes.md).

### 2. Configure Tailwind + shadcn/ui + aliases

1. Enable Tailwind via Vite plugin.
2. Configure path alias `@/*` in `tsconfig.json`, `tsconfig.app.json`, and Vite config.
3. Initialize shadcn/ui for Vite template.
4. Add at least these components: button, card, input, form, dropdown-menu, separator.

### 3. Compose Providers

Create a single `AppProviders` composition wrapper. Recommended provider order:

1. Theme provider
2. I18n provider
3. QueryClient provider
4. Auth provider
5. Router provider

Notes:

- Keep QueryClient singleton in module scope.
- Set practical query defaults (`retry`, `staleTime`, `refetchOnWindowFocus`).
- Expose typed hooks from each provider domain.

### 4. Public Portal Shell

Implement an empty public layout with a simple top navigation and route outlet.

Required public routes:

- `/` -> Home page
- `/about-us` -> About Us page
- `/agent-register` -> Agent Register page
- `/sign-up` -> Sign Up page
- `/sign-in` -> Sign In page

The pages can be minimal placeholders but must render unique headings for testability.

### 5. Admin Portal + JWT Auth

Implement standard auth flow:

1. Register form (React Hook Form)
2. Login form (React Hook Form)
3. Token storage utility
4. `verifyToken` API call or `me` endpoint call
5. Protected admin route guard

Admin routes example:

- `/admin/sign-in`
- `/admin/register`
- `/admin`
- `/admin/dashboard`

Guard behavior:

- No token: redirect to `/admin/sign-in`
- Token present: call verify endpoint (or decode+expiry check + verify endpoint)
- Invalid token/401: clear token and redirect to sign-in
- Valid token: render admin layout and outlet

Security baseline:

- Always send auth over HTTPS environments.
- Do not trust client-side decode alone; server verification is required.
- Validate `exp` claim client-side only as a quick pre-check.
- Handle 401 globally in API interceptor to force sign-out.

### 6. API Layer and React Query Integration

1. Create shared HTTP client module.
2. Add auth header injection interceptor.
3. Add response interceptor for 401 handling.
4. Use React Query for auth verification and profile bootstrap in admin area.
5. Keep mutation hooks colocated in `features/auth/hooks`.

### 7. Localization (English/Myanmar)

Use `react-i18next` with resource files.

Required locales:

- [en.json](./assets/locales/en.json)
- [my.json](./assets/locales/my.json)

Requirements:

- Language toggle control in UI with `en` and `my` options
- Default language configurable
- Persist language in localStorage
- Route labels and auth form labels sourced from i18n keys

### 8. Light/Dark Mode Toggle

Requirements:

- Theme toggle in header/nav
- `light`, `dark`, and optional `system`
- Persist preference in localStorage
- Ensure shadcn + Tailwind classes react to theme class

### 9. Baseline Tests

Add standard tests:

1. Smoke test: app renders providers and home heading
2. Routing test: navigation to each public route renders correct page heading
3. Theme toggle test: toggling updates root theme class
4. Language toggle test: switching language updates visible strings
5. Auth guard test:
- no token redirects to admin sign-in
- invalid token redirects and clears storage
- valid token allows admin dashboard render
6. Auth form validation test with React Hook Form errors

### 10. Definition of Done

All must be true:

1. Dev server starts and routes are reachable.
2. Public pages exist with specified names.
3. Admin auth register/login/verify flow is wired.
4. Providers are modular and composed once at root.
5. Locale files exist and toggle works.
6. Theme toggle works.
7. Tests pass via Vitest.
8. README updated with architecture and scripts.

## Quality Checks

Before finishing:

1. Run type-check/build.
2. Run tests in CI mode (`vitest run`).
3. Ensure no hard-coded text remains for strings that should be translated.
4. Confirm admin guard handles expired and malformed JWT.
5. Confirm no sensitive claim data is persisted beyond token string.

## Implementation Notes for Future Agent

- Keep the first iteration intentionally thin: no business API modules outside auth and sample pages.
- Prefer small provider files and typed hooks over a monolithic `context.tsx`.
- If backend contract is unknown, implement mock service adapters behind feature flags.
- Keep route paths and i18n keys stable for test reliability.

## References

- [Latest web research summary](./references/latest-web-notes.md)
- [Locale template EN](./assets/locales/en.json)
- [Locale template MY](./assets/locales/my.json)
