import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { Button } from "../ui/Button";

export function AppLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const estAdmin = user?.role === "admin";

  function handleLogout() {
    clearSession();
    navigate("/connexion");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-lg font-semibold">
              Dossiers Clients
            </Link>
            <nav className="flex items-center gap-4 text-sm text-slate-600">
              <Link to="/" className="hover:text-slate-900">
                Dossiers
              </Link>
              <Link to="/facturation" className="hover:text-slate-900">
                Facturation
              </Link>
              <Link to="/webhooks" className="hover:text-slate-900">
                Intégrations
              </Link>
              {estAdmin && (
                <>
                  <span className="text-slate-300">|</span>
                  <Link to="/admin/equipe" className="hover:text-slate-900">
                    Équipe
                  </Link>
                  <Link to="/admin/types-dossier" className="hover:text-slate-900">
                    Types de dossier
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">{user.email}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    estAdmin ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {estAdmin ? "Admin" : "Collaborateur"}
                </span>
              </div>
            )}
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
