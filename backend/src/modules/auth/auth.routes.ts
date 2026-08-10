import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../shared/asyncHandler";
import { loginSchema, refreshSchema } from "./auth.schema";

export const authRouter = Router();

authRouter.post("/login", validate({ body: loginSchema }), asyncHandler(authController.login));
authRouter.post(
  "/refresh",
  validate({ body: refreshSchema }),
  asyncHandler(authController.refresh)
);
