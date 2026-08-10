import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { usePlatformAuthStore } from "../../store/platform.store";

export function PlatformGuard({ children }: { children: ReactNode }) {
  const accessToken = usePlatformAuthStore((state) => state.accessToken);

  if (!accessToken) {
    return <Navigate to="/plateforme/connexion" replace />;
  }

  return <>{children}</>;
}
