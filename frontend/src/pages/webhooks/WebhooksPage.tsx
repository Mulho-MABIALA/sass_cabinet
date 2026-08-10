import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { webhooksApi } from "../../api/webhooks.api";
import { Button } from "../../components/ui/Button";
import { ApiError } from "../../api/client";
import { EvenementWebhook } from "../../types";

const LABELS_EVENEMENT: Record<EvenementWebhook, string> = {
  "dossier.complet": "Dossier passé complet",
  "document.depose": "Document déposé par un client",
};

export function WebhooksPage() {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [evenement, setEvenement] = useState<EvenementWebhook>("dossier.complet");
  const [erreur, setErreur] = useState<string | null>(null);

  const { data: webhooks, isLoading, error } = useQuery({
    queryKey: ["webhooks"],
    queryFn: () => webhooksApi.list(),
  });

  const invalider = () => queryClient.invalidateQueries({ queryKey: ["webhooks"] });

  const creerMutation = useMutation({
    mutationFn: () => webhooksApi.create({ url, evenement, actif: true }),
    onSuccess: () => {
      setUrl("");
      setErreur(null);
      invalider();
    },
    onError: (err) => setErreur(err instanceof ApiError ? err.message : "Erreur lors de la création"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, actif }: { id: string; actif: boolean }) =>
      webhooksApi.update(id, { actif }),
    onSuccess: invalider,
  });

  const supprimerMutation = useMutation({
    mutationFn: (id: string) => webhooksApi.remove(id),
    onSuccess: invalider,
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!url.trim()) {
      setErreur("URL requise");
      return;
    }
    creerMutation.mutate();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Intégrations (Zapier / Make)</h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure des webhooks sortants déclenchés automatiquement lors d'évènements du cabinet.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-[2fr_1.5fr_auto]">
          <div className="space-y-1">
            <label htmlFor="url" className="text-sm font-medium">
              URL du webhook
            </label>
            <input
              id="url"
              placeholder="https://hooks.zapier.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="evenement" className="text-sm font-medium">
              Évènement
            </label>
            <select
              id="evenement"
              value={evenement}
              onChange={(e) => setEvenement(e.target.value as EvenementWebhook)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {Object.entries(LABELS_EVENEMENT).map(([valeur, label]) => (
                <option key={valeur} value={valeur}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={creerMutation.isPending} className="w-full">
              {creerMutation.isPending ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </div>
        {erreur && <p className="text-sm text-red-600">{erreur}</p>}
      </form>

      {isLoading && <p className="text-sm text-slate-500">Chargement…</p>}
      {error && <p className="text-sm text-red-600">Impossible de charger les webhooks.</p>}

      {webhooks && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">URL</th>
                <th className="px-4 py-2 font-medium">Évènement</th>
                <th className="px-4 py-2 font-medium">Actif</th>
                <th className="px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {webhooks.map((webhook) => (
                <tr key={webhook.id} className="border-t border-slate-100">
                  <td className="max-w-xs truncate px-4 py-2">{webhook.url}</td>
                  <td className="px-4 py-2">{LABELS_EVENEMENT[webhook.evenement]}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() =>
                        toggleMutation.mutate({ id: webhook.id, actif: !webhook.actif })
                      }
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        webhook.actif ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {webhook.actif ? "Actif" : "Inactif"}
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <Button
                      variant="danger"
                      onClick={() => supprimerMutation.mutate(webhook.id)}
                      disabled={supprimerMutation.isPending}
                    >
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))}
              {webhooks.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    Aucun webhook configuré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
