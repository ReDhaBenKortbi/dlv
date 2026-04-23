import { createContext, useContext } from "react";
import type { DomainBook, CreateBookInput } from "../../application/ports/BookRepo";
import type { DomainReview, CreateReviewInput } from "../../application/ports/ReviewRepo";
import type { DomainPaymentRequest } from "../../application/ports/PaymentRepo";
import type { DomainUser } from "../../application/ports/UserRepo";
import type { ProcessPaymentInput } from "../../application/payments/processPayment";
import type { AddReviewInput } from "../../application/reviews/addReview";
import type { DeleteReviewInput } from "../../application/reviews/deleteReview";
import type { SubmitPaymentReceiptInput } from "../../application/payments/submitPaymentReceipt";
import type { AuthGateway } from "../../application/ports/AuthGateway";
import type { UserRepo } from "../../application/ports/UserRepo";
import type { Clock } from "../../application/ports/Clock";
import type { Logger } from "../../application/ports/Logger";
import type { DashboardStats } from "../../application/ports/DashboardRepo";
import type { CreateTicketInput, DomainTicket } from "../../application/ports/TicketRepo";

export interface UseCasesContextType {
  // Books
  listBooks: () => Promise<DomainBook[]>;
  getBook: (id: string) => Promise<DomainBook>;
  createBook: (input: CreateBookInput) => Promise<string>;
  updateBook: (id: string, updates: Partial<Omit<DomainBook, "id">>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  uploadBookContent: (bookId: string, files: File[], onProgress?: (bytesDone: number, bytesTotal: number) => void) => Promise<void>;

  // Reviews
  getReviewsByBook: (bookId: string) => Promise<DomainReview[]>;
  getUserReview: (bookId: string, userId: string) => Promise<DomainReview | null>;
  addReview: (input: AddReviewInput) => Promise<string>;
  deleteReview: (input: DeleteReviewInput) => Promise<void>;

  // Payments
  getPendingPayments: () => Promise<DomainPaymentRequest[]>;
  submitPaymentReceipt: (input: SubmitPaymentReceiptInput) => Promise<void>;
  processPayment: (input: ProcessPaymentInput) => Promise<void>;

  // Users
  getUsers: () => Promise<DomainUser[]>;
  toggleUserSubscription: (userId: string, isSubscribed: boolean) => Promise<void>;

  // Auth use cases (for pages)
  registerUser: (email: string, password: string, fullName: string) => Promise<void>;
  loginUser: (email: string, password: string) => Promise<void>;

  // Dashboard
  getDashboardMetrics: () => Promise<DashboardStats>;

  // Tickets
  getTickets: () => Promise<DomainTicket[]>;
  submitTicket: (input: CreateTicketInput) => Promise<void>;
  resolveTicket: (id: string) => Promise<void>;
  removeTicket: (id: string) => Promise<void>;

  // Raw ports needed by AuthContext
  authGateway: AuthGateway;
  userRepo: UserRepo;
  clock: Clock;

  // Shared infrastructure
  uploadFile: (file: File) => Promise<string>;
  logger: Logger;
}

export const UseCasesContext = createContext<UseCasesContextType | null>(null);

export function useUseCases(): UseCasesContextType {
  const ctx = useContext(UseCasesContext);
  if (!ctx) throw new Error("useUseCases must be used within a CompositionRoot");
  return ctx;
}

// Re-export domain types so hooks can import from one place
export type {
  DomainBook,
  CreateBookInput,
  DomainReview,
  CreateReviewInput,
  DomainPaymentRequest,
  DomainUser,
  DashboardStats,
  CreateTicketInput,
  DomainTicket,
};
