import { Outlet, useNavigate } from "react-router-dom";
import { usePlatformAuthStore } from "../../store/platform.store";
import { Button } from "../ui/Button";

export function PlatformLayout() {
  const navigate = useNavigate();
  const email = usePlatformAuthStore((state) => state.email);
  const clearSession = usePlatformAuthStore((state) => state.clearSession);

  function handleLogout() {
    clearSession();
    navigate("/plateforme/connexion");
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-white">Console plateforme</span>
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
              Propriétaire du SaaS
            </span>
          </div>
          <div className="flex items-center gap-4">
            {email && <span className="text-sm text-slate-400">{email}</span>}
            <Button variant="secondary" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
