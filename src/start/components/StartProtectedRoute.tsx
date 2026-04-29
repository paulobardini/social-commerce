import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useStartAuth } from "../contexts/StartAuthContext";

export function StartProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuth, onboardingDone } = useStartAuth();
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/start/login" state={{ from: location }} replace />;
  }
  if (!onboardingDone && location.pathname !== "/start/onboarding") {
    return <Navigate to="/start/onboarding" replace />;
  }
  return <>{children}</>;
}
