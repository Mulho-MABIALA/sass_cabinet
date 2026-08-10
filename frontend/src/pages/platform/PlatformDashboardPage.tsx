import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "../../api/platform.api";
import { Button } from "../../components/ui/Button";
import { Plan, Secteur, StatutAbonnement } from "../../types";

const LABELS_SECTEUR: Record<Secteur, string> = {
  avocat: "Avocat",
  notaire: "Notaire",
  syndic: "Syndic",
  courtier: "Courtier",
  expert_comptable: "Expert-comptable",
};

const LABELS_PLAN: Record<Plan, string> = {
  starter: "Starter",
  cabinet: "Cabinet",
  premium: "Premium",
};

const LABELS_ABONNEMENT: Record<StatutAbonnement, string> = {
  essai: "Essai",
  actif: "Payant",
  impaye: "Impayé",
  annule: "Résilié",
};

const CLASSES_ABONNEMENT: Record<StatutAbonnement, string> = {
  essai: "bg-slate-500/20 text-slate-300",
  actif: "bg-green-500/20 text-green-400",
  impaye: "bg-amber-500/20 text-amber-400",
  annule: "bg-red-500/20 text-red-400",
};

export function PlatformDashboardPage() {
  const queryClient = useQueryClient();

  const { data: cabinets, isLoading, error } = useQuery({
    queryKey: ["platform-cabinets"],
    queryFn: () => platformApi.listCabinets(),
  });

  const invalider = () => queryClient.invalidateQueries({ queryKey: ["platform-cabinets"] });

  const toggleActifMutation = useMutation({
    mutationFn: ({ id, actif }: { id: string; actif: boolean }) =>
      platformApi.updateCabinet(id, { actif }),
    onSuccess: invalider,
  });

  const changerPlanMutation = useMutation({
    mutationFn: ({ id, plan }: { id: string; plan: Plan }) =>
      platformApi.updateCabinet(id, { plan }),
    onSuccess: invalider,
  });

  const totalCabinets = cabinets?.length ?? 0;
  const totalDossiersTraites =
    cabinets?.reduce((somme, c) => somme + c.dossiersTraitesMoisCourant, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Cabinets clients</h1>
        <p className="mt-1 text-sm text-slate-400">
          Vue d'ensemble de tous les cabinets utilisant la plateforme.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Cabinets actifs</p>
          <p className="mt-1 text-2xl font-semibold text-white">{totalCabinets}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Dossiers traités ce mois (tous cabinets)</p>
          <p className="mt-1 text-2xl font-semibold text-white">{totalDossiersTraites}</p>
        </div>
      </div>

      {isLoading && <p className="text-sm text-slate-400">Chargement…</p>}
      {error && <p className="text-sm text-red-400">Impossible de charger les cabinets.</p>}

      {cabinets && (
        <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/50 text-left text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">Cabinet</th>
                <th className="px-4 py-2 font-medium">Secteur</th>
                <th className="px-4 py-2 font-medium">Plan</th>
                <th className="px-4 py-2 font-medium">Utilisateurs</th>
                <th className="px-4 py-2 font-medium">Dossiers</th>
                <th className="px-4 py-2 font-medium">Traités ce mois</th>
                <th className="px-4 py-2 font-medium">Abonnement</th>
                <th className="px-4 py-2 font-medium">Statut</th>
                <th className="px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cabinets.map((cabinet) => (
                <tr key={cabinet.id} className="border-t border-slate-800 text-slate-200">
                  <td className="px-4 py-2 font-medium">{cabinet.nom}</td>
                  <td className="px-4 py-2 text-slate-400">{LABELS_SECTEUR[cabinet.secteur]}</td>
                  <td className="px-4 py-2">
                    <select
                      value={cabinet.plan}
                      onChange={(e) =>
                        changerPlanMutation.mutate({ id: cabinet.id, plan: e.target.value as Plan })
                      }
                      disabled={changerPlanMutation.isPending}
                      className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white"
                    >
                      {Object.entries(LABELS_PLAN).map(([valeur, label]) => (
                        <option key={valeur} value={valeur}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">{cabinet.nbUtilisateurs}</td>
                  <td className="px-4 py-2">{cabinet.nbDossiers}</td>
                  <td className="px-4 py-2">{cabinet.dossiersTraitesMoisCourant}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${CLASSES_ABONNEMENT[cabinet.statutAbonnement]}`}
                    >
                      {LABELS_ABONNEMENT[cabinet.statutAbonnement]}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        cabinet.actif
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {cabinet.actif ? "Actif" : "Suspendu"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <Button
                      variant={cabinet.actif ? "danger" : "secondary"}
                      onClick={() =>
                        toggleActifMutation.mutate({ id: cabinet.id, actif: !cabinet.actif })
                      }
                      disabled={toggleActifMutation.isPending}
                    >
                      {cabinet.actif ? "Suspendre" : "Réactiver"}
                    </Button>
                  </td>
                </tr>
              ))}
              {cabinets.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-slate-500">
                    Aucun cabinet inscrit pour l'instant.
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
