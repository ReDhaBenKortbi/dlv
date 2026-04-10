import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "./client";
import type {
  UserRepo,
  DomainUser,
  CreateUserInput,
  SubscriptionUpdate,
  SubscriptionStatus,
} from "../../application/ports/UserRepo";
import { tsToDate, tsToDateOpt } from "./mappers";

const COL = "users";

function toUser(id: string, data: DocumentData): DomainUser {
  return {
    id,
    email: data.email as string,
    fullName: data.fullName as string,
    isSubscribed: data.isSubscribed as boolean,
    subscriptionStatus: (data.subscriptionStatus ?? "none") as SubscriptionStatus,
    subscriptionStartDate: tsToDateOpt(data.subscriptionStartDate),
    subscriptionEndDate: tsToDateOpt(data.subscriptionEndDate),
    role: (data.role ?? "client") as "client" | "admin",
    createdAt: tsToDate(data.createdAt),
  };
}

export function makeFirebaseUserRepo(): UserRepo {
  return {
    async findById(id: string): Promise<DomainUser | null> {
      const snap = await getDoc(doc(db, COL, id));
      if (!snap.exists()) return null;
      return toUser(snap.id, snap.data());
    },

    async create(id: string, input: CreateUserInput): Promise<void> {
      await setDoc(doc(db, COL, id), {
        ...input,
        createdAt: serverTimestamp(),
      });
    },

    async updateSubscription(userId: string, update: SubscriptionUpdate): Promise<void> {
      const ref = doc(db, COL, userId);
      await updateDoc(ref, {
        isSubscribed: update.isSubscribed,
        subscriptionStatus: update.status,
        subscriptionStartDate: update.startDate
          ? Timestamp.fromDate(update.startDate)
          : null,
        subscriptionEndDate: update.endDate
          ? Timestamp.fromDate(update.endDate)
          : null,
      });
    },

    async resetSubscriptionStatus(userId: string): Promise<void> {
      const ref = doc(db, COL, userId);
      await updateDoc(ref, {
        isSubscribed: false,
        subscriptionStatus: "none" satisfies SubscriptionStatus,
        subscriptionStartDate: null,
        subscriptionEndDate: null,
      });
    },
  };
}
