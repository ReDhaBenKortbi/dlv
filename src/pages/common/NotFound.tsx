import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-5">
        <h1 className="text-9xl font-bold text-primary opacity-20">404</h1>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Page Not Found</h2>
          <p className="opacity-60 max-w-sm mx-auto">
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link to="/" className="btn btn-primary px-8">
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
