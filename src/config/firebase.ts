// Backwards-compatibility shim — canonical source is infrastructure/firebase/client.ts.
// Existing imports of { auth, db } continue to work during the incremental migration.
export { auth, db } from "../infrastructure/firebase/client";
