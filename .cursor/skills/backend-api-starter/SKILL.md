---
name: backend-api-starter
description: "Create a TypeScript + Express + Prisma + MySQL backend API starter with Express Validator, CORS, JWT auth (register/login/verify), API versioning, environment config, robust error handling, tsx dev watch mode, ESLint + typescript-eslint, and Jest + Supertest unit/integration tests. Use when scaffolding a modern backend API starter blueprint without business domain features."
---

# Backend API Starter Skill

## Purpose
Use this skill to scaffold a backend API starter (architecture + implementation baseline, not business features) with:

- TypeScript
- Express
- Prisma
- MySQL
- Express Validator
- CORS
- Jest
- Supertest
- ESLint
- typescript-eslint
- tsx for development watch mode

Required capabilities:

- Standard layered architecture: routes, controllers, services, middleware, validators, utilities
- JWT register/login/token verification
- Request validation and consistent validation errors
- Centralized error handling
- Environment configuration
- Prisma migrations workflow
- API versioning (`/api/v1`)
- Unit and integration tests

## Inputs To Collect
Collect before coding. If missing, continue with defaults and document assumptions.

1. Package manager: `npm`, `pnpm`, `yarn`, `bun`
2. Project name
3. MySQL connection strategy (local docker, local service, cloud)
4. JWT algorithm (`HS256` default or asymmetric)
5. Access token expiration target (for example `15m`)
6. CORS policy (allowed origins, credentials true/false)
7. API prefix (default `/api/v1`)

## Required Output
Produce:

1. Working Express + TypeScript starter with layered structure.
2. Prisma + MySQL setup with migration scripts.
3. Auth endpoints for register/login/verify.
4. Versioned API routes.
5. Error handling and validation middleware.
6. ESLint + typescript-eslint configuration.
7. Jest unit tests and Supertest integration tests.
8. README section with scripts and architecture notes.

## Recommended Structure

```text
src/
  app.ts
  server.ts
  config/
    env.ts
    logger.ts
  routes/
    index.ts
    v1/
      index.ts
      auth.routes.ts
      health.routes.ts
  controllers/
    auth.controller.ts
    health.controller.ts
  services/
    auth.service.ts
    token.service.ts
    user.service.ts
  middleware/
    auth.middleware.ts
    error.middleware.ts
    not-found.middleware.ts
    request-id.middleware.ts
    validate.middleware.ts
  validators/
    auth.validator.ts
  prisma/
    client.ts
  utils/
    api-error.ts
    api-response.ts
    async-handler.ts
    password.ts
    jwt.ts
    time.ts
  types/
    express.d.ts
prisma/
  schema.prisma
  migrations/
tests/
  unit/
    services/
    utils/
  integration/
    auth.test.ts
    health.test.ts
  helpers/
    test-app.ts
    test-db.ts
```

## Procedure

### 1. Initialize Foundation

1. Initialize TypeScript Node project.
2. Add runtime deps:
- `express`
- `prisma` + Prisma client package
- MySQL driver (`mysql2`)
- `express-validator`
- `cors`
- `jsonwebtoken`
3. Add dev deps:
- `typescript`
- `tsx`
- `jest`
- `ts-jest` (or babel strategy, but prefer ts-jest for direct TS workflow)
- `supertest`
- `eslint`
- `@eslint/js`
- `typescript-eslint`
- `@types/*` packages as needed

Script baseline:

- `dev`: run server with `tsx --watch`
- `build`: TypeScript compile
- `start`: run built server
- `test`: run Jest
- `test:unit`: run unit tests only
- `test:integration`: run integration tests only
- `lint`: run ESLint
- `prisma:migrate:dev`: development migrations
- `prisma:migrate:deploy`: production migrations
- `prisma:generate`: generate Prisma client

### 2. TypeScript + Linting

1. Configure `tsconfig.json` for strict mode and Node runtime.
2. Use ESLint flat config.
3. Apply `@eslint/js` recommended + `typescript-eslint` recommended minimum.
4. Optionally add `strict` and `stylistic` typed rule sets when requested.

### 3. Express App Composition

