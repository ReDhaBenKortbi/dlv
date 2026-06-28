# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Type-check + build for production
npm run lint       # ESLint
npm run preview    # Preview production build locally
```

No test suite exists yet.

## Architecture

### Stack
- **React 19 + Vite 7** SPA, deployed on **Netlify**
- **Firebase** (Auth + Firestore) as the sole backend — no custom API server
- **Cloudinary** for media uploads (book covers, payment receipts)
- **TanStack Query v5** for all async data fetching/caching
- **Netlify serverless function** (`netlify/functions/proxy-book.js`) proxies book HTML content with Firebase Admin auth verification

### Data Flow Layers
```
Pages/Components
     ↓
src/hooks/**          ← TanStack Query wrappers (useQuery / useMutation)
     ↓
src/services/*.ts     ← All Firestore operations (bookService, userService, etc.)
     ↓
Firebase Firestore
```

Services own all Firestore logic. Hooks own query keys and caching. Pages/components never call Firebase directly.

### Auth & Roles

`AuthContext` (`src/context/AuthContext.tsx`) is the single source of truth for:
- `user` — Firebase Auth user
- `isAdmin` — derived by comparing `user.email` to `VITE_ADMIN_EMAIL`
- `isSubscribed` / `subscriptionStatus` — read from a real-time Firestore `onSnapshot` listener on the user's doc

Admin detection is email-based (env var), not a custom claim. Any auth change tears down and rebuilds the Firestore listener.

### Route Guards
- `PublicRoute` — redirects authenticated users away from login/signup
- `ProtectedRoute` — requires authentication
- `AdminRoute` — requires `isAdmin === true`

All non-critical pages are lazy-loaded (`React.lazy`).

### Book Reader
The reader (`/reader/:id`) loads book HTML via an iframe pointed at `/.netlify/functions/proxy-book`. The function:
1. Verifies a Firebase ID token passed as a query param
2. Looks up the book's `indexURL` in Firestore
3. Fetches the external HTML and injects a `<base>` tag + anti-framing script
4. Returns the HTML directly

The ID token is refreshed client-side every 50 minutes to prevent expiry mid-session.

### Subscription Payment Flow
1. User uploads payment receipt image → Cloudinary (via `cloudinaryService.ts`)
2. A `paymentRequests` Firestore document is created with `status: "pending"`
3. Admin approves/rejects in `/admin/payments`
4. On approval, the user's Firestore doc is updated (`isSubscribed: true`, `subscriptionStatus: "approved"`)
5. `AuthContext`'s live listener picks up the change instantly

### Firestore Collections
- `books` — book metadata (`Book` type: title, author, coverURL, indexURL, isPremium, targetLanguage, focusSkill, proficiencyLevel, averageRating, totalReviews)
- `users/{uid}` — user profile + subscription state
- `paymentRequests` — subscription payment receipts awaiting admin review
- `tickets` — support tickets

### Book Metadata
Books are tagged with three orthogonal dimensions (see `src/constants/bookOptions.ts`):
- `targetLanguage`: `AR | EN | FR`
- `focusSkill`: `GRAMMAR | VOCABULARY | READING | LISTENING | SPEAKING | ALL_IN_ONE`
- `proficiencyLevel`: CEFR codes `A1 | A2 | B1 | B2 | C1 | C2`

## Environment Variables

### Frontend (`.env`)
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_ADMIN_EMAIL
VITE_CLOUDINARY_UPLOAD_PRESET
VITE_CLOUDINARY_CLOUD_NAME
VITE_API_URL                    # Production site URL, used by proxy-book referer check
```

### Netlify Function (set in Netlify dashboard)
```
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY            # Include literal \n characters; the function replaces them
```
