import { Link, Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { Button } from "../../components/ui/Button";
import { PublicFooter } from "../../components/layout/PublicFooter";

const FONCTIONNALITES = [
  {
    titre: "Portail de collecte sécurisé",
    description:
      "Vos clients déposent leurs documents depuis un lien unique, sans créer de compte, avec suivi en temps réel de la complétude du dossier.",
  },
  {
    titre: "Relances automatiques",
    description:
      "Emails et SMS de relance envoyés automatiquement tant qu'un document manque, selon le délai que vous définissez.",
  },
  {
    titre: "Extraction et vérification IA",
    description:
      "OCR et détection d'anomalies sur les documents déposés, pour repérer en un coup d'œil ce qui mérite votre attention.",
  },
  {
    titre: "Signature électronique",
    description: "Faites signer les documents qui le nécessitent directement depuis le dossier, sans changer d'outil.",
  },
  {
    titre: "Export vers vos outils métier",
    description: "Vos dossiers et documents s'exportent vers vos logiciels existants, sans ressaisie.",
  },
  {
    titre: "Multi-cabinet et rôles",
    description: "Invitez vos collaborateurs, gérez les droits d'accès, et gardez chaque dossier cloisonné par cabinet.",
  },
];

const PLANS = [
  {
    nom: "Starter",
    prix: "0 €",
    periode: "+ 4 €/dossier traité",
    description: "Pour démarrer sans engagement, facturé uniquement à l'usage.",
    avantages: ["Dossiers illimités", "Relances email automatiques", "Portail de collecte sécurisé"],
  },
  {
    nom: "Cabinet",
    prix: "59 €",
    periode: "/mois",
    description: "Pour un cabinet à l'activité régulière, sans surprise en fin de mois.",
    avantages: ["Dossiers illimités", "Relances email + SMS", "OCR et détection d'anomalies"],
    recommande: true,
  },
  {
    nom: "Premium",
    prix: "149 €",
    periode: "/mois",
    description: "Pour les cabinets qui veulent tout, avec un support prioritaire.",
    avantages: ["Tout Cabinet, en illimité", "Signature électronique", "Intégrations Zapier / Make", "Support prioritaire"],
  },
];

export function LandingPage() {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (accessToken) {
    return <Navigate to="/tableau-de-bord" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold">Mon Dossier</span>
          <nav className="flex items-center gap-3">
            <Link to="/connexion" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
              Connexion
            </Link>
            <Link to="/inscription">
              <Button>Créer mon cabinet</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            La collecte de documents clients, sans relances manuelles
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Mon Dossier aide les cabinets d'avocats, notaires, syndics, courtiers et experts-comptables à réunir les
            documents de leurs clients plus vite, avec des relances automatiques et une vérification assistée par IA.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/inscription">
              <Button className="px-6 py-3 text-base">Créer mon cabinet gratuitement</Button>
            </Link>
            <Link to="/connexion">
              <Button variant="secondary" className="px-6 py-3 text-base">
                J'ai déjà un compte
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-2xl font-semibold text-slate-900">Fonctionnalités</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FONCTIONNALITES.map((f) => (
                <div key={f.titre} className="rounded-lg border border-slate-200 bg-white p-6">
                  <h3 className="font-semibold text-slate-900">{f.titre}</h3>
                  <p className="mt-2 text-sm text-slate-600">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="tarifs" className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-2xl font-semibold text-slate-900">Tarifs</h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-slate-600">
              Sans engagement, changez de formule à tout moment depuis votre espace de facturation.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.nom}
                  className={`flex flex-col rounded-lg border p-6 ${
                    plan.recommande ? "border-slate-900 shadow-md" : "border-slate-200"
                  }`}
                >
                  {plan.recommande && (
                    <span className="mb-2 inline-block w-fit rounded-full bg-slate-900 px-2 py-0.5 text-xs font-medium text-white">
                      Recommandé
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-slate-900">{plan.nom}</h3>
                  <p className="mt-2">
                    <span className="text-3xl font-semibold text-slate-900">{plan.prix}</span>
                    <span className="text-sm text-slate-500"> {plan.periode}</span>
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
                  <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
                    {plan.avantages.map((a) => (
                      <li key={a} className="flex items-start gap-2">
                        <span aria-hidden className="mt-0.5 text-slate-400">
                          &bull;
                        </span>
                        {a}
                      </li>
                    ))}
                  </ul>
                  <Link to="/inscription" className="mt-6">
                    <Button variant={plan.recommande ? "primary" : "secondary"} className="w-full">
                      Choisir {plan.nom}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
