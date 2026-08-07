# DLV Frontend

React 19 + Vite 7 single-page app for the DLV language-learning book
platform. Deployed on Netlify; talks to the [NestJS API](../api) over HTTPS.

See the [root README](../../README.md) for how this fits into the whole
project, and [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md) in the
repo root for how login and tiered access work end-to-end.

## Setup

```bash
npm install                 # from the repo root, installs all workspaces
cp .env.example .env        # then fill in the values (see table below)
npm run dev                 # starts Vite on http://localhost:5173
```

## Commands

```bash
npm run dev        # Vite dev server with hot reload
npm run build        # type-check (tsc -b), production build, then generate Netlify headers
npm run lint          # ESLint
npm run preview        # serve the production build locally
```

## Environment variables

| Variable | What it's for |
|---|---|
| `VITE_API_URL` | Base URL of the API, including the `/api` prefix (e.g. `http://localhost:3000/api` locally) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary account used for book cover uploads |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset configured on that Cloudinary account |

## Project layout

```
src/
├── pages/          Route-level screens, split into auth/, client/, admin/, common/
├── routes/          Route guards: PublicRoute, ProtectedRoute, AdminRoute
├── layouts/          Shared page chrome (UserLayout, AdminLayout, RootWrapper)
├── components/          Reusable UI, grouped by feature (library, reviews, admin, layout, common)
├── hooks/          TanStack Query hooks, one folder per domain (books, reviews, users, payments)
├── services/          Thin wrappers that call the API for one domain (bookService, authService, ...)
├── context/          AuthContext (current user/session) and SearchContext
├── lib/          api.ts (fetch wrapper), pagination, book-series grouping helpers
├── constants/          Shared enums/options (book metadata, subscription plans, contact info)
└── types/          Shared TypeScript types
```

Data flows one direction: **pages/components → hooks (TanStack Query) →
services (API calls) → NestJS API**. Components don't call `fetch` directly —
they use a hook, which uses a service function.

## Routing

Defined in [`src/App.tsx`](src/App.tsx) with `react-router-dom`'s
`createBrowserRouter`. Three guard layers, nested:

- **Public** (`PublicRoute`) — `/login`, `/signup`, `/forgot-password`,
  `/reset-password`. Redirects away if you're already logged in.
- **Protected** (`ProtectedRoute`) — everything else requires login: the
  library (`/`), book details, the reader, profile, subscription/payment
  pages, and support.
- **Admin** (`AdminRoute`, nested inside Protected) — `/admin/*`: dashboard,
  add/edit/manage books, manage users, support tickets, subscriber history.

`/privacy` and `/terms` are open to everyone, logged in or not.

Admin and most client pages are lazy-loaded (`React.lazy`) to keep the
initial bundle small; only auth pages load eagerly.

## Auth, in brief

`AuthContext` is the source of truth for the current user. The access token
lives only in an in-memory variable in [`src/lib/api.ts`](src/lib/api.ts) —
never in `localStorage`, so it can't be read by an injected script. It's
lost on a full page reload by design: `api()` transparently calls
`POST /auth/refresh` (using the `httpOnly` refresh cookie the browser sends
automatically) to get a new one. See
[`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md) for the full flow.

## Known gaps

- No automated frontend test suite yet.
