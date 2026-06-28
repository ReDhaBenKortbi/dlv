import { Timestamp } from "firebase/firestore";

export type PaymentStatus = "pending" | "approved" | "rejected";

export interface PaymentRequest {
  id: string; // Firestore Document ID
  userId: string; // The ID of the user who paid
  userEmail: string; // For admin display/search
  fullName: string; // The name the user provided during checkout
  amount: string; // Usually "500" or "1000" DZD
  receiptURL: string; // Cloudinary link to the image
  status: PaymentStatus;
  createdAt: Timestamp;
  processedAt?: Timestamp; // Added when an admin approves/rejects
}
