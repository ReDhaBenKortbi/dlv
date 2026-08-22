# DLV API

NestJS 11 REST API for the DLV language-learning book platform. Handles
accounts, the book catalog, tiered access, reviews, support tickets, and
Chargily subscription payments, backed by PostgreSQL via Prisma.

See the [root README](../../README.md) for how this fits into the whole
project, and [`docs/API.md`](../../docs/API.md) / [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md)
in the repo root for the full endpoint list and how auth/tiers/payments work.

## Setup

```bash
npm install                 # from the repo root, installs all workspaces
cp .env.example .env        # then fill in the values (see table below)
npm run prisma:migrate      # creates the database tables
npm run start:dev           # starts the API on http://localhost:3000
```

Routes are served under the `/api` prefix, e.g. `http://localhost:3000/api/books`.

## Commands

```bash
npm run start:dev        # watch mode
npm run start:prod       # run the compiled build (dist/src/main.js)
npm run build             # compile with nest build
npm run lint              # ESLint --fix, must pass clean before committing
npm run test               # unit tests (jest) — currently minimal coverage
npm run test:e2e           # end-to-end tests
npm run prisma:generate    # regenerate the Prisma client after a schema change
npm run prisma:migrate     # create + apply a migration in dev
npm run prisma:deploy      # apply existing migrations in production
npm run prisma:studio      # open Prisma's DB browser GUI
```

## Environment variables

| Variable | Required | What it's for |
|---|---|---|
| `DATABASE_URL` | yes | Pooled Postgres connection (Neon, port 6543) — used at runtime |
| `DIRECT_URL` | yes | Direct Postgres connection (port 5432) — used for migrations |
| `JWT_SECRET` | yes | Signs access tokens (32+ chars, random) |
| `JWT_REFRESH_SECRET` | yes | Signs refresh tokens (32+ chars, random, different from above) |
| `NODE_ENV` | yes | `production` on the deployed API — controls the refresh cookie's `Secure`/`SameSite=None` flags |
| `PORT` | no | Defaults to `3000` |
| `FRONTEND_URL` | yes | CORS origin + the reader endpoint's referer check |
| `SENTRY_DSN` | no | Leave blank to disable error tracking |
| `RESEND_API_KEY` | no | Leave blank to disable password-reset emails (they get logged to the console instead) |
| `RESEND_FROM_EMAIL` | no | Must be on a domain verified with Resend — a Gmail/Outlook address won't work |
| `CHARGILY_API_KEY` | yes* | Chargily API key (*required once payments are enabled) |
| `CHARGILY_MODE` | yes* | `test` or `live` |
| `CHARGILY_SECRET` | yes* | Used both as the Chargily API bearer token and to verify webhook signatures |
| `CHARGILY_SUCCESS_URL` / `CHARGILY_FAILURE_URL` | yes* | Where Chargily redirects the user after checkout |

Full list with comments: [`.env.example`](.env.example).

## Project layout

```
src/
├── auth/       Login, register, refresh, password reset, JWT strategy + guards
├── books/      Catalog, tier gating, the in-app reader proxy
├── users/      Admin user management, "who am I" endpoint
├── payments/   Chargily checkout + webhook handling
├── reviews/    Per-book ratings/comments
├── tickets/    Support tickets (user-submitted, admin-managed)
├── health/     Liveness check used by the hosting platform
├── prisma/     Global PrismaService wrapping the Prisma client
└── common/     Shared types (e.g. AuthenticatedRequest) and DTOs (e.g. pagination)
```

Each feature module follows the same shape: a `*.controller.ts` (routes), a
`*.service.ts` (logic + DB access), and a `dto/` folder (request validation
via `class-validator`).

### Guards

- `JwtAuthGuard` — requires a valid access token.
- `OptionalJwtGuard` — attaches the user if a token is present, otherwise
  lets the request through anonymously (used where public + gated content
  share an endpoint, like the book list).
- `AdminGuard` — requires `req.user.role === 'ADMIN'`.

### Database

Schema lives in [`prisma/schema.prisma`](prisma/schema.prisma). Key models:
`User`, `Book`, `Review`, `PaymentRequest`, `Ticket`, `RefreshToken`,
`PasswordResetToken`. After changing the schema, run `npm run prisma:migrate`
to create a migration and regenerate the client.

## Known gaps

- No meaningful test suite yet. If you're adding tests, prioritize the
  payment webhook, the `canAccess` tier check in `books.service.ts`, and the
  auth flows — they're the highest-risk, least-covered paths.
- Refresh tokens and password-reset tokens aren't garbage-collected; expired
  rows just accumulate in the DB. A cleanup job would help.
- Make sure the production host actually sets `NODE_ENV=production` — the
  refresh cookie silently stops working cross-origin otherwise.
