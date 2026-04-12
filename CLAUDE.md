# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rules

- Do NOT read or list files inside `node_modules/` directories.

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


### Migration Plan Section
Context
The app is a language-learning e-book platform (React SPA) currently running entirely on Firebase (Auth + Firestore) and Cloudinary. The frontend already follows clean architecture with well-defined ports (BookRepo, ReviewRepo, PaymentRepo, UserRepo, AuthGateway, FileUploader, Clock, Logger) and use cases. The goal is to introduce a NestJS backend that becomes the real server, replacing the direct Firebase/Cloudinary calls with REST API calls. PostgreSQL + Prisma replaces Firestore. Auth moves to NestJS-issued JWTs. File uploads go through Multer on the backend then forward to Cloudinary.
Architecture Overview
┌─────────────────────────────────────────────────────────────┐
│                     React SPA (frontend/)                   │
│  CompositionRoot wires ApiBookRepo, ApiAuthGateway, etc.    │
│  instead of Firebase adapters                               │
│  Hooks/pages unchanged — they consume UseCasesContext        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP (REST + Bearer JWT)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   NestJS Backend (backend/)                  │
│                                                             │
│  ┌───────────┐  ┌───────────┐  ┌──────────┐  ┌───────────┐ │
│  │ AuthModule│  │BooksModule│  │ReviewsMod│  │PaymentsMod│ │
│  │           │  │           │  │          │  │           │ │
│  │ register  │  │ CRUD +    │  │ CRUD +   │  │ submit +  │ │
│  │ login     │  │ Multer    │  │ rating   │  │ process + │ │
│  │ me        │  │ upload    │  │ recalc   │  │ Multer    │ │
│  └───────────┘  └───────────┘  └──────────┘  └───────────┘ │
│  ┌───────────┐  ┌───────────┐                               │
│  │UsersModule│  │TicketsMod │  JwtAuthGuard on all          │
│  │           │  │           │  protected routes              │
│  │ list +    │  │ CRUD      │  RolesGuard for admin routes  │
│  │ toggle    │  │           │                               │
│  └───────────┘  └───────────┘                               │
│                                                             │
│  Prisma ORM ──────► PostgreSQL                              │
│  Cloudinary SDK ──► Cloudinary (for file storage)           │
└─────────────────────────────────────────────────────────────┘
Decisions
DecisionChoiceRationaleProject layoutbackend/ folder at repo rootSingle repo, separate package.json and tsconfigDatabasePostgreSQL + PrismaStructured relational data; type-safe generated clientAuthJWT (Passport)SPA already uses stateless tokens; mirrors existing getToken() patternFile uploadsMulter → CloudinaryMulter handles multipart on server; Cloudinary remains the CDNAPI styleRESTMatches current use-case-per-endpoint granularity

Phase 1: Backend Scaffold
Create backend/ with NestJS CLI structure:
backend/
├── package.json
├── tsconfig.json
├── nest-cli.json
├── .env.example
├── prisma/
│   └── schema.prisma
└── src/
    ├── main.ts                 # Bootstrap, CORS, validation pipe
    ├── app.module.ts           # Root module
    ├── prisma/
    │   ├── prisma.module.ts
    │   └── prisma.service.ts   # extends PrismaClient, onModuleInit
    ├── cloudinary/
    │   ├── cloudinary.module.ts
    │   └── cloudinary.service.ts
    ├── auth/
    ├── books/
    ├── reviews/
    ├── payments/
    ├── users/
    └── tickets/
Dependencies:
@nestjs/core @nestjs/common @nestjs/platform-express
@nestjs/config @nestjs/passport @nestjs/jwt
passport passport-jwt passport-local
@prisma/client prisma
class-validator class-transformer
multer @types/multer
cloudinary
bcrypt @types/bcrypt

Phase 2: Prisma Schema
File: backend/prisma/schema.prisma
Mirrors existing domain entities exactly. Key design points:

User.role as an enum (CLIENT, ADMIN)
User.subscriptionStatus as an enum
Book stores coverURL and indexURL (Cloudinary URLs)
Review has a unique constraint on (bookId, userId) to enforce one-review-per-user at DB level
PaymentRequest tracks receipt uploads and approval workflow
Ticket for support system

