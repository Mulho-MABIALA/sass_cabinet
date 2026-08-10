import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PublicFooter } from "./PublicFooter";

interface LegalLayoutProps {
  titre: string;
  derniereMiseAJour: string;
  children: ReactNode;
}

export function LegalLayout({ titre, derniereMiseAJour, children }: LegalLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold">
            Mon Dossier
          </Link>
          <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
            &larr; Retour à l'accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <div className="mb-8 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Brouillon de travail.</strong> Ce document est en cours de finalisation : certaines mentions
          (identité juridique de l'éditeur) sont en attente de l'immatriculation de l'entreprise et seront complétées
          dès que possible. Il ne constitue pas encore une version définitive validée par un juriste.
        </div>

        <h1 className="text-2xl font-semibold text-slate-900">{titre}</h1>
        <p className="mt-1 text-sm text-slate-500">Dernière mise à jour : {derniereMiseAJour}</p>

        <div className="prose-legal mt-8 space-y-6 text-sm leading-relaxed text-slate-700">{children}</div>
      </main>

      <PublicFooter />
    </div>
  );
}

export function LegalSection({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">{titre}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}
