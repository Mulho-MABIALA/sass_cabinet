import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { platformApi } from "../../api/platform.api";
import { usePlatformAuthStore } from "../../store/platform.store";
import { ApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";
import { PasswordInput } from "../../components/ui/PasswordInput";

export function PlatformLoginPage() {
  const navigate = useNavigate();
  const setSession = usePlatformAuthStore((state) => state.setSession);

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErreur(null);
    setChargement(true);
    try {
      const resultat = await platformApi.login(email, motDePasse);
      setSession(resultat.accessToken, resultat.email);
      navigate("/plateforme");
    } catch (error) {
      setErreur(error instanceof ApiError ? error.message : "Erreur de connexion");
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-sm"
      >
        <div>
          <h1 className="text-xl font-semibold text-white">Console plateforme</h1>
          <p className="mt-1 text-sm text-slate-400">Réservé au propriétaire du SaaS.</p>
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-slate-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            autoComplete="email"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="motDePasse" className="text-sm font-medium text-slate-300">
            Mot de passe
          </label>
          <PasswordInput
            id="motDePasse"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            inputClassName="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            iconClassName="text-slate-500 hover:text-slate-300"
            autoComplete="current-password"
          />
        </div>

        {erreur && <p className="text-sm text-red-400">{erreur}</p>}

        <Button type="submit" disabled={chargement} className="w-full">
          {chargement ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
    </div>
  );
}
