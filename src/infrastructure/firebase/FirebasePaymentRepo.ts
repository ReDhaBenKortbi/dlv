import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "./client";
import type {
  PaymentRepo,
  DomainPaymentRequest,
  CreatePaymentInput,
  PaymentStatus,
} from "../../application/ports/PaymentRepo";
import { tsToDate, tsToDateOpt } from "./mappers";

const COL = "paymentRequests";

function toPayment(id: string, data: DocumentData): DomainPaymentRequest {
  return {
    id,
    userId: data.userId as string,
    userEmail: data.userEmail as string,
    fullName: data.fullName as string,
    amount: data.amount as string,
    receiptURL: data.receiptURL as string,
    status: data.status as PaymentStatus,
    createdAt: tsToDate(data.createdAt),
    processedAt: tsToDateOpt(data.processedAt),
  };
}

export function makeFirebasePaymentRepo(): PaymentRepo {
  return {
    async getPending(): Promise<DomainPaymentRequest[]> {
      const q = query(collection(db, COL), where("status", "==", "pending"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => toPayment(d.id, d.data()));
    },

    async create(input: CreatePaymentInput): Promise<void> {
      await addDoc(collection(db, COL), {
        ...input,
        status: "pending",
        createdAt: serverTimestamp(),
      });
    },

    async updateStatus(id: string, status: PaymentStatus, processedAt: Date): Promise<void> {
      await updateDoc(doc(db, COL, id), {
        status,
        processedAt: Timestamp.fromDate(processedAt),
      });
    },
  };
}
