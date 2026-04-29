# Behavioral Guidelines

**Reduce common mistakes. Merge with project context below.**

## 1. Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.

- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them—don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing.

## 2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

## 3. Surgical Changes

Touch only what you must. Clean up only your own mess.

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- Remove imports/variables made unused by YOUR changes only.

## 4. Goal-Driven Execution

Define success criteria. Loop until verified.

- "Add validation" → Write tests for invalid inputs, then make them pass
- "Fix the bug" → Write a test that reproduces it, then fix it
- "Refactor X" → Ensure tests pass before and after

---

# Project Context

**Language-learning e-book platform.** React SPA frontend + NestJS backend + PostgreSQL via Prisma. Auth is JWT-based (NestJS-issued). File uploads use browser→R2 presigned PUTs: backend signs short-lived URLs, browser uploads directly to Cloudflare R2.

## Rules

- Do NOT read or list files inside `node_modules/` directories.

## Architecture

```
React SPA (frontend/)
  └─ CompositionRoot wires API adapters (ApiBookRepo, ApiAuthGateway, etc.)
  └─ Use cases and hooks are untouched — they depend only on port interfaces
         │ HTTP REST + Bearer JWT
         ▼
NestJS Backend (backend/)
  ├─ AuthModule       — register, login, GET /auth/me
  ├─ BooksModule      — CRUD + R2 presigned uploads (cover + flipbook content)
  ├─ ReviewsModule    — CRUD + average rating recalculation
  ├─ PaymentsModule   — receipt upload + approve/reject + subscription logic
  ├─ UsersModule      — list users, admin subscription toggle
  ├─ TicketsModule    — support ticket CRUD
  └─ DashboardModule  — counts (users, books, pending payments)
  Prisma ORM → PostgreSQL
  AWS S3 SDK → Cloudflare R2 (presigned URL signing only)
```

## Key Decisions

| Concern | Choice | Reason |
|---|---|---|
| Database | PostgreSQL + Prisma | Relational structure; type-safe client |
| Auth | JWT via Passport | Stateless; mirrors existing `getToken()` pattern |
| File uploads | Browser → R2 presigned PUT | Single storage; backend only signs URLs |
| API style | REST | Matches existing use-case-per-endpoint granularity |

## Domain Ports (frontend)

`BookRepo`, `ReviewRepo`, `PaymentRepo`, `UserRepo`, `AuthGateway`, `FileUploader`, `Clock`, `Logger` — all wired in `CompositionRoot.tsx`. Never bypass these ports from hooks or pages.

## Auth

- JWT payload: `{ sub: userId, email, role }`
- Token expiry: 7 days (`JWT_EXPIRES_IN`)
- `JwtAuthGuard` on all protected routes
- `RolesGuard` + `@Roles('ADMIN')` for admin-only endpoints
- Auth response shape: `{ accessToken, user: { id, email, fullName, role, isSubscribed, subscriptionStatus } }`

## Frontend Adapter Convention

All new infrastructure lives in `src/infrastructure/api/`. Each adapter implements a port interface. `ApiClient.ts` injects `Authorization: Bearer <token>` from localStorage and reads `VITE_API_URL` for the base URL.

`subscribeToUser` (Firebase realtime) → replaced by polling `GET /auth/me` every 30s (or TanStack Query `refetchInterval`).

## Environment Variables (backend/.env)

```
DATABASE_URL=postgresql://user:pass@localhost:5432/ebook_platform
JWT_SECRET=<random-secret>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
PORT=3000
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_REGION=auto
S3_BUCKET=...
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_PUBLIC_BASE_URL=https://pub-<hash>.r2.dev
```

## R2 Bucket Configuration

**CORS:** set `MaxAgeSeconds` to a long value (e.g. 86400) so PUT preflights are cached — without it, every PUT pays a CORS roundtrip and bulk uploads halve in throughput.

**Lifecycle rule — `AbortIncompleteMultipartUpload`:** required to clean up orphaned multipart uploads when a flipbook upload is cancelled or fails mid-flight. Without it, partial parts accumulate as billable storage with no visible objects. Recommended setting: abort after **3 days**. Configure in Cloudflare dashboard → R2 → bucket → Settings → Object lifecycle rules.

## Dev Setup

```bash
# Start Postgres (Docker)
docker compose up -d

# Run migrations
cd backend && npx prisma migrate dev

# Start backend
cd backend && npm run start:dev

# Start frontend
cd frontend && npm run dev
```

## Testing

- Backend: `cd backend && npm test`
- Frontend unit/domain: `cd frontend && npx vitest run`
- Domain and application-layer tests are pure — no Firebase, no network. They must always pass.
