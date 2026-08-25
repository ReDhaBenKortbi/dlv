import { Link } from "react-router-dom";

import { StatusCard } from "@/components/common/StatusCard";

export const NotFound = () => (
  <StatusCard
    variant="bare"
    icon={<h1 className="text-9xl font-bold text-primary opacity-20">404</h1>}
    title="Page Not Found"
    body="Sorry, the page you are looking for doesn't exist or has been moved."
    action={
      <Link to="/" className="btn btn-primary px-8">
        Go Back Home
      </Link>
    }
  />
);
