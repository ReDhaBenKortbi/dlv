import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged as fbOnAuthStateChanged,
} from "firebase/auth";
import { auth } from "./client";
import type { AuthGateway, DomainAuthUser } from "../../application/ports/AuthGateway";

function toDomainAuthUser(fbUser: {
  uid: string;
  email: string | null;
  displayName: string | null;
}): DomainAuthUser {
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    displayName: fbUser.displayName,
  };
}

export function makeFirebaseAuthGateway(): AuthGateway {
  return {
    async register(email, password, fullName): Promise<DomainAuthUser> {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: fullName });
      return { uid: cred.user.uid, email: cred.user.email, displayName: fullName };
    },

    async login(email, password): Promise<void> {
      await signInWithEmailAndPassword(auth, email, password);
    },

    async logout(): Promise<void> {
      await signOut(auth);
    },

    onAuthStateChanged(callback): () => void {
      return fbOnAuthStateChanged(auth, (fbUser) => {
        callback(fbUser ? toDomainAuthUser(fbUser) : null);
      });
    },

    async reloadCurrentUser(): Promise<void> {
      if (auth.currentUser) {
        await auth.currentUser.reload();
      }
    },

    getCurrentUser(): DomainAuthUser | null {
      const u = auth.currentUser;
      if (!u) return null;
      return toDomainAuthUser(u);
    },

    async getIdToken(forceRefresh = false): Promise<string> {
      const u = auth.currentUser;
      if (!u) throw new Error("No authenticated user");
      return u.getIdToken(forceRefresh);
    },

    async isCurrentUserAdmin(): Promise<boolean> {
      const u = auth.currentUser;
      if (!u) return false;
      // Force-refresh so we always reflect the latest server-side claim.
      const result = await u.getIdTokenResult(true);
      return result.claims["admin"] === true;
    },
  };
}