prismagenerator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  CLIENT
  ADMIN
}

enum SubscriptionStatus {
  NONE
  PENDING
  APPROVED
  REJECTED
}

enum PaymentStatus {
  PENDING
  APPROVED
  REJECTED
}

enum TicketStatus {
  NEW
  READ
  RESOLVED
}

model User {
  id                  String             @id @default(uuid())
  email               String             @unique
  fullName            String
  passwordHash        String
  role                Role               @default(CLIENT)
  isSubscribed        Boolean            @default(false)
  subscriptionStatus  SubscriptionStatus @default(NONE)
  subscriptionStartDate DateTime?
  subscriptionEndDate   DateTime?
  createdAt           DateTime           @default(now())

  reviews             Review[]
  paymentRequests     PaymentRequest[]
  tickets             Ticket[]
}

model Book {
  id               String    @id @default(uuid())
  title            String
  author           String
  description      String
  coverURL         String
  indexURL          String
  isPremium        Boolean   @default(false)
  category         String?
  targetLanguage   String?
  focusSkill       String?
  proficiencyLevel String?
  averageRating    Float     @default(0)
  totalReviews     Int       @default(0)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  reviews          Review[]
}

model Review {
  id        String   @id @default(uuid())
  bookId    String
  userId    String
  userName  String
  rating    Int             // 1-5
  comment   String
  createdAt DateTime @default(now())

  book      Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([bookId, userId])
}

model PaymentRequest {
  id          String        @id @default(uuid())
  userId      String
  userEmail   String
  fullName    String
  amount      String
  receiptURL  String
  status      PaymentStatus @default(PENDING)
  createdAt   DateTime      @default(now())
  processedAt DateTime?

  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Ticket {
  id        String       @id @default(uuid())
  userId    String
  userEmail String
  subject   String
  message   String
  status    TicketStatus @default(NEW)
  createdAt DateTime     @default(now())

  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)
}

Phase 3: Auth Module
File: backend/src/auth/
Endpoints
MethodPathAuthDescriptionPOST/auth/registerPublicCreate user, return JWTPOST/auth/loginPublicValidate credentials, return JWTGET/auth/meBearerReturn current user profile (replaces subscribeToUser polling)
Implementation

AuthService: register (bcrypt hash password, create User via Prisma, sign JWT), login (validate email+password, sign JWT)
JWT payload: { sub: userId, email, role }
JwtStrategy (passport-jwt): extracts Bearer token, validates, attaches user to request
JwtAuthGuard: global guard on protected routes
RolesGuard + @Roles('ADMIN') decorator: checks request.user.role for admin-only endpoints
Token expiry: 7 days (configurable via env)

Auth response shape
json{
  "accessToken": "eyJ...",
  "user": { "id": "...", "email": "...", "fullName": "...", "role": "CLIENT", "isSubscribed": false, "subscriptionStatus": "NONE" }
}

Phase 4: Resource Modules
Each module follows the same pattern: controller → service → Prisma.
4a. Books Module (backend/src/books/)
MethodPathAuthDescriptionGET/booksBearerList all books (ordered by createdAt desc)GET/books/:idBearerGet single bookPOST/booksAdminCreate book (multipart: cover file + index file + JSON fields)PATCH/books/:idAdminUpdate book (optional file re-upload)DELETE/books/:idAdminDelete book

Multer FileFieldsInterceptor for cover and index fields
On create/update: upload files to Cloudinary via CloudinaryService, store returned URLs
BooksService encapsulates all Prisma queries

4b. Reviews Module (backend/src/reviews/)
MethodPathAuthDescriptionGET/books/:bookId/reviewsBearerList reviews for a bookGET/books/:bookId/reviews/mineBearerGet current user's review for a bookPOST/books/:bookId/reviewsBearerAdd review (enforces unique constraint + recalculates avg rating)DELETE/reviews/:idBearerDelete own review (recalculates avg rating)

Rating recalculation logic reused from domain/review/rating.ts — copy the pure functions (computeNewAverageRating, computeRatingAfterDeletion) into backend/src/reviews/rating.utils.ts

