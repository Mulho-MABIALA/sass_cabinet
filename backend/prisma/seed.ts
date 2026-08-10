import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const cabinet = await prisma.cabinet.create({
    data: {
      nom: "Cabinet Démo Notaires",
      secteur: "notaire",
    },
  });

  const motDePasseHash = await bcrypt.hash("MotDePasse123!", 10);

  await prisma.utilisateur.create({
    data: {
      cabinetId: cabinet.id,
      email: "admin@demo.fr",
      motDePasseHash,
      role: "admin",
    },
  });

  const collaborateur = await prisma.utilisateur.create({
    data: {
      cabinetId: cabinet.id,
      email: "collaborateur@demo.fr",
      motDePasseHash,
      role: "collaborateur",
    },
  });

  const typeSuccession = await prisma.typeDossier.create({
    data: {
      cabinetId: cabinet.id,
      nom: "Succession",
      secteur: "notaire",
      description: "Dossier de succession standard",
      documentsRequis: {
        create: [
          { nom: "Acte de décès", obligatoire: true },
          { nom: "Livret de famille", obligatoire: true },
          { nom: "Pièce d'identité des héritiers", obligatoire: true },
          { nom: "Contrat de mariage", obligatoire: false },
          { nom: "Testament (le cas échéant)", obligatoire: false },
        ],
      },
    },
  });

  await prisma.typeDossier.create({
    data: {
      cabinetId: cabinet.id,
      nom: "Transaction immobilière",
      secteur: "notaire",
      description: "Vente ou achat d'un bien immobilier",
      documentsRequis: {
        create: [
          { nom: "Pièce d'identité", obligatoire: true },
          { nom: "Justificatif de domicile", obligatoire: true },
          { nom: "Titre de propriété", obligatoire: true },
          { nom: "Diagnostics techniques", obligatoire: true },
        ],
      },
    },
  });

  await prisma.typeDossier.create({
    data: {
      cabinetId: cabinet.id,
      nom: "Clôture d'exercice comptable",
      secteur: "expert_comptable",
      description: "Pièces nécessaires à la clôture annuelle des comptes",
      documentsRequis: {
        create: [
          { nom: "Relevés bancaires de l'exercice", obligatoire: true },
          { nom: "Factures fournisseurs", obligatoire: true },
          { nom: "Factures clients", obligatoire: true },
          { nom: "Grand livre", obligatoire: false },
        ],
      },
    },
  });

  const dossierDemo = await prisma.dossier.create({
    data: {
      cabinetId: cabinet.id,
      typeDossierId: typeSuccession.id,
      collaborateurId: collaborateur.id,
      nomClient: "Jean Dupont",
      emailClient: "jean.dupont@example.fr",
    },
  });

  const documentsRequisSuccession = await prisma.documentRequis.findMany({
    where: { typeDossierId: typeSuccession.id },
  });

  await prisma.documentDepose.createMany({
    data: documentsRequisSuccession.map((doc) => ({
      dossierId: dossierDemo.id,
      documentRequisId: doc.id,
    })),
  });

  // Deuxième cabinet, pour que la console plateforme (super-admin) ait plus d'un client à afficher.
  const cabinetAvocats = await prisma.cabinet.create({
    data: { nom: "Cabinet Avocats Associés", secteur: "avocat", plan: "cabinet" },
  });
  await prisma.utilisateur.create({
    data: {
      cabinetId: cabinetAvocats.id,
      email: "admin@avocats-demo.fr",
      motDePasseHash,
      role: "admin",
    },
  });

  // Compte de l'opérateur de la plateforme (toi, l'éditeur du SaaS) — voir /platform/login.
  const platformMotDePasseHash = await bcrypt.hash("PlateformeAdmin123!", 10);
  await prisma.platformAdmin.create({
    data: {
      email: "plateforme@sassfr.local",
      motDePasseHash: platformMotDePasseHash,
    },
  });

  console.log("Seed terminé.");
  console.log(`Lien portail de démo : /portail/${dossierDemo.tokenPortail}`);
  console.log("Compte admin : admin@demo.fr / MotDePasse123!");
  console.log("Compte collaborateur : collaborateur@demo.fr / MotDePasse123!");
  console.log("Compte admin (2e cabinet) : admin@avocats-demo.fr / MotDePasse123!");
  console.log("Compte super-admin plateforme : plateforme@sassfr.local / PlateformeAdmin123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
