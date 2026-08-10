import { FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { invitationsApi } from "../../api/invitations.api";
import { useAuthStore } from "../../store/auth.store";
import { ApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { Role } from "../../types";

const LABELS_ROLE: Record<Role, string> = {
  admin: "administrateur",
  collaborateur: "collaborateur",
};

export function InvitationAccepterPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  const {
    data: invitation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["invitation", token],
    queryFn: () => invitationsApi.getInvitation(token as string),
    enabled: Boolean(token),
    retry: false,
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErreur(null);

    if (motDePasse.length < 8) {
      setErreur("8 caractères minimum");
      return;
    }
    if (motDePasse !== confirmation) {
      setErreur("Les mots de passe ne correspondent pas");
      return;
    }

    setChargement(true);
    try {
      const tokens = await invitationsApi.accepter(token as string, motDePasse);
      setSession(tokens);
      navigate("/tableau-de-bord");
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Erreur lors de l'activation du compte");
    } finally {
      setChargement(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Chargement…</p>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Invitation invalide</h1>
          <p className="mt-2 text-sm text-slate-500">
            Ce lien d'invitation est introuvable ou a expiré. Demande à ton admin de t'en renvoyer un.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <h1 className="text-xl font-semibold">Rejoindre {invitation.cabinetNom}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {invitation.email} — {LABELS_ROLE[invitation.role]}. Choisis ton mot de passe pour activer
            ton compte.
          </p>
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

        <div className="space-y-1">
          <label htmlFor="confirmation" className="text-sm font-medium">
            Confirme le mot de passe
          </label>
          <PasswordInput
            id="confirmation"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            inputClassName="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            autoComplete="new-password"
          />
        </div>

        {erreur && <p className="text-sm text-red-600">{erreur}</p>}

        <Button type="submit" disabled={chargement} className="w-full">
          {chargement ? "Activation..." : "Activer mon compte"}
        </Button>
      </form>
    </div>
  );
}
