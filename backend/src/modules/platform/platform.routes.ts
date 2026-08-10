import { Router } from "express";
import { platformController } from "./platform.controller";
import { requirePlatformAuth } from "../../middlewares/platformAuth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../shared/asyncHandler";
import { cabinetIdParamSchema, platformLoginSchema, updateCabinetSchema } from "./platform.schema";

export const platformRouter = Router();

// Public : point d'entrée de la console super-admin.
platformRouter.post(
  "/login",
  validate({ body: platformLoginSchema }),
  asyncHandler(platformController.login)
);

// Tout le reste exige un token plateforme (voir requirePlatformAuth) — jamais un token cabinet.
platformRouter.get(
  "/cabinets",
  requirePlatformAuth,
  asyncHandler(platformController.listCabinets)
);
platformRouter.get(
  "/cabinets/:id",
  requirePlatformAuth,
  validate({ params: cabinetIdParamSchema }),
  asyncHandler(platformController.getCabinet)
);
platformRouter.patch(
  "/cabinets/:id",
  requirePlatformAuth,
  validate({ params: cabinetIdParamSchema, body: updateCabinetSchema }),
  asyncHandler(platformController.updateCabinet)
);
