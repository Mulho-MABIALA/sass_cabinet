import { Router } from "express";
import { inscriptionController } from "./inscription.controller";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../shared/asyncHandler";
import { inscriptionSchema } from "./inscription.schema";

export const inscriptionRouter = Router();

// Public (pas de requireAuth) : c'est le point d'entrée self-service pour un nouveau cabinet.
inscriptionRouter.post(
  "/",
  validate({ body: inscriptionSchema }),
  asyncHandler(inscriptionController.inscrire)
);
