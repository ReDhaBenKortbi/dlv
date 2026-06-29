import { api } from "../lib/api";
import { uploadImageToCloudinary } from "./cloudinaryService";
import type { PaymentRequest } from "../types/paymentRequest";

export const uploadReceiptAndSubmit = async (
  fullName: string,
  file: File,
  amount: string,
) => {
  const receiptURL = await uploadImageToCloudinary(file);
  return api("/payments", {
    method: "POST",
    body: JSON.stringify({ fullName, amount, receiptURL }),
  });
};

export const getMyPayments = (): Promise<PaymentRequest[]> =>
  api("/payments/mine");

export const getPendingPayments = (): Promise<PaymentRequest[]> =>
  api("/payments");

export const processPayment = (
  request: PaymentRequest,
  newStatus: "approved" | "rejected",
) => api(`/payments/${request.id}/${newStatus}`, { method: "POST" });
