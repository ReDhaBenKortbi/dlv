import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const PaymentSuccess = () => (
  <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
    <div className="card w-full max-w-md bg-base-100 shadow-2xl text-center p-10 space-y-4">
      <CheckCircle className="w-16 h-16 text-success mx-auto" />
      <h2 className="text-2xl font-bold">Payment Received</h2>
      <p className="text-base-content/70">
        Your payment was processed successfully. Your subscription will be
        activated shortly.
      </p>
      <Link to="/" className="btn btn-primary w-full mt-4">
        Return to Library
      </Link>
    </div>
  </div>
);

export default PaymentSuccess;
