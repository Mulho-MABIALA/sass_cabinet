import { Router } from "express";
import { relancesController } from "./relances.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../shared/asyncHandler";
import { dossierIdParamSchema } from "./relances.schema";

// Monté sur le même préfixe "/dossiers" que dossiersRouter (voir app.ts)
export const relancesRouter = Router();

relancesRouter.post(
  "/:id/relancer",
  requireAuth,
  validate({ params: dossierIdParamSchema }),
  asyncHandler(relancesController.relancerManuellement)
);
