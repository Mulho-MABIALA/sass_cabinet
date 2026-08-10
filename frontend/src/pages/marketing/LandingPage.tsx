import { ReactNode } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { Button } from "../../components/ui/Button";
import { PublicFooter } from "../../components/layout/PublicFooter";

function IconFolder() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.75">
      <path d="M6 8a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 12 6 8Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 17a2.5 2.5 0 0 0 5 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconScan() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2M20 8V6a2 2 0 0 0-2-2h-2M20 16v2a2 2 0 0 1-2 2h-2M4 12h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSignature() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 17c2-4 4-2 6-4s2-5 4-3 1 4 3 3 3-3 5-2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 21h18" strokeLinecap="round" />
    </svg>
  );
}

function IconExport() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.75">
      <path d="M12 3v12m0-12 4 4m-4-4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.75">
      <circle cx="9" cy="8" r="3" />
      <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6M16 5.5c1.8.4 3 1.8 3 3.5s-1.2 3.1-3 3.5M22 20c0-2.7-2.2-5-5-5.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.75">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const FONCTIONNALITES: { titre: string; description: string; icon: ReactNode }[] = [
  {
    titre: "Portail de collecte sécurisé",
    description:
      "Vos clients déposent leurs documents depuis un lien unique, sans créer de compte, avec suivi en temps réel de la complétude du dossier.",
    icon: <IconFolder />,
  },
  {
    titre: "Relances automatiques",
    description: "Emails et SMS de relance envoyés automatiquement tant qu'un document manque, selon le délai que vous définissez.",
    icon: <IconBell />,
  },
  {
    titre: "Extraction et vérification IA",
    description: "OCR et détection d'anomalies sur les documents déposés, pour repérer en un coup d'œil ce qui mérite votre attention.",
    icon: <IconScan />,
  },
  {
    titre: "Signature électronique",
    description: "Faites signer les documents qui le nécessitent directement depuis le dossier, sans changer d'outil.",
    icon: <IconSignature />,
  },
  {
    titre: "Export vers vos outils métier",
    description: "Vos dossiers et documents s'exportent vers vos logiciels existants, sans ressaisie.",
    icon: <IconExport />,
  },
  {
    titre: "Multi-cabinet et rôles",
    description: "Invitez vos collaborateurs, gérez les droits d'accès, et gardez chaque dossier cloisonné par cabinet.",
    icon: <IconUsers />,
  },
];

const ETAPES = [
  {
    numero: "1",
    titre: "Créez le dossier",
    description: "Choisissez le type de dossier et la liste des documents requis se remplit automatiquement.",
  },
  {
    numero: "2",
    titre: "Envoyez le lien au client",
    description: "Votre client reçoit un lien sécurisé, sans mot de passe à retenir, pour déposer ses documents.",
  },
  {
    numero: "3",
    titre: "Suivez et validez",
    description: "Relances automatiques, extraction IA et alertes d'anomalies : vous n'avez plus qu'à valider.",
  },
];

const PROFESSIONS = ["Avocats", "Notaires", "Syndics de copropriété", "Courtiers", "Experts-comptables"];

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

const FAQ = [
  {
    question: "Où sont hébergées les données ?",
    reponse:
      "En France et dans l'Union européenne : l'application et la base de données sont hébergées chez Scalingo (France), les documents chez OVHcloud (Union européenne).",
  },
  {
    question: "Puis-je changer de formule ou résilier à tout moment ?",
    reponse: "Oui, sans engagement. Vous changez de formule ou résiliez depuis votre espace de facturation, en quelques clics.",
  },
  {
    question: "Mes clients doivent-ils créer un compte pour déposer leurs documents ?",
    reponse: "Non. Ils accèdent au portail de dépôt via un lien sécurisé unique, sans inscription ni mot de passe.",
  },
  {
    question: "Le Service respecte-t-il le RGPD ?",
    reponse:
      "Oui : chiffrement des documents, cloisonnement strict des données entre cabinets, durées de conservation définies et droit à l'effacement. Le détail est dans notre politique de confidentialité.",
  },
];

