import { StatutDocument, StatutDossier } from "../../types";

const DOSSIER_LABELS: Record<StatutDossier, string> = {
  incomplet: "Incomplet",
  en_attente_verification: "En attente de vérification",
  complet: "Complet",
};

const DOSSIER_CLASSES: Record<StatutDossier, string> = {
  incomplet: "bg-red-100 text-red-800",
  en_attente_verification: "bg-amber-100 text-amber-800",
  complet: "bg-green-100 text-green-800",
};

const DOCUMENT_LABELS: Record<StatutDocument, string> = {
  manquant: "Manquant",
  depose: "Déposé",
  valide: "Validé",
  refuse: "Refusé",
};

const DOCUMENT_CLASSES: Record<StatutDocument, string> = {
  manquant: "bg-slate-100 text-slate-700",
  depose: "bg-amber-100 text-amber-800",
  valide: "bg-green-100 text-green-800",
  refuse: "bg-red-100 text-red-800",
};

export function DossierStatusBadge({ statut }: { statut: StatutDossier }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${DOSSIER_CLASSES[statut]}`}>
      {DOSSIER_LABELS[statut]}
    </span>
  );
}

export function DocumentStatusBadge({ statut }: { statut: StatutDocument }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${DOCUMENT_CLASSES[statut]}`}>
      {DOCUMENT_LABELS[statut]}
    </span>
  );
}
