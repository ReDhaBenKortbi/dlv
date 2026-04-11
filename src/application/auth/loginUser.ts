import type { AuthGateway } from "../ports/AuthGateway";

export function makeLoginUser(authGateway: AuthGateway) {
  return function loginUser(email: string, password: string): Promise<void> {
    return authGateway.login(email, password);
  };
}
