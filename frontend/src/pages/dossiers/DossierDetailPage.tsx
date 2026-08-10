import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { dossiersApi } from "../../api/dossiers.api";
import { documentsApi } from "../../api/documents.api";
import { DocumentStatusBadge, DossierStatusBadge } from "../../components/ui/StatusBadge";
import { Button } from "../../components/ui/Button";
import { ApiError } from "../../api/client";

export function DossierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);

  const {
    data: dossier,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dossier", id],
    queryFn: () => dossiersApi.getById(id as string),
    enabled: Boolean(id),
  });

  const invalider = () => queryClient.invalidateQueries({ queryKey: ["dossier", id] });

  const validerMutation = useMutation({
    mutationFn: (documentId: string) => documentsApi.valider(documentId),
    onSuccess: invalider,
  });

  const refuserMutation = useMutation({
    mutationFn: (documentId: string) => documentsApi.refuser(documentId),
    onSuccess: invalider,
  });

  const relancerMutation = useMutation({
    mutationFn: () => dossiersApi.relancer(id as string),
    onSuccess: (result) => {
      setMessage(
        result.statut === "envoyee" ? "Relance envoyée avec succès." : "Échec de l'envoi de la relance."
      );
      invalider();
    },
    onError: (error) => {
      setMessage(error instanceof ApiError ? error.message : "Erreur lors de la relance");
    },
  });

  const signatureMutation = useMutation({
    mutationFn: (documentId: string) => documentsApi.envoyerPourSignature(documentId),
    onSuccess: (resultat) => {
      setMessage(`Signature envoyée (statut : ${resultat.statut}).`);
      window.open(resultat.signatureUrl, "_blank", "noreferrer");
    },
    onError: (error) => {
      setMessage(error instanceof ApiError ? error.message : "Erreur lors de l'envoi en signature");
    },
  });

  const effacementMutation = useMutation({
    mutationFn: () => dossiersApi.effacerRgpd(id as string),
    onSuccess: () => {
      navigate("/");
    },
    onError: (error) => {
      setMessage(error instanceof ApiError ? error.message : "Erreur lors de l'effacement RGPD");
    },
  });

  if (isLoading) return <p className="text-sm text-slate-500">Chargement…</p>;
  if (error || !dossier) return <p className="text-sm text-red-600">Dossier introuvable.</p>;

  const lienPortail = `${window.location.origin}/portail/${dossier.tokenPortail}`;

  function handleEffacement() {
    if (
      window.confirm(
        "Effacer immédiatement les données personnelles de ce client (droit à l'effacement RGPD) ? Cette action est irréversible : nom, email, téléphone et documents seront supprimés."
      )
    ) {
      effacementMutation.mutate();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{dossier.nomClient}</h1>
          <p className="text-sm text-slate-500">{dossier.emailClient}</p>
          {dossier.telephoneClient && (
            <p className="text-sm text-slate-500">{dossier.telephoneClient}</p>
          )}
          <p className="text-sm text-slate-500">{dossier.typeDossier.nom}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <DossierStatusBadge statut={dossier.statut} />
          <Button
            variant="secondary"
            onClick={() => relancerMutation.mutate()}
            disabled={relancerMutation.isPending || dossier.statut === "complet"}
          >
            {relancerMutation.isPending ? "Envoi..." : "Relancer le client"}
          </Button>
          <Button
            variant="ghost"
            className="text-red-600 hover:bg-red-50"
            onClick={handleEffacement}
            disabled={effacementMutation.isPending}
          >
            {effacementMutation.isPending ? "Effacement..." : "Droit à l'effacement (RGPD)"}
          </Button>
        </div>
      </div>

      {message && <p className="text-sm text-slate-600">{message}</p>}

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium">Lien du portail client</p>
        <div className="mt-1 flex items-center gap-2">
          <code className="flex-1 truncate rounded bg-slate-100 px-2 py-1 text-xs">
            {lienPortail}
          </code>
          <Button variant="secondary" onClick={() => navigator.clipboard.writeText(lienPortail)}>
            Copier
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Document</th>
              <th className="px-4 py-2 font-medium">Obligatoire</th>
              <th className="px-4 py-2 font-medium">Fichier</th>
              <th className="px-4 py-2 font-medium">Statut</th>
              <th className="px-4 py-2 font-medium">Anomalies</th>
              <th className="px-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dossier.documentsDeposes.map((doc) => (
              <tr key={doc.id} className="border-t border-slate-100 align-top">
                <td className="px-4 py-2">{doc.documentRequis.nom}</td>
                <td className="px-4 py-2">{doc.documentRequis.obligatoire ? "Oui" : "Non"}</td>
                <td className="px-4 py-2 text-slate-500">
                  {doc.nomFichier ?? "—"}
                  {doc.donneesExtraites && doc.donneesExtraites.montants.length > 0 && (
                    <div className="mt-1 text-xs text-slate-400">
                      Montants détectés : {doc.donneesExtraites.montants.join(", ")} €
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">
                  <DocumentStatusBadge statut={doc.statut} />
                </td>
                <td className="px-4 py-2">
                  {doc.anomalies.length === 0 && <span className="text-xs text-slate-400">—</span>}
                  {doc.anomalies.length > 0 && (
                    <ul className="space-y-1">
                      {doc.anomalies.map((anomalie) => (
                        <li key={anomalie.id} className="text-xs text-amber-700">
                          <span className="font-medium">{anomalie.type}</span> — {anomalie.description}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-2">
                    {doc.statut === "depose" && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => validerMutation.mutate(doc.id)}
                          disabled={validerMutation.isPending}
                        >
                          Valider
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => refuserMutation.mutate(doc.id)}
                          disabled={refuserMutation.isPending}
                        >
                          Refuser
                        </Button>
                      </>
                    )}
                    {doc.statut === "valide" && (
                      <Button
                        variant="secondary"
                        onClick={() => signatureMutation.mutate(doc.id)}
                        disabled={signatureMutation.isPending}
                      >
                        {signatureMutation.isPending ? "Envoi..." : "Envoyer en signature"}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium">Historique des relances</p>
        {dossier.relances.length === 0 && (
          <p className="mt-2 text-sm text-slate-500">Aucune relance envoyée.</p>
        )}
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          {dossier.relances.map((relance) => (
            <li key={relance.id}>
              {new Date(relance.dateEnvoi).toLocaleString("fr-FR")} — {relance.canal} — {relance.statut}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
