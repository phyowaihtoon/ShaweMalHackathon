# Latest Web Notes (2026-08-11)

This file summarizes key points gathered from current official documentation pages while preparing this skill.

## Vite
Source: https://vite.dev/guide/

- Recommended scaffold command remains `npm create vite@latest`.
- React TypeScript template is available (`react-ts`).
- Node requirement listed as `20.19+` or `22.12+` for current major docs.
- Standard scripts are `dev`, `build`, and `preview`.

## Tailwind CSS with Vite
Source: https://tailwindcss.com/docs/installation/using-vite

- Tailwind docs recommend the Vite plugin path.
- Install: `tailwindcss` and `@tailwindcss/vite`.
- Add plugin in Vite config and `@import "tailwindcss";` in CSS entry.

## shadcn/ui for Vite
Source: https://ui.shadcn.com/docs/installation/vite

- Current docs provide multiple setup paths: shadcn/create, CLI, existing project.
- For existing Vite projects, docs call out alias setup (`@/*`) across TS config and Vite config.
- CLI usage includes `shadcn@latest init` and `add` commands for components.

## React Router
Sources:
- https://reactrouter.com/home
- https://reactrouter.com/start/declarative/installation

- Docs present three modes: Declarative, Data, Framework.
- Declarative install for standard React apps uses `react-router` package.
- BrowserRouter wrapping is part of declarative baseline.

## TanStack React Query
Sources:
- https://tanstack.com/query/latest/docs/framework/react/overview
- https://tanstack.com/query/latest/docs/framework/react/installation

- Install package: `@tanstack/react-query`.
- React compatibility listed as React 18+.
- QueryClient + QueryClientProvider remain baseline integration.

## React Hook Form
Source: https://react-hook-form.com/get-started

- Install command remains `npm install react-hook-form`.
- Core primitives remain `useForm`, `register`, `handleSubmit`, and `errors` from `formState`.
- For controlled UI components (including shadcn patterns), use `Controller`.

## Vitest
Source: https://vitest.dev/guide/

- Install: `npm install -D vitest`.
- Docs state Vitest requires Vite >= 6 and Node >= 20.
- `vitest run` is recommended for one-shot CI runs.

## Lucide React
Source: https://lucide.dev/guide/packages/lucide-react

- `lucide-react` provides tree-shakable icon components.
- Icons are typed React components and customizable by props.

## i18next / react-i18next
Sources:
- https://www.i18next.com/overview/getting-started
- https://react.i18next.com/latest/using-with-hooks

- Install core: `i18next` and `react-i18next`.
- Hook-based integration uses `useTranslation`.
- Translation JSON files under locale folders are a standard baseline pattern.

## JWT Verification Guidance
Sources:
- https://auth0.com/docs/secure/tokens/json-web-tokens
- https://www.rfc-editor.org/rfc/rfc7519

- JWT validation must include signature verification before trusting claims.
- JWT payload is not encrypted by default in JWS form; avoid sensitive payload content.
- Use HTTPS and modern libraries; treat client-side decode as non-authoritative.

## Notes on Reliability

- `https://jwt.io/introduction` did not resolve in this environment during retrieval (`ERR_NAME_NOT_RESOLVED`), so JWT practical guidance was taken from Auth0 docs + RFC 7519 references.
- When implementing, prefer checking current package versions at install time (`npm info`, `pnpm info`) because versions can drift after this note.
