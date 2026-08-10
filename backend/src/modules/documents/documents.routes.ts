import { Router } from "express";
import { documentsController } from "./documents.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../shared/asyncHandler";
import { documentIdParamSchema } from "./documents.schema";

export const documentsRouter = Router();

documentsRouter.use(requireAuth);

documentsRouter.patch(
  "/:id/valider",
  validate({ params: documentIdParamSchema }),
  asyncHandler(documentsController.valider)
);
documentsRouter.patch(
  "/:id/refuser",
  validate({ params: documentIdParamSchema }),
  asyncHandler(documentsController.refuser)
);
documentsRouter.post(
  "/:id/signature",
  validate({ params: documentIdParamSchema }),
  asyncHandler(documentsController.envoyerPourSignature)
);
