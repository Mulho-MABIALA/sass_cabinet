import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { facturationApi } from "../../api/facturation.api";
import { useAuthStore } from "../../store/auth.store";
import { Button } from "../../components/ui/Button";
import { ApiError } from "../../api/client";
import { Plan } from "../../types";

const NOMS_MOIS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const LABELS_PLAN: Record<Plan, string> = {
  starter: "Starter (facturé à l'usage)",
  cabinet: "Cabinet (forfait)",
  premium: "Premium (forfait)",
};

const PLANS: Plan[] = ["starter", "cabinet", "premium"];

function formaterMois(annee: number, mois: number): string {
  return `${NOMS_MOIS[mois - 1]} ${annee}`;
}

function formaterMontant(montant: number): string {
  return montant.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export function FacturationPage() {
  const role = useAuthStore((state) => state.user?.role);
  const [searchParams] = useSearchParams();
  const checkoutStatut = searchParams.get("checkout");
  const [erreur, setErreur] = useState<string | null>(null);

  const { data: usage, isLoading, error } = useQuery({
    queryKey: ["facturation-usage"],
    queryFn: () => facturationApi.getUsage(),
  });

  const checkoutMutation = useMutation({
    mutationFn: (plan: Plan) => facturationApi.creerCheckout(plan),
    onSuccess: (session) => {
      window.location.href = session.url;
    },
    onError: (err) => {
      setErreur(err instanceof ApiError ? err.message : "Impossible de lancer le paiement");
    },
  });

  const portailMutation = useMutation({
    mutationFn: () => facturationApi.creerPortail(),
    onSuccess: (session) => {
      window.location.href = session.url;
    },
    onError: (err) => {
      setErreur(err instanceof ApiError ? err.message : "Impossible d'ouvrir la gestion d'abonnement");
    },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Facturation & usage</h1>
        <p className="mt-1 text-sm text-slate-500">
          Suivi des dossiers passés au statut « complet », base du calcul de la facturation à l'usage.
        </p>
      </div>

      {checkoutStatut === "succes" && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Abonnement activé. Cela peut prendre quelques secondes à apparaître ci-dessous.
        </p>
      )}
      {checkoutStatut === "annule" && (
        <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">Paiement annulé.</p>
      )}
      {erreur && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{erreur}</p>}

      {isLoading && <p className="text-sm text-slate-500">Chargement…</p>}
      {error && <p className="text-sm text-red-600">Impossible de charger l'usage.</p>}

      {usage && (
        <>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium">Plan actuel</p>
            <p className="mt-1 text-lg">{LABELS_PLAN[usage.plan]}</p>
            {usage.plan !== "starter" && (
              <p className="mt-1 text-xs text-slate-500">
                Les plans forfaitaires ne sont pas facturés à l'usage : le compteur reste informatif.
              </p>
            )}

            {role === "admin" && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                {PLANS.map((plan) => (
                  <Button
                    key={plan}
                    variant={plan === usage.plan ? "secondary" : "primary"}
                    disabled={checkoutMutation.isPending || plan === usage.plan}
                    onClick={() => {
                      setErreur(null);
                      checkoutMutation.mutate(plan);
                    }}
                  >
                    {plan === usage.plan ? `Plan actuel : ${LABELS_PLAN[plan]}` : `Passer au plan ${LABELS_PLAN[plan]}`}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  disabled={portailMutation.isPending}
                  onClick={() => {
                    setErreur(null);
                    portailMutation.mutate();
                  }}
                >
                  Gérer mon abonnement / mes factures
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium">Mois en cours — {formaterMois(usage.moisCourant.annee, usage.moisCourant.mois)}</p>
            <div className="mt-2 flex items-baseline gap-4">
              <span className="text-3xl font-semibold">{usage.moisCourant.dossiersTraites}</span>
              <span className="text-sm text-slate-500">dossier(s) traité(s)</span>
            </div>
            {usage.plan === "starter" && (
              <p className="mt-2 text-sm text-slate-600">
                Montant estimé : <span className="font-medium">{formaterMontant(usage.moisCourant.montantEstime)}</span>
              </p>
            )}
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Mois</th>
                  <th className="px-4 py-2 font-medium">Dossiers traités</th>
                  <th className="px-4 py-2 font-medium">Montant estimé</th>
                </tr>
              </thead>
              <tbody>
                {usage.moisPrecedents.map((mois) => (
                  <tr key={`${mois.annee}-${mois.mois}`} className="border-t border-slate-100">
                    <td className="px-4 py-2">{formaterMois(mois.annee, mois.mois)}</td>
                    <td className="px-4 py-2">{mois.dossiersTraites}</td>
                    <td className="px-4 py-2">{formaterMontant(mois.montantEstime)}</td>
                  </tr>
                ))}
                {usage.moisPrecedents.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                      Pas d'historique sur les mois précédents.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
