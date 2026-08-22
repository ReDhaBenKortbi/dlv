# DLV — Language Learning Book Platform

DLV is a web app for reading language-learning books online. Readers browse a
library, sign up for a subscription plan, and read books through an in-app
reader. Admins upload books, manage users, and handle support tickets.

The project is a monorepo with two apps:

```
apps/
├── frontend/   React 19 + Vite SPA — what users see in the browser
└── api/        NestJS 11 REST API — auth, books, payments, everything else
```

The frontend talks to the API over HTTPS. The API talks to a PostgreSQL
database (hosted on Neon) and to Chargily (a payment provider) for
subscriptions.

## How it works, in short

- **Books** have a tier: `FREE`, `PRO`, or `GOLD`. A book's tier decides who
  can read it — a `PRO` book needs a `PRO` or `GOLD` subscription, a `GOLD`
  book needs `GOLD`. Admins can read anything.
- **Accounts** are protected with short-lived login tokens (15 minutes) that
  refresh automatically in the background, so users stay logged in without
  the token ever touching browser storage that a malicious script could read.
- **Subscriptions** are paid for through Chargily's hosted checkout page.
  When Chargily confirms a payment, it notifies the API directly (a
  "webhook"), and the API upgrades the user's account.
- **Reviews and support tickets** let logged-in users rate books and contact
  the team; admins moderate both from an admin dashboard.

For the full technical breakdown of each piece, see:

- [`apps/api/README.md`](apps/api/README.md) — backend setup and structure
- [`apps/frontend/README.md`](apps/frontend/README.md) — frontend setup and structure
- [`docs/API.md`](docs/API.md) — every API endpoint, what it does, and who can call it
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how login, tiered access, and payments actually work under the hood

## Running it locally

You'll need Node.js and a PostgreSQL database (the project is built against
[Neon](https://neon.tech), but any Postgres works for local dev).

```bash
# 1. Install dependencies for both apps
npm install

# 2. Set up the API's environment variables (DB connection, JWT secrets, etc.)
cp apps/api/.env.example apps/api/.env
# then fill in the values — see apps/api/README.md for what each one means

# 3. Apply the database schema
cd apps/api && npm run prisma:migrate && cd ../..

# 4. Set up the frontend's environment variables
cp apps/frontend/.env.example apps/frontend/.env
# fill in VITE_API_URL to point at your local API (e.g. http://localhost:3000/api)

# 5. Start both apps (in separate terminals)
npm run api:dev
npm run frontend:dev
```

The API runs on `http://localhost:3000` (routes under `/api`), the frontend
on `http://localhost:5173` (Vite's default).

## Tech stack at a glance

| Layer | Choice |
|---|---|
| Frontend | React 19, Vite 7, TanStack Query, Tailwind + daisyUI, React Router 7 |
| Backend | NestJS 11, Prisma 7, PostgreSQL (Neon) |
| Auth | JWT access tokens + rotating refresh tokens (httpOnly cookie) |
| Payments | Chargily Pay v2 (webhook-driven) |
| Media uploads | Cloudinary (book covers) |
| Error tracking | Sentry |
| Hosting | Frontend on Netlify; API wherever Node + Postgres is available |

## Notes

- There's no automated test suite yet — the priority areas to cover first
  are the payment webhook, the tier-access check (`canAccess`), and the auth
  flows.
- See the root [`CLAUDE.md`](CLAUDE.md) for deeper implementation notes aimed
  at AI coding assistants (it doubles as a solid engineering reference too).
