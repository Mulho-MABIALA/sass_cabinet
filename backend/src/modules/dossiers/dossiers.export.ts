import { DossierAvecRelations } from "./dossiers.repository";

interface LigneSynthese {
  dossierId: string;
  nomClient: string;
  emailClient: string;
  typeDossier: string;
  collaborateur: string;
  statut: string;
  documentsValides: number;
  documentsTotal: number;
  createdAt: string;
}

function versLigneSynthese(dossier: DossierAvecRelations): LigneSynthese {
  return {
    dossierId: dossier.id,
    nomClient: dossier.nomClient,
    emailClient: dossier.emailClient,
    typeDossier: dossier.typeDossier.nom,
    collaborateur: dossier.collaborateur.email,
    statut: dossier.statut,
    documentsValides: dossier.documentsDeposes.filter((doc) => doc.statut === "valide").length,
    documentsTotal: dossier.documentsDeposes.length,
    createdAt: dossier.createdAt.toISOString(),
  };
}

export function versJson(dossiers: DossierAvecRelations[]): LigneSynthese[] {
  return dossiers.map(versLigneSynthese);
}

const ENTETES_CSV: Array<keyof LigneSynthese> = [
  "dossierId",
  "nomClient",
  "emailClient",
  "typeDossier",
  "collaborateur",
  "statut",
  "documentsValides",
  "documentsTotal",
  "createdAt",
];

function echapperCsv(valeur: string | number): string {
  const chaine = String(valeur);
  if (chaine.includes(";") || chaine.includes('"') || chaine.includes("\n")) {
    return `"${chaine.replace(/"/g, '""')}"`;
  }
  return chaine;
}

export function versCsv(dossiers: DossierAvecRelations[]): string {
  const rows = dossiers.map(versLigneSynthese);

  const entete = ENTETES_CSV.join(";");
  const corps = rows
    .map((row) => ENTETES_CSV.map((cle) => echapperCsv(row[cle])).join(";"))
    .join("\n");

  return `${entete}\n${corps}`;
}
