# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

npm-workspaces monorepo:

```
apps/
├── frontend/   # React 19 + Vite 7 SPA (deployed on Netlify)
└── api/        # NestJS 11 REST API + Prisma + PostgreSQL (Neon)
```

Root scripts:
```bash
npm run frontend:dev   # Vite dev server (apps/frontend)
npm run api:dev        # Nest watch mode (apps/api)
npm run build          # Build the frontend only
```

## Backend (`apps/api`)

### Stack
- **NestJS 11** with a global `/api` prefix (`main.ts`)
- **Prisma 7** over **PostgreSQL** (Neon). `DATABASE_URL` = pooled (6543), `DIRECT_URL` = direct (5432, for migrations)
- **JWT auth**: 15-min access token (`Authorization: Bearer` header) + rotating opaque refresh token (7 days, stored in the `RefreshToken` table)
- **bcryptjs** password hashing (cost 12)
- **Chargily Pay v2** for subscription payments (webhook-driven)
- **helmet** security headers + global **@nestjs/throttler** rate limiting (100 req/min/IP baseline; 5 req/min on auth routes)

### Commands (run from `apps/api`)
```bash
npm run start:dev        # Watch mode
npm run build            # nest build
npm run lint             # ESLint --fix (must pass clean)
npm run prisma:migrate   # Create/apply a dev migration
npm run prisma:deploy    # Apply migrations in production
npm run prisma:generate  # Regenerate Prisma client
```

### Module layout (`apps/api/src`)
`auth/`, `books/`, `users/`, `payments/`, `reviews/`, `tickets/`, plus `prisma/` (global service) and `common/types.ts` (typed request interfaces).

### Auth & Guards
- `JwtStrategy` validates the token and loads the **full User from the DB on every request**, so role/subscription changes take effect immediately (no stale-claim window).
- `JwtAuthGuard` — requires a valid token.
- `OptionalJwtGuard` — attaches `req.user` if a token is present, otherwise allows through (used for public book listing so tier gating can still apply).
- `AdminGuard` — requires `req.user.role === ADMIN`.
- Token is read from the `Authorization` header **or** a `token` query param (the latter only for the `/books/:id/read` iframe).

### Tiered Access Control
Books and users each carry a tier (`FREE | PRO | GOLD`). `canAccess(bookTier, userPlan)` in `books.service.ts` is the single gate:
- `FREE` book → everyone
- `PRO` book → `PRO` or `GOLD` user
- `GOLD` book → `GOLD` user only
- Admins bypass all tiers.

`indexURL` (the real book content URL) is **never** returned by the list endpoint and is stripped from single-book responses when the user isn't entitled.

### Book Reader
`GET /books/:id/read` (JWT-guarded) proxies the book HTML server-side:
1. Checks the `referer` is the frontend origin (defense-in-depth).
2. Re-checks tier entitlement.
3. Fetches `indexURL`, injects a `<base>` tag + anti-framing/anti-context-menu script, returns the HTML.

Note: the anti-framing script is cosmetic content protection, not DRM.

### Subscription Payment Flow (Chargily)
1. `POST /payments/chargily/checkout` (JWT) with `{ plan: "PRO" | "GOLD" }`. `fullName` is taken from the authenticated user, never the body. Creates a `PENDING` `PaymentRequest` + a Chargily checkout, returns `checkoutUrl`.
2. User pays on Chargily's hosted page.
3. `POST /payments/chargily/webhook` (no auth guard; **HMAC-SHA256 signature verified** against `CHARGILY_SECRET`, timing-safe). On `checkout.paid`, marks the request `APPROVED` and activates the user's subscription (`isSubscribed`, `subscriptionPlan`, `subscriptionEndDate` = +1 month) in a transaction. On `checkout.failed` / `checkout.canceled` / `checkout.expired`, marks the request `REJECTED` and resets the user's `subscriptionStatus` to `REJECTED` so the frontend stops showing a stuck "pending payment" state.
4. Admin views history at `GET /payments/history` (admin only).

Webhook activation/rejection is idempotent: it no-ops unless the matching `PaymentRequest` is still `PENDING`.

### Prisma Models
`User`, `Book`, `Review` (unique per user+book, maintains `averageRating`/`totalReviews` aggregates), `PaymentRequest`, `Ticket`, `RefreshToken`. See `apps/api/prisma/schema.prisma`.

## Frontend (`apps/frontend`)

### Stack
- **React 19 + Vite 7** SPA, deployed on **Netlify**
- **TanStack Query v5** for async data
- **Cloudinary** for media uploads (book covers)
- Talks to the NestJS API via `src/lib/api.ts` (a `fetch` wrapper that attaches the access token and transparently refreshes on 401)

### Data Flow
```
Pages/Components → src/hooks/** (TanStack Query) → src/services/*.ts (api() calls) → NestJS API
```

### Auth
- Tokens are stored in `localStorage` (`accessToken`, `refreshToken`).
- `AuthContext` (`src/context/AuthContext.tsx`) is the source of truth for `user`, `isAdmin`, `isSubscribed`, `subscriptionPlan`. It hydrates from `GET /users/me`.
- Route guards: `PublicRoute`, `ProtectedRoute`, `AdminRoute`. Non-critical pages are lazy-loaded.

### Book Metadata
Three orthogonal dimensions (see `src/constants/bookOptions.ts`):
- `targetLanguage`: `AR | EN | FR`
- `focusSkill`: `GRAMMAR | VOCABULARY | READING | LISTENING | SPEAKING | ALL_IN_ONE`
- `proficiencyLevel`: CEFR `A1 | A2 | B1 | B2 | C1 | C2`

## Environment Variables

### API (`apps/api/.env`) — see `.env.example`
```
DATABASE_URL          # Neon pooled connection (6543)
DIRECT_URL            # Neon direct connection (5432, migrations)
JWT_SECRET
JWT_REFRESH_SECRET
PORT                  # default 3000
FRONTEND_URL          # CORS origin + reader referer check
CHARGILY_MODE         # test | live
CHARGILY_SECRET       # Bearer token AND webhook signature secret
CHARGILY_SUCCESS_URL
CHARGILY_FAILURE_URL
```

### Frontend (`apps/frontend/.env`)
```
VITE_API_URL          # e.g. https://api.example.com/api
VITE_CLOUDINARY_UPLOAD_PRESET
VITE_CLOUDINARY_CLOUD_NAME
```

## Notes / Known Gaps
- **No test suite yet** (only `app.controller.spec.ts`). Payment webhook, `canAccess`, and auth flows are the priority targets.
- When deploying behind a proxy/CDN, set Express `trust proxy` so throttler and logging see the real client IP.
- Refresh tokens are not garbage-collected; expired rows accumulate (add a cleanup job).
