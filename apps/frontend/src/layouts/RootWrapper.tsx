import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import LoadingScreen from "../components/common/LoadingScreen";

export const RootWrapper = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
};
