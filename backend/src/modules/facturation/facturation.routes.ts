import { Router } from "express";
import { facturationController } from "./facturation.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../shared/asyncHandler";
import { checkoutSchema } from "./facturation.schema";

export const facturationRouter = Router();

// Note : la route POST /facturation/webhook (appelée par Stripe, corps brut) est montée séparément
// dans app.ts, en amont de ce routeur et du parseur JSON global.

facturationRouter.use(requireAuth);

facturationRouter.get("/usage", asyncHandler(facturationController.getUsage));
facturationRouter.post(
  "/checkout",
  requireRole("admin"),
  validate({ body: checkoutSchema }),
  asyncHandler(facturationController.creerCheckout)
);
facturationRouter.post("/portail", requireRole("admin"), asyncHandler(facturationController.creerPortail));
