import { useMemo } from "react";
import { UseCasesContext } from "./UseCasesContext";
import type { UseCasesContextType } from "./UseCasesContext";

// API infrastructure adapters
import { makeApiAuthGateway } from "../../infrastructure/api/ApiAuthGateway";
import { makeApiBookRepo } from "../../infrastructure/api/ApiBookRepo";
import { makeApiReviewRepo } from "../../infrastructure/api/ApiReviewRepo";
import { makeApiPaymentRepo } from "../../infrastructure/api/ApiPaymentRepo";
import { makeApiUserRepo } from "../../infrastructure/api/ApiUserRepo";

// File upload still goes directly to Cloudinary from the frontend.
import { makeCloudinaryFileUploader } from "../../infrastructure/cloudinary/CloudinaryFileUploader";

import { consoleLogger } from "../../infrastructure/logger/consoleLogger";
import { systemClock } from "../../application/ports/Clock";

// Book use cases
import { makeListBooks } from "../../application/books/listBooks";
import { makeGetBook } from "../../application/books/getBook";
import { makeCreateBook } from "../../application/books/createBook";
import { makeUpdateBook } from "../../application/books/updateBook";
import { makeDeleteBook } from "../../application/books/deleteBook";

// Review use cases
import { makeGetReviewsByBook } from "../../application/reviews/getReviews";
import { makeGetUserReview } from "../../application/reviews/getUserReview";
import { makeAddReview } from "../../application/reviews/addReview";
import { makeDeleteReview } from "../../application/reviews/deleteReview";

// Payment use cases
import { makeGetPendingPayments } from "../../application/payments/getPendingPayments";
import { makeSubmitPaymentReceipt } from "../../application/payments/submitPaymentReceipt";
import { makeProcessPayment } from "../../application/payments/processPayment";

// User use cases
import { makeGetUsers } from "../../application/users/getUsers";
import { makeToggleUserSubscription } from "../../application/users/toggleUserSubscription";

// Auth use cases
import { makeRegisterUser } from "../../application/auth/registerUser";
import { makeLoginUser } from "../../application/auth/loginUser";

interface CompositionRootProps {
  children: React.ReactNode;
}

export function CompositionRoot({ children }: CompositionRootProps) {
  const value = useMemo<UseCasesContextType>(() => {
    const authGateway = makeApiAuthGateway();
    const bookRepo = makeApiBookRepo();
    const reviewRepo = makeApiReviewRepo();
    const paymentRepo = makeApiPaymentRepo();
    const userRepo = makeApiUserRepo();
    const fileUploader = makeCloudinaryFileUploader();
    const clock = systemClock;

    return {
      // Books
      listBooks: makeListBooks(bookRepo),
      getBook: makeGetBook(bookRepo),
      createBook: makeCreateBook(bookRepo),
      updateBook: makeUpdateBook(bookRepo),
      deleteBook: makeDeleteBook(bookRepo),

      // Reviews
      getReviewsByBook: makeGetReviewsByBook(reviewRepo),
      getUserReview: makeGetUserReview(reviewRepo),
      addReview: makeAddReview({ reviewRepo, bookRepo, clock }),
      deleteReview: makeDeleteReview({ reviewRepo, bookRepo }),

      // Payments
      getPendingPayments: makeGetPendingPayments(paymentRepo),
      submitPaymentReceipt: makeSubmitPaymentReceipt({ paymentRepo, userRepo, fileUploader }),
      processPayment: makeProcessPayment({ paymentRepo, userRepo, clock }),

      // Users
      getUsers: makeGetUsers(userRepo),
      toggleUserSubscription: makeToggleUserSubscription(userRepo),

      // Auth use cases
      registerUser: makeRegisterUser({ authGateway, userRepo }),
      loginUser: makeLoginUser(authGateway),

      // Raw ports for AuthContext
      authGateway,
      userRepo,
      clock,

      // Shared infrastructure
      uploadFile: (file: File) => fileUploader.upload(file),
      logger: consoleLogger,
    };
  }, []);

  return (
    <UseCasesContext.Provider value={value}>
      {children}
    </UseCasesContext.Provider>
  );
}
