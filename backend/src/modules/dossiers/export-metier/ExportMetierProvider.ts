export interface DocumentAExporter {
  nomFichier: string | null;
  montants: number[];
}

export interface DossierAExporter {
  id: string;
  nomClient: string;
  emailClient: string;
  statut: string;
  createdAt: string;
  documents: DocumentAExporter[];
}

export interface ResultatExportMetier {
  success: boolean;
  details: string;
  // Présents uniquement quand le provider génère un vrai fichier téléchargeable (ex. FEC pour Cegid).
  contenuFichier?: string;
  nomFichier?: string;
  contentType?: string;
}

// Interface à implémenter par une intégration vers un logiciel métier (Septeo/Diapaz, Cegid, etc.).
export interface ExportMetierProvider {
  exporter(dossiers: DossierAExporter[]): Promise<ResultatExportMetier>;
}

// NOTE IMPORTANTE (recherche effectuée le jour de l'implémentation) : ni Septeo/Diapaz (juridique/notarial)
// ni Cegid n'exposent d'API publique en self-service permettant de brancher une vraie intégration avec une
// simple clé API, contrairement à Mistral/OVHcloud SMS/Yousign. L'accès nécessite un partenariat commercial
// et des identifiants fournis au cas par cas par l'éditeur. Ce provider reste donc un stub explicite,
// prêt à être remplacé dès que le cabinet aura signé un accès partenaire Septeo/Diapaz.
export class SeptoDiapazExportProvider implements ExportMetierProvider {
  async exporter(dossiers: DossierAExporter[]): Promise<ResultatExportMetier> {
    return {
      success: true,
      details:
        `${dossiers.length} dossier(s) transmis (simulation) vers Septeo/Diapaz. ` +
        "Aucune API publique en self-service n'existe pour ce logiciel : un accès partenaire Septeo est requis pour une vraie intégration.",
    };
  }
}

function echapperFec(valeur: string): string {
  return valeur.replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
}

function formaterDateFec(dateIso: string): string {
  // Format FEC officiel (arrêté du 29/07/2013, DGFiP) pour les dates : AAAAMMJJ
  return dateIso.slice(0, 10).replace(/-/g, "");
}

// Implémentation réelle, mais partielle et volontairement simplifiée : génère un fichier au format FEC
// (Fichier des Écritures Comptables), le format d'échange comptable officiel français normalisé par la
// DGFiP — que Cegid (comme tout logiciel de comptabilité français) sait importer nativement. Contrairement
// à Septeo/Diapaz, il ne s'agit donc pas d'un appel à une API propriétaire Cegid (inaccessible en self-service),
// mais d'un format de fichier standard et public : c'est le pont d'intégration le plus réaliste sans
// partenariat commercial direct avec Cegid.
//
// ATTENTION : chaque dossier/document est mappé sur une écriture au débit d'un compte générique (471000,
// "compte d'attente"), sans contrepartie comptable réelle — ce mapping est un point de départ technique,
// PAS un plan comptable validé. Un expert-comptable doit revoir le plan de comptes et les imputations
// avant tout usage en production.
export class CegidExportProvider implements ExportMetierProvider {
  async exporter(dossiers: DossierAExporter[]): Promise<ResultatExportMetier> {
    const entetes = [
      "JournalCode",
      "JournalLib",
      "EcritureNum",
      "EcritureDate",
      "CompteNum",
      "CompteLib",
      "CompAuxNum",
      "CompAuxLib",
      "PieceRef",
      "PieceDate",
      "EcritureLib",
      "Debit",
      "Credit",
      "EcritureLet",
      "DateLet",
      "ValidDate",
      "Montantdevise",
      "Idevise",
    ];

    const lignes: string[] = [entetes.join("\t")];
    let compteur = 0;

    for (const dossier of dossiers) {
      const documentsAvecMontant = dossier.documents.filter((doc) => doc.montants.length > 0);

      for (const document of documentsAvecMontant) {
        for (const montant of document.montants) {
          compteur += 1;
          const dateFec = formaterDateFec(dossier.createdAt);
          const ligne = [
            "COL", // JournalCode : journal générique "collecte"
            "Journal collecte documentaire", // JournalLib
            String(compteur).padStart(6, "0"), // EcritureNum
            dateFec, // EcritureDate
            "471000", // CompteNum (compte d'attente, à revoir par l'expert-comptable)
            "Compte d'attente - pieces collectees", // CompteLib
            dossier.id.slice(0, 17), // CompAuxNum (limite FEC : 17 caractères)
            echapperFec(dossier.nomClient), // CompAuxLib
            echapperFec(document.nomFichier ?? dossier.id), // PieceRef
            dateFec, // PieceDate
            echapperFec(`Piece deposee - ${document.nomFichier ?? "document"}`), // EcritureLib
            montant.toFixed(2).replace(".", ","), // Debit (format décimal FR)
            "0,00", // Credit
            "", // EcritureLet
            "", // DateLet
            dateFec, // ValidDate
            "", // Montantdevise
            "", // Idevise
          ];
          lignes.push(ligne.join("\t"));
        }
      }
    }

    if (compteur === 0) {
      return {
        success: true,
        details:
          "Aucune écriture générée : aucun montant n'a été extrait par l'OCR sur les documents de ces dossiers.",
      };
    }

    return {
      success: true,
      details: `${compteur} écriture(s) FEC générée(s) à partir de ${dossiers.length} dossier(s), prêtes à être importées dans Cegid.`,
      contenuFichier: lignes.join("\r\n"),
      nomFichier: `export-fec-${new Date().toISOString().slice(0, 10)}.txt`,
      contentType: "text/plain; charset=utf-8",
    };
  }
}

export const exportMetierProviders: Record<"septeo" | "cegid", ExportMetierProvider> = {
  septeo: new SeptoDiapazExportProvider(),
  cegid: new CegidExportProvider(),
};
