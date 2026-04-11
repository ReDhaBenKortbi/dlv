# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # TypeScript check + Vite production build
npm run lint       # ESLint
npm run preview    # Preview production build locally
```

Vitest is configured. Domain-layer unit tests live in `src/domain/**/*.test.ts` and `src/application/**/*.test.ts`. Run with `npx vitest run`.

## Environment Variables

Copy `.env.example` to `.env` and fill in values. All vars are prefixed with `VITE_`:

| Variable | Purpose |
|---|---|
| `VITE_FIREBASE_*` | Firebase project config (6 vars) |
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
- `AdminRoute` — requires `isAdmin === true` (derived from Firebase custom claim)

Admin identity is determined by the `admin: true` custom claim on the Firebase Auth token.
Use `npm run claims:grant:dev` / `claims:grant:prod` to grant the claim to an account.

### Clean Architecture

The codebase follows a four-layer clean architecture. Dependencies only flow inward (presentation → application → domain; infrastructure implements ports).

```
src/
├── domain/           # Pure TypeScript — no Firebase, no React
│   ├── book/         # DomainBook, CreateBookInput, vocabulary codes
│   ├── review/       # DomainReview, CreateReviewInput, rating helpers
│   ├── payment/      # DomainPaymentRequest, PaymentStatus
│   ├── subscription/ # isSubscriptionActive policy
│   └── support/      # DomainTicket, TicketStatus
│
├── application/      # Use-case functions — depend only on ports
│   ├── ports/        # AuthGateway, BookRepo, ReviewRepo, PaymentRepo,
│   │                 #   UserRepo, FileUploader, Clock, Logger interfaces
│   ├── books/        # listBooks, getBook, createBook, updateBook, deleteBook
│   ├── reviews/      # addReview, deleteReview, getReviews, getUserReview
│   ├── payments/     # getPendingPayments, submitPaymentReceipt, processPayment
│   ├── users/        # getUsers, toggleUserSubscription
│   └── auth/         # registerUser, loginUser
│
├── infrastructure/   # Adapter implementations of ports
│   ├── firebase/     # FirebaseBookRepo, FirebaseReviewRepo, FirebasePaymentRepo,
│   │                 #   FirebaseUserRepo, FirebaseAuthGateway, mappers, client
│   ├── cloudinary/   # CloudinaryFileUploader
│   └── logger/       # consoleLogger
│
└── presentation/     # React — providers, pages, hooks, components
    └── providers/
        ├── CompositionRoot.tsx   # Wires all adapters + use cases; single source of truth
        └── UseCasesContext.tsx   # React context + useUseCases() hook
```

**Composition root:** `CompositionRoot.tsx` instantiates all adapters once and exposes every use case (and `uploadFile`, `logger`) through `UseCasesContext`. Pages and hooks consume the context via `useUseCases()` — they never import from `infrastructure/` directly.

**Hook pattern:** hooks in `src/hooks/<domain>/` call use cases from context and wrap them with `useQuery`/`useMutation`. Query cache is configured with 5-minute stale time and 30-minute GC.

**Shared components:** `src/components/admin/BookFormFields.tsx` is used by both AddBook and EditBook pages. Page hooks (`useAddBookPage`, `useEditBookPage`) own all state and handlers; page components are pure JSX.

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