4c. Payments Module (backend/src/payments/)
MethodPathAuthDescriptionGET/payments/pendingAdminList pending payment requestsPOST/payments/submitBearerSubmit receipt (multipart: receipt file + amount). Sets user status to PENDINGPATCH/payments/:id/processAdminApprove or reject. On approve: set subscription dates. On reject: reset status

Multer FileInterceptor for receipt file
Subscription policy logic reused from domain/subscription/policy.ts — copy computeSubscriptionEndDate into backend/src/payments/subscription.utils.ts

4d. Users Module (backend/src/users/)
MethodPathAuthDescriptionGET/usersAdminList all usersPATCH/users/:id/subscriptionAdminToggle subscription (admin override)
4e. Tickets Module (backend/src/tickets/)
MethodPathAuthDescriptionGET/ticketsAdminList all tickets (ordered by createdAt desc)POST/ticketsBearerSubmit a ticketPATCH/tickets/:id/resolveAdminMark as resolvedDELETE/tickets/:idAdminDelete ticket
4f. Dashboard Metrics
MethodPathAuthDescriptionGET/dashboard/metricsAdminReturns { users, books, pendingPayments } counts
This can live in UsersModule or a small DashboardModule. Single Prisma count() calls.

Phase 5: Cloudinary Service
File: backend/src/cloudinary/cloudinary.service.ts

Wraps the cloudinary Node SDK (v2)
upload(file: Express.Multer.File): Promise<string> — uploads buffer, returns secure_url
Configured via env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET


Phase 6: Frontend Adapter Swap
The frontend's clean architecture makes this surgical. Replace infrastructure adapters — the use-case layer and presentation layer are untouched.
New infrastructure adapters
Create src/infrastructure/api/ with:
FileReplacesNotesApiClient.ts—Thin wrapper around fetch that injects Authorization: Bearer <token> from stored JWT, base URL from envApiBookRepo.tsFirebaseBookRepoImplements BookRepo port via REST callsApiReviewRepo.tsFirebaseReviewRepoImplements ReviewRepo port via RESTApiPaymentRepo.tsFirebasePaymentRepoImplements PaymentRepo port via RESTApiUserRepo.tsFirebaseUserRepoImplements UserRepo port. subscribeToUser becomes polling /auth/me on intervalApiAuthGateway.tsFirebaseAuthGatewayImplements AuthGateway port. register/login call backend, store JWT in memory/localStorage. onAuthStateChanged checks stored token on init. getIdToken returns stored JWTApiFileUploader.tsCloudinaryFileUploaderUploads go to backend endpoint (which proxies to Cloudinary)
CompositionRoot changes
CompositionRoot.tsx swaps:
ts// Before
const bookRepo = makeFirebaseBookRepo();
// After
const apiClient = makeApiClient();
const bookRepo = makeApiBookRepo(apiClient);
All use cases and hooks remain identical — they only depend on port interfaces.
AuthContext changes

onAuthStateChanged → on app init, check if JWT exists in storage. If yes, call GET /auth/me to rehydrate user + subscription state.
subscribeToUser (realtime listener) → replaced by a polling approach: setInterval calling /auth/me every 30s, or refetch on mutation success. Alternatively, TanStack Query with refetchInterval.
Remove Firebase SDK dependency entirely once all adapters are swapped.


