import { Router } from "express";
import { utilisateursController } from "./utilisateurs.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../shared/asyncHandler";
import { createUtilisateurSchema } from "./utilisateurs.schema";

export const utilisateursRouter = Router();

utilisateursRouter.use(requireAuth, requireRole("admin"));

utilisateursRouter.get("/", asyncHandler(utilisateursController.list));
utilisateursRouter.post(
  "/",
  validate({ body: createUtilisateurSchema }),
  asyncHandler(utilisateursController.create)
);
