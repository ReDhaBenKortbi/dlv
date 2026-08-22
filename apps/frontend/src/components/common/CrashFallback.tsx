const CrashFallback = () => {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-5 max-w-sm">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="opacity-60">
          An unexpected error occurred. Reloading the page usually fixes
          this.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary px-8"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

export default CrashFallback;
