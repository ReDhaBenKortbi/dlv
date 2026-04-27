/** Minimal user representation from the auth subsystem — no Firebase types. */
export interface DomainAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface AuthGateway {
  /** Register a new user; returns the new auth identity. */
  register(
    email: string,
    password: string,
    fullName: string,
  ): Promise<DomainAuthUser>;

  login(email: string, password: string): Promise<void>;

  logout(): Promise<void>;

  /**
   * Subscribe to auth-state changes.
   * Returns an unsubscribe function (call on cleanup).
   */
  onAuthStateChanged(
    callback: (user: DomainAuthUser | null) => void,
  ): () => void;

  /** Reload the current user's auth token from the server. */
  reloadCurrentUser(): Promise<void>;

  /** Synchronous snapshot of the currently signed-in user. */
  getCurrentUser(): DomainAuthUser | null;

  /** Get the current user's JWT (for server-verified calls). */
  getIdToken(forceRefresh?: boolean): Promise<string>;

  /**
   * Returns true if the currently signed-in user has the `admin` custom claim
   * set on their auth token.  Forces a token refresh so the result reflects
   * the server-side state immediately after a claim is granted/revoked.
   */
  isCurrentUserAdmin(): Promise<boolean>;
}
