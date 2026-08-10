import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";

export function AuthGuard({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!accessToken) {
    return <Navigate to="/connexion" replace />;
  }

  return <>{children}</>;
}
