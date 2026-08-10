import { Request, Response } from "express";
import { dossiersService } from "./dossiers.service";
import { ok } from "../../shared/apiResponse";
import {
  CreateDossierInput,
  ExportMetierQuery,
  ExportQuery,
  ListDossiersQuery,
} from "./dossiers.schema";
import { UnauthorizedError } from "../../shared/AppError";
import { versCsv, versJson } from "./dossiers.export";
import { exportMetierProviders } from "./export-metier/ExportMetierProvider";

export const dossiersController = {
  async list(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const { statut } = req.query as unknown as ListDossiersQuery;
    const dossiers = await dossiersService.list(req.user.cabinetId, statut);
    res.status(200).json(ok(dossiers));
  },

  async getById(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const dossier = await dossiersService.getById(req.params.id, req.user.cabinetId);
    res.status(200).json(ok(dossier));
  },

  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const dossier = await dossiersService.create(
      req.user.cabinetId,
      req.user.userId,
      req.body as CreateDossierInput
    );
    res.status(201).json(ok(dossier));
  },

  async export(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const { format } = req.query as unknown as ExportQuery;
    const dossiers = await dossiersService.list(req.user.cabinetId);

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=rapport-synthese.csv");
      res.status(200).send(versCsv(dossiers));
      return;
    }

    res.status(200).json(ok(versJson(dossiers)));
  },

  async exportMetier(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const { systeme } = req.query as unknown as ExportMetierQuery;
    const dossiers = await dossiersService.list(req.user.cabinetId);

    const provider = exportMetierProviders[systeme];
    const resultat = await provider.exporter(
      dossiers.map((dossier) => ({
        id: dossier.id,
        nomClient: dossier.nomClient,
        emailClient: dossier.emailClient,
        statut: dossier.statut,
        createdAt: dossier.createdAt.toISOString(),
        documents: dossier.documentsDeposes.map((doc) => ({
          nomFichier: doc.nomFichier,
          montants: extraireMontants(doc.donneesExtraites),
        })),
      }))
    );

    // Quand le provider génère un vrai fichier (ex. export FEC pour Cegid), on le propose en téléchargement
    // plutôt que de le renvoyer en JSON.
    if (resultat.contenuFichier && resultat.nomFichier) {
      res.setHeader("Content-Type", resultat.contentType ?? "text/plain; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename=${resultat.nomFichier}`);
      res.status(200).send(resultat.contenuFichier);
      return;
    }

    res.status(200).json(ok(resultat));
  },
};

function extraireMontants(donneesExtraites: unknown): number[] {
  if (!donneesExtraites || typeof donneesExtraites !== "object") return [];
  const montants = (donneesExtraites as { montants?: unknown }).montants;
  return Array.isArray(montants) ? montants.filter((v): v is number => typeof v === "number") : [];
}
