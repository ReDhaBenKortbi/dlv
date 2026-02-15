const LoadingScreen = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-base-200">
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-sm font-bold uppercase tracking-widest text-base-content/40 animate-pulse">
          Loading, please wait...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
