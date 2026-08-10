import express, { Express, Request, Response } from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { authRouter } from "./modules/auth/auth.routes";
import { inscriptionRouter } from "./modules/inscription/inscription.routes";
import { utilisateursRouter } from "./modules/utilisateurs/utilisateurs.routes";
import { typeDossiersRouter } from "./modules/typeDossiers/typeDossiers.routes";
import { dossiersRouter } from "./modules/dossiers/dossiers.routes";
import { relancesRouter } from "./modules/relances/relances.routes";
import { documentsRouter } from "./modules/documents/documents.routes";
import { portailRouter } from "./modules/portail/portail.routes";
import { rgpdRouter } from "./modules/rgpd/rgpd.routes";
import { facturationRouter } from "./modules/facturation/facturation.routes";
import { facturationController } from "./modules/facturation/facturation.controller";
import { webhooksRouter } from "./modules/webhooks/webhooks.routes";
import { platformRouter } from "./modules/platform/platform.routes";
import { invitationsRouter } from "./modules/invitations/invitations.routes";
import { asyncHandler } from "./shared/asyncHandler";

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));

  // Doit être montée AVANT express.json() : Stripe exige le corps brut (non parsé) pour vérifier
  // la signature du webhook (voir facturation.service.ts > traiterWebhook).
  app.post(
    "/facturation/webhook",
    express.raw({ type: "application/json" }),
    asyncHandler(facturationController.webhook)
  );

  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  // Route temporaire de vérification Sentry — à retirer une fois le test effectué.
  app.get("/debug-sentry", () => {
    throw new Error("Test Sentry : erreur volontaire depuis /debug-sentry");
  });

  app.use("/auth", authRouter);
  app.use("/inscription", inscriptionRouter);
  app.use("/utilisateurs", utilisateursRouter);
  app.use("/type-dossiers", typeDossiersRouter);
  app.use("/dossiers", dossiersRouter);
  app.use("/dossiers", relancesRouter);
  app.use("/dossiers", rgpdRouter);
  app.use("/documents", documentsRouter);
  app.use("/portail", portailRouter);
  app.use("/facturation", facturationRouter);
  app.use("/webhooks", webhooksRouter);
  app.use("/platform", platformRouter);
  app.use("/invitations", invitationsRouter);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: "Route introuvable" });
  });

  app.use(errorHandler);

  return app;
}