export function LandingPage() {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (accessToken) {
    return <Navigate to="/tableau-de-bord" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold">Mon Dossier</span>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 sm:flex">
            <a href="#fonctionnalites" className="hover:text-slate-900">
              Fonctionnalités
            </a>
            <a href="#tarifs" className="hover:text-slate-900">
              Tarifs
            </a>
            <a href="#faq" className="hover:text-slate-900">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/connexion" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
              Connexion
            </Link>
            <Link to="/inscription">
              <Button>Créer mon cabinet</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center blur-3xl"
          >
            <div className="h-[420px] w-[780px] rounded-full bg-gradient-to-tr from-slate-200 via-indigo-100 to-slate-100 opacity-70" />
          </div>

          <div className="mx-auto max-w-4xl px-4 py-24 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <IconShield /> Hébergé en France &amp; Union européenne
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
              La collecte de documents clients, <span className="text-slate-500">sans relances manuelles</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Mon Dossier aide les cabinets de professions réglementées à réunir les documents de leurs clients plus
              vite, avec des relances automatiques et une vérification assistée par IA.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/inscription">
                <Button className="w-full px-6 py-3 text-base sm:w-auto">Créer mon cabinet gratuitement</Button>
              </Link>
              <Link to="/connexion">
                <Button variant="secondary" className="w-full px-6 py-3 text-base sm:w-auto">
                  J'ai déjà un compte
                </Button>
              </Link>
            </div>

            <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-400">
              {PROFESSIONS.map((p) => (
                <span key={p} className="font-medium">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="border-t border-slate-200 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Comment ça marche</h2>
              <p className="mt-2 text-2xl font-semibold text-slate-900">Trois étapes, aucune relance à faire vous-même</p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {ETAPES.map((etape) => (
                <div key={etape.numero} className="relative rounded-xl border border-slate-200 bg-white p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {etape.numero}
                  </span>
                  <h3 className="mt-4 font-semibold text-slate-900">{etape.titre}</h3>
                  <p className="mt-2 text-sm text-slate-600">{etape.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fonctionnalités */}
        <section id="fonctionnalites" className="border-t border-slate-200 bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Fonctionnalités</h2>
              <p className="mt-2 text-2xl font-semibold text-slate-900">Tout ce qu'il faut pour fermer un dossier plus vite</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FONCTIONNALITES.map((f) => (
                <div
                  key={f.titre}
                  className="rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-white">
                    {f.icon}
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">{f.titre}</h3>
                  <p className="mt-2 text-sm text-slate-600">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tarifs */}
        <section id="tarifs" className="border-t border-slate-200 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Tarifs</h2>
              <p className="mt-2 text-2xl font-semibold text-slate-900">Une formule pour chaque taille de cabinet</p>
              <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
                Sans engagement, changez de formule à tout moment depuis votre espace de facturation.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.nom}
                  className={`flex flex-col rounded-xl border p-6 ${
                    plan.recommande ? "border-slate-900 shadow-lg" : "border-slate-200"
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

        {/* FAQ */}
        <section id="faq" className="border-t border-slate-200 bg-slate-50 py-20">
          <div className="mx-auto max-w-3xl px-4">
            <div className="text-center">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Questions fréquentes</h2>
              <p className="mt-2 text-2xl font-semibold text-slate-900">Ce qu'on nous demande le plus souvent</p>
            </div>
            <div className="mt-10 space-y-4">
              {FAQ.map((item) => (
                <details key={item.question} className="group rounded-xl border border-slate-200 bg-white p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-slate-900">
                    {item.question}
                    <span className="ml-4 text-slate-400 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-slate-600">{item.reponse}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="border-t border-slate-200 py-20">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-3xl font-semibold text-slate-900">Prêt à arrêter les relances manuelles ?</h2>
            <p className="mt-3 text-slate-600">Créez votre cabinet en quelques minutes, sans carte bancaire pour démarrer.</p>
            <div className="mt-8">
              <Link to="/inscription">
                <Button className="px-6 py-3 text-base">Créer mon cabinet gratuitement</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
