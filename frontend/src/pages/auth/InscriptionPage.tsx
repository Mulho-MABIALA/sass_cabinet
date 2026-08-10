import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { inscriptionApi } from "../../api/inscription.api";
import { useAuthStore } from "../../store/auth.store";
import { inscriptionFormSchema } from "../../schemas/inscription.schema";
import { ApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { Secteur } from "../../types";

const LABELS_SECTEUR: Record<Secteur, string> = {
  avocat: "Avocat",
  notaire: "Notaire",
  syndic: "Syndic",
  courtier: "Courtier",
  expert_comptable: "Expert-comptable",
};

export function InscriptionPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const [nomCabinet, setNomCabinet] = useState("");
  const [secteur, setSecteur] = useState<Secteur>("avocat");
  const [emailAdmin, setEmailAdmin] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErreur(null);

    const parsed = inscriptionFormSchema.safeParse({ nomCabinet, secteur, emailAdmin, motDePasse });
    if (!parsed.success) {
      setErreur(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }

    setChargement(true);
    try {
      const tokens = await inscriptionApi.inscrire(parsed.data);
      setSession(tokens);
      navigate("/tableau-de-bord");
    } catch (error) {
      setErreur(error instanceof ApiError ? error.message : "Erreur lors de la création du cabinet");
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
        <div>
          <h1 className="text-xl font-semibold">Créer mon cabinet</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ton compte sera administrateur de ce nouveau cabinet.
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="nomCabinet" className="text-sm font-medium">
            Nom du cabinet
          </label>
          <input
            id="nomCabinet"
            value={nomCabinet}
            onChange={(e) => setNomCabinet(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="secteur" className="text-sm font-medium">
            Secteur
          </label>
          <select
            id="secteur"
            value={secteur}
            onChange={(e) => setSecteur(e.target.value as Secteur)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {Object.entries(LABELS_SECTEUR).map(([valeur, label]) => (
              <option key={valeur} value={valeur}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="emailAdmin" className="text-sm font-medium">
            Ton email
          </label>
          <input
            id="emailAdmin"
            type="email"
            value={emailAdmin}
            onChange={(e) => setEmailAdmin(e.target.value)}
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
            autoComplete="new-password"
          />
        </div>

        {erreur && <p className="text-sm text-red-600">{erreur}</p>}

        <Button type="submit" disabled={chargement} className="w-full">
          {chargement ? "Création..." : "Créer mon cabinet"}
        </Button>

        <p className="text-center text-sm text-slate-500">
          Déjà un compte ?{" "}
          <Link to="/connexion" className="text-slate-900 underline">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}