Implementation Order
#mermaid-r2v{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-r2v .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-r2v .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-r2v .error-icon{fill:#CC785C;}#mermaid-r2v .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-r2v .edge-thickness-normal{stroke-width:1px;}#mermaid-r2v .edge-thickness-thick{stroke-width:3.5px;}#mermaid-r2v .edge-pattern-solid{stroke-dasharray:0;}#mermaid-r2v .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-r2v .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-r2v .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-r2v .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-r2v .marker.cross{stroke:#A1A1A1;}#mermaid-r2v svg{font-family:inherit;font-size:16px;}#mermaid-r2v p{margin:0;}#mermaid-r2v .label{font-family:inherit;color:#E5E5E5;}#mermaid-r2v .cluster-label text{fill:#3387a3;}#mermaid-r2v .cluster-label span{color:#3387a3;}#mermaid-r2v .cluster-label span p{background-color:transparent;}#mermaid-r2v .label text,#mermaid-r2v span{fill:#E5E5E5;color:#E5E5E5;}#mermaid-r2v .node rect,#mermaid-r2v .node circle,#mermaid-r2v .node ellipse,#mermaid-r2v .node polygon,#mermaid-r2v .node path{fill:transparent;stroke:#A1A1A1;stroke-width:1px;}#mermaid-r2v .rough-node .label text,#mermaid-r2v .node .label text,#mermaid-r2v .image-shape .label,#mermaid-r2v .icon-shape .label{text-anchor:middle;}#mermaid-r2v .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#mermaid-r2v .rough-node .label,#mermaid-r2v .node .label,#mermaid-r2v .image-shape .label,#mermaid-r2v .icon-shape .label{text-align:center;}#mermaid-r2v .node.clickable{cursor:pointer;}#mermaid-r2v .root .anchor path{fill:#A1A1A1!important;stroke-width:0;stroke:#A1A1A1;}#mermaid-r2v .arrowheadPath{fill:#0b0b0b;}#mermaid-r2v .edgePath .path{stroke:#A1A1A1;stroke-width:2.0px;}#mermaid-r2v .flowchart-link{stroke:#A1A1A1;fill:none;}#mermaid-r2v .edgeLabel{background-color:transparent;text-align:center;}#mermaid-r2v .edgeLabel p{background-color:transparent;}#mermaid-r2v .edgeLabel rect{opacity:0.5;background-color:transparent;fill:transparent;}#mermaid-r2v .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#mermaid-r2v .cluster rect{fill:#CC785C;stroke:hsl(15, 12.3364485981%, 48.0392156863%);stroke-width:1px;}#mermaid-r2v .cluster text{fill:#3387a3;}#mermaid-r2v .cluster span{color:#3387a3;}#mermaid-r2v div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:inherit;font-size:12px;background:#CC785C;border:1px solid hsl(15, 12.3364485981%, 48.0392156863%);border-radius:2px;pointer-events:none;z-index:100;}#mermaid-r2v .flowchartTitleText{text-anchor:middle;font-size:18px;fill:#E5E5E5;}#mermaid-r2v rect.text{fill:none;stroke-width:0;}#mermaid-r2v .icon-shape,#mermaid-r2v .image-shape{background-color:transparent;text-align:center;}#mermaid-r2v .icon-shape p,#mermaid-r2v .image-shape p{background-color:transparent;padding:2px;}#mermaid-r2v .icon-shape rect,#mermaid-r2v .image-shape rect{opacity:0.5;background-color:transparent;fill:transparent;}#mermaid-r2v .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#mermaid-r2v .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#mermaid-r2v :root{--mermaid-font-family:inherit;}1. Scaffold backend/ + deps2. Prisma schema + migrate3. PrismaModule + CloudinaryService4. AuthModule — register, login, JWT guards5. BooksModule + Multer upload6. ReviewsModule + rating recalc7. PaymentsModule + Multer + subscription logic8. UsersModule + TicketsModule + DashboardMetrics9. Frontend: ApiClient + new adapters10. Frontend: CompositionRoot swap + AuthContext rewrite11. Remove Firebase deps + cleanup
Steps 5-8 can be built in parallel once step 4 is done.

Environment Variables (backend/.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/ebook_platform
JWT_SECRET=<random-secret>
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CORS_ORIGIN=http://localhost:5173
PORT=3000

Verification

Backend standalone: After each module, test with curl or Postman:

Register → get JWT → use JWT to create a book with cover upload → list books → add review → check rating recalculation
Submit payment with receipt → admin approve → check subscription dates


Frontend integration: After adapter swap, the existing UI should work identically — same pages, same flows, same TanStack Query cache keys
Existing tests: npx vitest run in frontend root — domain/application tests should still pass since they test pure functions and use cases against port interfaces (no Firebase)
E2E smoke test: Register → Login → Browse books → Submit review → Submit payment receipt → Admin approve → Verify subscription active