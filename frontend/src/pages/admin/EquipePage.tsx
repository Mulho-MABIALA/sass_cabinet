import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { utilisateursApi } from "../../api/utilisateurs.api";
import { invitationsApi } from "../../api/invitations.api";
import { Button } from "../../components/ui/Button";
import { ApiError } from "../../api/client";
import { Role } from "../../types";

const LABELS_ROLE: Record<Role, string> = {
  admin: "Administrateur",
  collaborateur: "Collaborateur",
};

export function EquipePage() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("collaborateur");
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { data: utilisateurs, isLoading, error } = useQuery({
    queryKey: ["utilisateurs"],
    queryFn: () => utilisateursApi.list(),
  });

  const inviterMutation = useMutation({
    mutationFn: () => invitationsApi.inviter(email, role),
    onSuccess: (invitation) => {
      setEmail("");
      setRole("collaborateur");
      setErreur(null);
      setMessage(`Invitation envoyée à ${invitation.email}.`);
      queryClient.invalidateQueries({ queryKey: ["utilisateurs"] });
    },
    onError: (err) => {
      setMessage(null);
      setErreur(err instanceof ApiError ? err.message : "Erreur lors de l'envoi de l'invitation");
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) {
      setErreur("Email requis");
      return;
    }
    inviterMutation.mutate();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Équipe du cabinet</h1>
        <p className="mt-1 text-sm text-slate-500">
          Invite un admin ou un collaborateur : il recevra un email pour créer son propre mot de passe.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email à inviter
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="role" className="text-sm font-medium">
              Rôle
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="collaborateur">Collaborateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
        </div>
        {erreur && <p className="text-sm text-red-600">{erreur}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}
        <Button type="submit" disabled={inviterMutation.isPending}>
          {inviterMutation.isPending ? "Envoi..." : "Envoyer l'invitation"}
        </Button>
      </form>

      {isLoading && <p className="text-sm text-slate-500">Chargement…</p>}
      {error && <p className="text-sm text-red-600">Impossible de charger l'équipe.</p>}

      {utilisateurs && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Rôle</th>
                <th className="px-4 py-2 font-medium">Membre depuis</th>
              </tr>
            </thead>
            <tbody>
              {utilisateurs.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        u.role === "admin"
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {LABELS_ROLE[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
