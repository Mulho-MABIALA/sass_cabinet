import { Router } from "express";
import { rgpdController } from "./rgpd.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../shared/asyncHandler";
import { dossierIdParamSchema } from "./rgpd.schema";

// Monté sur le même préfixe "/dossiers" que dossiersRouter (voir app.ts)
export const rgpdRouter = Router();

rgpdRouter.delete(
  "/:id/rgpd",
  requireAuth,
  requireRole("admin", "collaborateur"),
  validate({ params: dossierIdParamSchema }),
  asyncHandler(rgpdController.effacerDossier)
);
