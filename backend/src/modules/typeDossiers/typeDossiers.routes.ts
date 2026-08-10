import { Router } from "express";
import { typeDossiersController } from "./typeDossiers.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../shared/asyncHandler";
import { createTypeDossierSchema, typeDossierIdParamSchema } from "./typeDossiers.schema";

export const typeDossiersRouter = Router();

typeDossiersRouter.use(requireAuth);

typeDossiersRouter.get("/", asyncHandler(typeDossiersController.list));
typeDossiersRouter.get(
  "/:id",
  validate({ params: typeDossierIdParamSchema }),
  asyncHandler(typeDossiersController.getById)
);
typeDossiersRouter.post(
  "/",
  requireRole("admin"),
  validate({ body: createTypeDossierSchema }),
  asyncHandler(typeDossiersController.create)
);
