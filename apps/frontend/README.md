# DLV Frontend

React 19 + Vite 7 single-page app for the DLV language-learning book
platform. Deployed on Netlify; talks to the [NestJS API](../api) over HTTPS.

See the [root README](../../README.md) for how this fits into the whole
project, and [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md) for how
login, tiered access and payments work end-to-end.

## Setup

```bash
npm install              # from the repo root — installs all workspaces
cp .env.example .env     # then fill in the values (see the table below)
npm run dev              # starts Vite on http://localhost:5173
```

## Commands

```bash
npm run dev       # dev server with hot reload
npm run build     # type-check (tsc -b), production build, then Netlify headers
npm run lint      # ESLint
npm run preview   # serve the production build locally
```

`npm run build` type-checks first and fails on any TypeScript error, so it is
the check to run before pushing.

## Environment variables

| Variable | What it's for |
|---|---|
| `VITE_API_URL` | Base URL of the API, including the `/api` prefix (e.g. `http://localhost:3000/api` locally) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary account used for book cover uploads |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset configured on that Cloudinary account |

## Project layout

```
src/
├── pages/        One file per screen, grouped by area: auth/, client/, admin/, common/
├── routes/       The three route guards: PublicRoute, ProtectedRoute, AdminRoute
├── layouts/      Page chrome shared by many screens: RootWrapper, UserLayout, AdminLayout
├── components/   Reusable UI, grouped by area: admin/, auth/, book/, common/,
│                 layout/, library/, reviews/, subscription/
├── hooks/        Data-fetching hooks (TanStack Query), one folder per area:
│                 books/, dashboard/, payments/, reviews/, tickets/, users/
├── services/     One file per API area — where `api()` is actually called
├── context/      AuthContext (who is logged in) and SearchContext
├── lib/          Small shared helpers with no UI (see below)
├── constants/    Fixed option lists: book metadata, subscription plans, contact details
├── config/       Environment plumbing (`env.ts` reads the `VITE_*` variables)
├── types/        Shared TypeScript types
└── assets/       Static files bundled by Vite (the logo)
```

What lives in `lib/`:

| File | What it does |
|---|---|
| `api.ts` | The `fetch` wrapper every request goes through — attaches the token, refreshes and retries once on a 401 |
| `queryKeys.ts` | Every React Query key in the app, in one place |
| `bookSeries.ts` | Groups tier editions of one title, and answers "can this user read this tier?" |
| `tierStyles.ts` | The colours and labels for FREE / PRO / GOLD |
| `notify.ts` | Toast messages (a thin layer over `sonner`) |
| `qs.ts`, `cn.ts`, `pagination.ts`, `errorMessage.ts` | Small utilities — query strings, class names, page maths, error text |

## How data flows

One direction, always:

```
page or component  →  hook (TanStack Query)  →  service  →  api()  →  NestJS API
```

**A page never calls `api()` directly.** It calls a hook; the hook calls a
service; the service calls `api()`. This is worth keeping to: it is what
makes caching, loading states and error handling behave the same everywhere
instead of being re-invented per screen.

The one place outside `services/` that calls `api()` is `AuthContext`, for
`GET /users/me` and `POST /auth/logout`. It sits underneath this chain rather
than inside it — the session has to exist before any hook can fetch anything
— so it is an exception, not a pattern to copy.

### Where to put new code

- **Fetching or changing data on the server?** Add a function to the matching
  `services/*.ts`, then a hook in `hooks/<area>/` that calls it. The hook is
  what the page imports.
- **Need a query key?** Add it to `lib/queryKeys.ts` rather than writing an
  array inline. Keys are grouped by area, so invalidating
  `queryKeys.books.all` reliably clears everything derived from books.
- **Logic with no UI and no server call?** That is a `lib/` module.
- **A fixed list of options?** That is `constants/`.
- **Reused markup?** A component in `components/<area>/`.

### Imports and exports

Imports use the `@/` alias, which points at `src/`:

```ts
import { useBook } from "@/hooks/books/useBook";
```

There are no relative imports in `src` — no `./`, no `../../`. The alias is
declared in both `tsconfig.app.json` and `vite.config.ts`; if you change one,
change the other.

Components use **named exports**. A **default export means one specific
thing: this file is a page loaded with `React.lazy()`** in `App.tsx`. Keeping
that rule makes it obvious at a glance which files are route entry points.

## Routing

Defined in [`src/App.tsx`](src/App.tsx) using `createBrowserRouter`. Three
guards, nested inside each other:

- **Public** (`PublicRoute`) — `/login`, `/signup`, `/forgot-password`,
  `/reset-password`. Redirects you away if you are already logged in.
- **Protected** (`ProtectedRoute`) — everything else needs a login: the
  library (`/`), `/book/:id`, `/reader/:id`, `/profile`, `/subscription`,
  `/payment/success`, `/payment/failure` and `/support`.
- **Admin** (`AdminRoute`, inside Protected) — `/admin` and its pages: add,
  edit and manage books, manage users, support tickets, subscriber history.

`/privacy` and `/terms` are open to everyone.

`Login` and `Signup` load eagerly, since a logged-out visitor almost always
needs one of them. Every other page is lazy-loaded, so it downloads only when
someone actually visits it.

## Auth, in brief

`AuthContext` is the source of truth for the current user. The access token
lives only in a variable in memory in [`src/lib/api.ts`](src/lib/api.ts) —
never in `localStorage`, so a script injected into the page cannot read it.

It is lost on a full page reload, and that is intended: `api()` quietly calls
`POST /auth/refresh` (using the `httpOnly` cookie the browser sends on its
own) to get a new one, then retries the original request. Nothing else in the
app has to think about tokens.

[`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md) has the full flow,
including how the refresh token is rotated on every use.

## Known gaps and open questions

- **No automated frontend tests yet.**
- **Resolving a support ticket takes two requests.** `useTickets` sends
  `PATCH /tickets/:id/status` and then `DELETE /tickets/:id`. If the delete
  fails, the ticket is left marked `RESOLVED` but still in the list. It is
  unclear whether the two-step flow is deliberate (record the resolution
  before removing it) or left over from an earlier design — worth settling
  before anyone builds on it.
