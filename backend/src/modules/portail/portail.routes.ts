import { Router } from "express";
import { portailController } from "./portail.controller";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../shared/asyncHandler";
import { tokenParamSchema, uploadBodySchema } from "./portail.schema";
import { uploadMiddleware } from "./portail.upload";

export const portailRouter = Router();

portailRouter.get(
  "/:token",
  validate({ params: tokenParamSchema }),
  asyncHandler(portailController.getByToken)
);

portailRouter.post(
  "/:token/upload",
  uploadMiddleware,
  validate({ params: tokenParamSchema, body: uploadBodySchema }),
  asyncHandler(portailController.upload)
);
