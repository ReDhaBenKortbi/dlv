import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ScrollToTop } from "@/components/common/ScrollToTop";

export const RootWrapper = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ScrollToTop />
      <Outlet />
    </Suspense>
  );
};