1. Create `app.ts` for middleware and route wiring.
2. Create `server.ts` for process start (separate for testability).
3. Add base middleware:
- `express.json()`
- `express.urlencoded()`
- CORS middleware
- request id middleware (optional but recommended)
4. Mount versioned router at `/api/v1`.
5. Add health route in v1 namespace.

### 4. Prisma + MySQL + Migrations

1. Configure Prisma datasource for MySQL in `schema.prisma`.
2. Keep `DATABASE_URL` in environment variables.
3. Create initial user model for auth.
4. Run `prisma migrate dev --name init` for development.
5. Run `prisma generate` whenever schema changes.
6. Use `prisma migrate deploy` for production release workflows.

Important notes:

- Ensure MySQL URL special characters are percent-encoded.
- Prefer checked-in SQL migration history from Prisma Migrate.

### 5. Environment Configuration

Create a config loader that validates required environment variables on startup.

Minimum variables:

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET` (or key path for asymmetric setup)
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`

Rules:

- Fail fast on missing/invalid required values.
- Avoid silently defaulting secrets.
- Keep environment parsing in one place (`src/config/env.ts`).

### 6. Validation Layer (Express Validator)

1. Define validators in `src/validators` (for example `registerValidator`, `loginValidator`).
2. Add a shared `validate` middleware to read `validationResult` and return normalized 400 errors.
3. Keep controllers free from validation shape logic.

Standard response for validation errors:

- `message`: stable high-level message
- `errors`: array with `field`, `msg`, `location`, optional `value`

### 7. Auth: Register, Login, Verify JWT

Required endpoints (under `/api/v1/auth`):

- `POST /register`
- `POST /login`
- `GET /verify` (or `/me` using token)

Flow:

1. Register
- validate payload
- check unique user constraint
- hash password
- create user via Prisma
- return safe user payload + token (optional immediate login)
2. Login
- validate payload
- find user
- compare password hash
- sign JWT with expiry
- return token + safe user payload
3. Verify
- parse bearer token
- verify signature and claims
- reject expired/malformed tokens
- return authenticated identity summary

JWT guard middleware:

- Read `Authorization: Bearer <token>`
- Verify with explicit allowed algorithm list
- Attach auth context to request
- Return 401 for missing/invalid tokens

### 8. Error Handling Standards

Use layered error handling:

1. `not-found` middleware for unmatched routes (404)
2. centralized error middleware last in chain

Error middleware rules:

- Respect `res.headersSent` and delegate with `next(err)` when needed
- Use consistent JSON envelope
- Hide stack traces in production
- Map known error categories (validation/auth/prisma) to stable status codes

### 9. API Versioning

Use explicit versioned routing:

- global prefix: `/api/v1`
- all resource routes mounted under `v1` router

Future versions:

- add `/api/v2` in parallel without breaking v1
- keep shared middleware reusable across versions

### 10. Testing Baseline

#### Unit tests (Jest)

Cover:

- password hash/compare utility
- JWT sign/verify helpers
- auth service methods with mocked Prisma client
- validation utility functions

#### Integration tests (Jest + Supertest)

Cover:

- `POST /api/v1/auth/register` success and validation failures
- `POST /api/v1/auth/login` success and invalid credentials
- `GET /api/v1/auth/verify` for:
  - missing token
  - malformed token
  - expired token
  - valid token
- `GET /api/v1/health`
- 404 handler behavior

Testing guidance:

- Export app instance without `listen()` for Supertest.
- Isolate test database state between tests.
- Avoid using production database in tests.

### 11. Definition of Done

All must be true:

1. `dev` starts with `tsx --watch`.
2. Lint passes.
3. Type-check/build passes.
4. Prisma migration workflow is documented and functional.
5. Auth register/login/verify endpoints function.
6. Validation and error responses are consistent.
7. API uses `/api/v1` prefix.
8. Unit and integration tests pass.

## Security Baseline

- Do not log JWT secrets or raw passwords.
- Prefer short-lived access tokens.
- Validate algorithm and key type explicitly during verify.
- Treat decoded token payload as untrusted until verified.
- Use HTTPS in non-local environments.

## References

- [Latest web research summary](./references/latest-web-notes.md)
