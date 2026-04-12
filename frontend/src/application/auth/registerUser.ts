import type { AuthGateway } from "../ports/AuthGateway";
import type { UserRepo } from "../ports/UserRepo";

interface RegisterUserDeps {
  authGateway: AuthGateway;
  userRepo: UserRepo;
}

export function makeRegisterUser(deps: RegisterUserDeps) {
  return async function registerUser(
    email: string,
    password: string,
    fullName: string,
  ): Promise<void> {
    const { authGateway, userRepo } = deps;

    const authUser = await authGateway.register(email, password, fullName);

    await userRepo.create(authUser.uid, {
      email: authUser.email ?? email,
      fullName,
      isSubscribed: false,
      subscriptionStatus: "none",
      role: "client",
    });
  };
}
