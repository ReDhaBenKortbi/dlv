import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  writeBatch,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { uploadImageToCloudinary } from "./cloudinaryService";
import type { PaymentRequest } from "../types/paymentRequest";
// 1. Existing: Submit a new request (User Side)
export const uploadReceiptAndSubmit = async (
  userId: string,
  email: string,
  userName: string,
  file: File,
  amount: string,
) => {
  const receiptURL = await uploadImageToCloudinary(file);

  await addDoc(collection(db, "paymentRequests"), {
    userId,
    userEmail: email, // Changed to match your manager's naming
    fullName: userName,
    receiptURL,
    amount,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { subscriptionStatus: "pending" });
  return true;
};

// 2. Fetch Pending Requests (Admin Side)
export const getPendingPayments = async (): Promise<PaymentRequest[]> => {
  const q = query(
    collection(db, "paymentRequests"),
    where("status", "==", "pending"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PaymentRequest[];
};

// 3. NEW: Process Payment (The Business Logic)
export const processPayment = async (
  request: PaymentRequest,
  newStatus: "approved" | "rejected",
) => {
  const batch = writeBatch(db);

  // Update the request status
  const requestRef = doc(db, "paymentRequests", request.id);
  batch.update(requestRef, {
    status: newStatus,
    processedAt: serverTimestamp(),
  });

  // If approved, update user subscription
  if (newStatus === "approved") {
    const userRef = doc(db, "users", request.userId);

    // Logic: 30-day window
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 30);

    batch.update(userRef, {
      isSubscribed: true,
      subscriptionStatus: "approved",
      subscriptionStartDate: serverTimestamp(),
      subscriptionEndDate: Timestamp.fromDate(endDate),
    });
  } else {
    // If rejected, reset user status so they can try again
    const userRef = doc(db, "users", request.userId);
    batch.update(userRef, {
      subscriptionStatus: "none", // Or whatever your default is
      isSubscribed: false,
    });
  }

  return await batch.commit();
};
