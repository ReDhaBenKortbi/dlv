# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # TypeScript check + Vite production build
npm run lint       # ESLint
npm run preview    # Preview production build locally
```

No test suite is currently configured.

## Environment Variables

Copy `.env.example` to `.env` and fill in values. All vars are prefixed with `VITE_`:

| Variable | Purpose |
|---|---|
| `VITE_FIREBASE_*` | Firebase project config (6 vars) |
| `VITE_ADMIN_EMAIL` | Email that gets admin privileges |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary unsigned upload preset |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `VITE_USE_FIREBASE_EMULATOR` | Set `"true"` to use local Firebase emulators |

## Architecture

**Stack:** React 19 + TypeScript + Vite + TailwindCSS v4 + DaisyUI + React Router v7 + TanStack Query v5 + Firebase (Auth + Firestore) + Cloudinary

### Auth & Access Control

Auth state lives in `src/context/AuthContext.tsx`. It wraps `onAuthStateChanged` and a Firestore realtime listener on the user doc to track subscription status. The router is blocked from mounting until Firebase resolves the initial auth state (prevents redirect flash).

Three route guards in `src/routes/`:
- `PublicRoute` — redirects authenticated users away from login/signup
- `ProtectedRoute` — requires authenticated user
- `AdminRoute` — requires `user.email === ADMIN_EMAIL`

Admin identity is determined purely by email match against `VITE_ADMIN_EMAIL`.

### Data Layer

Services in `src/services/` call Firestore directly (no backend). TanStack Query wraps them in hooks under `src/hooks/`.

- `bookService.ts` — CRUD for the `books` Firestore collection
- `authService.ts` — Firebase Auth registration/login/logout
- `cloudinaryService.ts` — image/PDF uploads to Cloudinary
- `paymentService.ts`, `reviewService.ts`, `userService.ts`, `adminService.ts` — domain-specific Firestore ops

Hook pattern: hooks in `src/hooks/<domain>/` wrap service calls with `useQuery`/`useMutation`. Query cache is configured with 5-minute stale time and 30-minute GC.

### Routing Structure

```
RootWrapper
├── ProtectedRoute
│   ├── UserLayout  (Navbar + Sidebar)
│   │   ├── /          → Library
│   │   ├── /profile
│   │   ├── /subscription
│   │   ├── /book/:id
│   │   └── /support
│   ├── /reader/:id    (no layout — fullscreen reader)
│   └── AdminRoute
│       └── AdminLayout
│           ├── /admin
│           ├── /admin/payments
│           ├── /admin/add-book
│           ├── /admin/edit-book/:bookId
│           ├── /admin/users
│           ├── /admin/manage-books
│           └── /admin/support-tickets
├── /login   (PublicRoute)
└── /signup  (PublicRoute)
```

Auth pages are eagerly loaded; all client and admin pages are lazy-loaded.

### State Management

- **Server state:** TanStack Query (cache key `["books"]` for all books, `["books", id]` for single book)
- **Auth/subscription state:** `AuthContext` via Firestore realtime listener
- **Search state:** `SearchContext` — global search term filtered client-side in `useBooks`
- **UI notifications:** `sonner` Toaster (configured in `App.tsx`), with `src/utils/toast.ts` helpers

### Subscription Model

Users have a `subscriptionStatus` field in Firestore: `"none" | "pending" | "approved" | "rejected"`. On approval, `isSubscribed: true` and `subscriptionEndDate` are set. `AuthContext` checks expiry on every Firestore snapshot and auto-resets expired subscriptions.
