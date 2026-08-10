import { Router } from "express";
import { dossiersController } from "./dossiers.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../shared/asyncHandler";
import {
  createDossierSchema,
  dossierIdParamSchema,
  exportMetierQuerySchema,
  exportQuerySchema,
  listDossiersQuerySchema,
} from "./dossiers.schema";

export const dossiersRouter = Router();

dossiersRouter.use(requireAuth);

dossiersRouter.get(
  "/",
  validate({ query: listDossiersQuerySchema }),
  asyncHandler(dossiersController.list)
);
dossiersRouter.get(
  "/export",
  validate({ query: exportQuerySchema }),
  asyncHandler(dossiersController.export)
);
dossiersRouter.get(
  "/export-metier",
  validate({ query: exportMetierQuerySchema }),
  asyncHandler(dossiersController.exportMetier)
);
dossiersRouter.get(
  "/:id",
  validate({ params: dossierIdParamSchema }),
  asyncHandler(dossiersController.getById)
);
dossiersRouter.post(
  "/",
  validate({ body: createDossierSchema }),
  asyncHandler(dossiersController.create)
);
