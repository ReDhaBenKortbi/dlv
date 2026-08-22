# API Reference

Every route the DLV API exposes, in plain language. All paths below are
relative to the API base URL and already include the global `/api` prefix
(so "`/books`" means `GET https://your-api.example.com/api/books`).

Requests are validated with `class-validator` — any field not listed in a
DTO is rejected, and required fields must be present and correctly typed.

**Rate limits:** 100 requests/minute/IP everywhere by default. The four
credential endpoints in Auth (`register`, `login`, `refresh`,
`forgot-password`, `reset-password`) are tightened to 5/minute/IP to blunt
brute-force attempts. The Chargily webhook and the health check are exempt
from rate limiting entirely.

**Guards, referenced throughout:**
- **Public** — no login needed.
- **Logged in** — needs a valid access token (`Authorization: Bearer <token>`).
- **Optional login** — works either way; if you're logged in, the response
  may include more (e.g. gated content you're entitled to).
- **Admin** — needs a valid access token *and* `role === 'ADMIN'`.

---

## Auth (`/auth`)

| Method & Path | Access | What it does |
|---|---|---|
| `POST /auth/register` | Public | Creates an account. Body: `fullName`, `email`, `password` (min 8 chars). Returns `{ accessToken }` and sets the refresh cookie. |
| `POST /auth/login` | Public | Body: `email`, `password`. Returns `{ accessToken }` and sets the refresh cookie. |
| `POST /auth/refresh` | Public (needs the refresh cookie) | Reads the refresh token from the `httpOnly` cookie, rotates it, and returns a new `{ accessToken }`. This is what keeps you logged in across page reloads. |
| `POST /auth/logout` | Logged in | Invalidates the current refresh token and clears the cookie. Returns `204 No Content`. |
| `POST /auth/forgot-password` | Public | Body: `email`. Always returns the same generic message, whether or not that email is registered, so no one can use it to check who has an account. Sends a reset email via Resend if configured, otherwise the reset link is just logged server-side. |
| `POST /auth/reset-password` | Public | Body: `token`, `newPassword` (min 8 chars). Uses the token from the reset email to set a new password. |

## Books (`/books`)

| Method & Path | Access | What it does |
|---|---|---|
| `GET /books` | Optional login | Lists books. Query params: `search`, `targetLanguage`, `focusSkill` (comma-separated or repeated), `proficiencyLevel` (same), `page`, `limit` (max 50, default 20), `raw` (boolean — `true` returns individual tier editions as separate rows for the admin table; default `false` groups same-title editions into one card). Never includes `indexURL` (the real content URL). |
| `GET /books/:id` | Optional login | One book's details. `indexURL` is stripped out unless the caller is entitled to that book's tier (or is an admin). |
| `GET /books/:id/read` | Logged in | Proxies the actual book content. Checks the `Referer` header matches the frontend origin, re-checks tier entitlement, then fetches and returns the book's HTML with anti-framing/anti-context-menu protections injected. This is what the in-app reader loads in an iframe. Not a download link — it's meant to be embedded, not linked to directly. |
| `POST /books` | Admin | Creates a book. Body: `title`, `author`, `description`, `coverURL` (must be a URL), `indexURL` (must be a URL), and optionally `bookTier` (`FREE`\|`PRO`\|`GOLD`, defaults `FREE`), `groupKey` (links tier editions of the same title so they render as one card with an edition switcher), `targetLanguage`, `focusSkill`, `proficiencyLevel`. |
| `PATCH /books/:id` | Admin | Same fields as create, all optional — updates only what's provided. |
| `DELETE /books/:id` | Admin | Deletes a book. Returns `204 No Content`. |

## Reviews (`/books/:bookId/reviews`)

| Method & Path | Access | What it does |
|---|---|---|
| `GET /books/:bookId/reviews` | Public | Paginated reviews for a book. Query: `page`, `limit` (max 50, default **9** — sized to fit the review grid). |
| `GET /books/:bookId/reviews/mine` | Logged in | The current user's own review for this book, if any. |
| `POST /books/:bookId/reviews` | Logged in | Creates or updates the current user's review for this book. Body: `rating` (integer 1–5), `body` (optional text). One review per user per book — posting again replaces the old one and recalculates the book's `averageRating`/`totalReviews`. |
| `DELETE /books/:bookId/reviews/:reviewId` | Logged in | Deletes your own review. Returns `204 No Content`. |

## Users (`/users`)

All routes require login.

| Method & Path | Access | What it does |
|---|---|---|
| `GET /users/me` | Logged in | The current user's profile — this is what `AuthContext` on the frontend hydrates from. |
| `GET /users` | Admin | Paginated user list. Query: `search`, `page`, `limit`. |
| `GET /users/stats` | Admin | Aggregate counts for the admin dashboard (e.g. totals by plan/status). |
| `PATCH /users/:id/subscription` | Admin | Body: `{ isSubscribed: boolean }`. Manually flips a user's subscription flag. |

## Tickets (`/tickets`)

All routes require login.

| Method & Path | Access | What it does |
|---|---|---|
| `POST /tickets` | Logged in | Body: `subject`, `message`. Creates a support ticket from the current user. |
| `GET /tickets/mine` | Logged in | The current user's own tickets. |
| `GET /tickets` | Admin | Paginated list of every ticket. Query: `page`, `limit` (max 50, default 10). |
| `PATCH /tickets/:id/status` | Admin | Body: `{ status }` (`NEW`\|`READ`\|`RESOLVED`). |
| `DELETE /tickets/:id` | Admin | Deletes a ticket. Returns `204 No Content`. |

## Payments (`/payments`)

| Method & Path | Access | What it does |
|---|---|---|
| `GET /payments/plans` | Public | Current pricing for each subscription plan — the single source of truth the frontend displays. |
| `POST /payments/chargily/checkout` | Logged in | Body: `{ plan: "PRO" \| "GOLD" }` (FREE is rejected — no point checking out a free plan). Creates a `PENDING` payment request and a Chargily hosted checkout session, returns `{ checkoutUrl }`. The name on the payment always comes from the logged-in user's account, never from the request body. |
| `POST /payments/chargily/cancel-pending` | Logged in | Cancels the current user's pending (not-yet-paid) checkout. |
| `GET /payments/history` | Admin | Paginated payment history. Query: `page`, `limit`, `status` (`PENDING`\|`APPROVED`\|`REJECTED`), `plan` (`FREE`\|`PRO`\|`GOLD`). |
| `POST /payments/chargily/webhook` | Chargily only (signature-verified, no login) | Chargily calls this directly when a checkout's status changes. The `signature` header is verified against `CHARGILY_SECRET` (HMAC-SHA256, timing-safe compare) before anything is trusted. On `checkout.paid`, activates the subscription. On `checkout.failed`/`canceled`/`expired`, marks the request rejected. Idempotent — replays are no-ops once the request is no longer `PENDING`. |

## Health (`/health`)

| Method & Path | Access | What it does |
|---|---|---|
| `GET /health` | Public | Runs `SELECT 1` against the database. Returns `{ status: "ok", timestamp }` or a `503` if the DB is unreachable. Used by the hosting platform's liveness checks — exempt from rate limiting so monitoring can poll it freely. |

## Root

| Method & Path | Access | What it does |
|---|---|---|
| `GET /` | Public | Returns a plain "Hello World!" string — confirms the API process is up. Not under the `/api` prefix's typical usage; mostly a sanity check. |

---

For *why* these endpoints are shaped this way (tier-gating logic, the token
refresh dance, the payment webhook's trust model), see
[`ARCHITECTURE.md`](ARCHITECTURE.md).
