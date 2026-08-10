import { ReactNode } from "react";
import { useAuthStore } from "../../store/auth.store";

// Distinct de AuthGuard (qui vérifie juste la présence d'une session) : celui-ci vérifie en plus le rôle,
// pour les écrans réservés aux admins (gestion de l'équipe, gestion des types de dossier). Le backend
// applique la même restriction côté API (requireRole("admin")) : ce garde-fou frontend est une aide UX,
// pas la barrière de sécurité — la vraie protection est côté serveur.
export function AdminGuard({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);

  if (user?.role !== "admin") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Cette section est réservée aux administrateurs du cabinet.
      </div>
    );
  }

  return <>{children}</>;
}
