import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth.api";
import { useAuthStore } from "../../store/auth.store";
import { loginFormSchema } from "../../schemas/auth.schema";
import { ApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";
import { PasswordInput } from "../../components/ui/PasswordInput";

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErreur(null);

    const parsed = loginFormSchema.safeParse({ email, motDePasse });
    if (!parsed.success) {
      setErreur(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }

    setChargement(true);
    try {
      const tokens = await authApi.login(parsed.data.email, parsed.data.motDePasse);
      setSession(tokens);
      navigate("/");
    } catch (error) {
      setErreur(error instanceof ApiError ? error.message : "Erreur de connexion");
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold">Connexion</h1>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            autoComplete="email"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="motDePasse" className="text-sm font-medium">
            Mot de passe
          </label>
          <PasswordInput
            id="motDePasse"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            inputClassName="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            autoComplete="current-password"
          />
        </div>

        {erreur && <p className="text-sm text-red-600">{erreur}</p>}

        <Button type="submit" disabled={chargement} className="w-full">
          {chargement ? "Connexion..." : "Se connecter"}
        </Button>

        <p className="text-center text-sm text-slate-500">
          Pas encore de compte ?{" "}
          <Link to="/inscription" className="text-slate-900 underline">
            Créer mon cabinet
          </Link>
        </p>
      </form>
    </div>
  );
}
