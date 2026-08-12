# Latest Web Notes (2026-08-11)

This file summarizes key points gathered from current official documentation for the backend starter stack.

## Express
Sources:
- https://expressjs.com/
- https://expressjs.com/en/guide/using-middleware.html
- https://expressjs.com/en/guide/error-handling.html

Highlights:

- Express 5.x docs emphasize middleware-first composition and route/middleware layering.
- Error middleware signature remains `(err, req, res, next)` and should be mounted last.
- Async route handlers that reject will propagate errors to Express.
- When `res.headersSent` is true in custom error middleware, delegate to default error handler via `next(err)`.

## Prisma + Prisma Migrate + MySQL
Sources:
- https://www.prisma.io/docs/getting-started
- https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate
- https://www.prisma.io/docs/orm/reference/connection-urls
- https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/generating-prisma-client

Highlights:

- Prisma 7 is current GA in docs context.
- Prisma Migrate maintains SQL migration history and supports dev/prod workflows.
- For MySQL connection URLs, special characters in credentials must be percent-encoded.
- Prisma Client generation is an explicit step after schema changes.
- Prisma v7 docs note generator `output` requirement in current generation docs.

## TypeScript
Source:
- https://www.typescriptlang.org/docs/

Highlights:

- Maintain strict compiler settings and clear tsconfig ownership.
- Keep separate app/runtime and test configuration concerns where needed.

## tsx (watch mode)
Sources:
- https://github.com/privatenumber/tsx
- https://tsx.hirok.io (referenced by repo README)

Highlights:

- `tsx` is actively maintained and widely used for running TypeScript directly in Node.
- Use `tsx --watch` for development watch mode in starter scripts.

## express-validator
Source:
- https://express-validator.github.io/docs/

Highlights:

- Validation is middleware-based and designed for Express-style request objects.
- Centralizing validation result handling (`validationResult`) is recommended for consistent API errors.

## CORS middleware
Source:
- https://www.npmjs.com/package/cors

Highlights:

- `cors` sets CORS response headers for browser enforcement.
- CORS is not authentication/authorization; backend auth must still be enforced.
- Dynamic origin configuration is supported for per-request policies.

## Jest
Source:
- https://jestjs.io/docs/getting-started

Highlights:

- Jest install and CLI flow remain standard.
- TypeScript setup commonly uses ts-jest or Babel; ts-jest is practical for TS backend starters.

## Supertest
Source:
- https://github.com/ladjs/supertest

Highlights:

- Supertest supports direct testing against Express app instances without fixed listening ports.
- Works well with async/await and expectation chaining for API integration tests.

## ESLint + typescript-eslint
Sources:
- https://eslint.org/docs/latest/use/getting-started
- https://typescript-eslint.io/getting-started/

Highlights:

- ESLint flat config is current standard.
- typescript-eslint quickstart recommends `eslint`, `@eslint/js`, `typescript`, `typescript-eslint` packages.
- Recommended configs can be extended with stricter presets when needed.

## JWT library and verification behavior
Source:
- https://github.com/auth0/node-jsonwebtoken

Highlights:

- `jsonwebtoken` supports common JWT algorithms and expiration options.
- Verify APIs return explicit error types (`TokenExpiredError`, `JsonWebTokenError`, `NotBeforeError`).
- Verify with explicit allowed algorithms and expected claims when possible.

## Reliability Notes

- `https://www.prisma.io/docs/orm/quickstart/mysql` returned 404 in this environment during fetch, but MySQL quickstart path is referenced from the main Prisma getting started page and related ORM docs were successfully retrieved.
- `https://www.npmjs.com/package/tsx` did not return parseable content in this environment; tsx details were sourced from its official GitHub repository and linked docs site.
- For implementation-time accuracy, always re-check exact package versions (`npm info` / release pages) before generating lockfiles.
