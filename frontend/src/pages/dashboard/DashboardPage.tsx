import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
import { dossiersApi } from "../../api/dossiers.api";
import { StatutDossier } from "../../types";
import { DossierStatusBadge } from "../../components/ui/StatusBadge";
import { Button } from "../../components/ui/Button";
import { ApiError } from "../../api/client";

const FILTRES: Array<{ label: string; value: StatutDossier | undefined }> = [
  { label: "Tous", value: undefined },
  { label: "Incomplet", value: "incomplet" },
  { label: "En attente de vérification", value: "en_attente_verification" },
  { label: "Complet", value: "complet" },
];

export function DashboardPage() {
  const [statut, setStatut] = useState<StatutDossier | undefined>(undefined);
  const [messageExport, setMessageExport] = useState<string | null>(null);

  const { data: dossiers, isLoading, error } = useQuery({
    queryKey: ["dossiers", statut],
    queryFn: () => dossiersApi.list(statut),
  });

  const exportCsvMutation = useMutation({
    mutationFn: () => dossiersApi.exportCsv(),
    onError: (err) => setMessageExport(err instanceof ApiError ? err.message : "Échec de l'export CSV"),
  });

  const exportFecMutation = useMutation({
    mutationFn: () => dossiersApi.exportMetierCegid(),
    onError: (err) => setMessageExport(err instanceof ApiError ? err.message : "Échec de l'export Cegid"),
  });

  const exportSepteoMutation = useMutation({
    mutationFn: () => dossiersApi.exportMetierSepteo(),
    onSuccess: (resultat) => setMessageExport(resultat.details),
    onError: (err) => setMessageExport(err instanceof ApiError ? err.message : "Échec de l'export Septeo"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dossiers</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => exportCsvMutation.mutate()}
            disabled={exportCsvMutation.isPending}
          >
            Exporter CSV
          </Button>
          <Button
            variant="secondary"
            onClick={() => exportFecMutation.mutate()}
            disabled={exportFecMutation.isPending}
            title="Génère un fichier FEC (Fichier des Écritures Comptables) importable dans Cegid"
          >
            Export Cegid (FEC)
          </Button>
          <Button
            variant="secondary"
            onClick={() => exportSepteoMutation.mutate()}
            disabled={exportSepteoMutation.isPending}
            title="Stub : aucune API publique Septeo/Diapaz en self-service"
          >
            Export Septeo
          </Button>
          <Link to="/dossiers/nouveau">
            <Button>Nouveau dossier</Button>
          </Link>
        </div>
      </div>

      {messageExport && <p className="text-sm text-slate-600">{messageExport}</p>}

      <div className="flex flex-wrap gap-2">
        {FILTRES.map((filtre) => (
          <button
            key={filtre.label}
            onClick={() => setStatut(filtre.value)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              statut === filtre.value
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-300"
            }`}
          >
            {filtre.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-slate-500">Chargement…</p>}
      {error && <p className="text-sm text-red-600">Impossible de charger les dossiers.</p>}

      {dossiers && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Client</th>
                <th className="px-4 py-2 font-medium">Type de dossier</th>
                <th className="px-4 py-2 font-medium">Collaborateur</th>
                <th className="px-4 py-2 font-medium">Documents</th>
                <th className="px-4 py-2 font-medium">Statut</th>
                <th className="px-4 py-2 font-medium">Créé le</th>
              </tr>
            </thead>
            <tbody>
              {dossiers.map((dossier) => {
                const valides = dossier.documentsDeposes.filter(
                  (doc) => doc.statut === "valide"
                ).length;
                const total = dossier.documentsDeposes.length;

                return (
                  <tr key={dossier.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2">
                      <Link to={`/dossiers/${dossier.id}`} className="font-medium hover:underline">
                        {dossier.nomClient}
                      </Link>
                      <div className="text-xs text-slate-500">{dossier.emailClient}</div>
                    </td>
                    <td className="px-4 py-2">{dossier.typeDossier.nom}</td>
                    <td className="px-4 py-2">{dossier.collaborateur.email}</td>
                    <td className="px-4 py-2">
                      {valides} / {total}
                    </td>
                    <td className="px-4 py-2">
                      <DossierStatusBadge statut={dossier.statut} />
                    </td>
                    <td className="px-4 py-2 text-slate-500">
                      {new Date(dossier.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                );
              })}
              {dossiers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                    Aucun dossier pour ce filtre.
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
