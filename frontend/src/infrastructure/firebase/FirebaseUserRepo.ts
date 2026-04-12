import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
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

    async findAll(): Promise<DomainUser[]> {
      const snapshot = await getDocs(collection(db, COL));
      return snapshot.docs.map((d) => toUser(d.id, d.data()));
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

    async setSubscribed(userId: string, isSubscribed: boolean): Promise<void> {
      await updateDoc(doc(db, COL, userId), { isSubscribed });
    },

    subscribeToUser(
      userId: string,
      callback: (user: DomainUser | null) => void,
    ): () => void {
      const ref = doc(db, COL, userId);
      return onSnapshot(ref, (snap) => {
        if (!snap.exists()) {
          callback(null);
          return;
        }
        callback(toUser(snap.id, snap.data()));
      });
    },
  };
}
