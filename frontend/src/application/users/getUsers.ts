import type { UserRepo, DomainUser } from "../ports/UserRepo";

export function makeGetUsers(userRepo: UserRepo) {
  return function getUsers(): Promise<DomainUser[]> {
    return userRepo.findAll();
  };
}
