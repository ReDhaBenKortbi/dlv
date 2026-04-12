import type { PaymentRepo } from "../ports/PaymentRepo";
import type { UserRepo } from "../ports/UserRepo";
import type { FileUploader } from "../ports/FileUploader";

interface SubmitPaymentReceiptDeps {
  paymentRepo: PaymentRepo;
  userRepo: UserRepo;
  fileUploader: FileUploader;
}

interface SubmitPaymentReceiptInput {
  userId: string;
  userEmail: string;
  fullName: string;
  receiptFile: File;
  amount: string;
}

export function makeSubmitPaymentReceipt(deps: SubmitPaymentReceiptDeps) {
  return async function submitPaymentReceipt(
    input: SubmitPaymentReceiptInput,
  ): Promise<void> {
    const { paymentRepo, userRepo, fileUploader } = deps;
    const { userId, userEmail, fullName, receiptFile, amount } = input;

    const receiptURL = await fileUploader.upload(receiptFile);

    await paymentRepo.create({ userId, userEmail, fullName, amount, receiptURL });

    await userRepo.updateSubscription(userId, {
      isSubscribed: false,
      status: "pending",
      startDate: null,
      endDate: null,
    });
  };
}

export type { SubmitPaymentReceiptDeps, SubmitPaymentReceiptInput };
