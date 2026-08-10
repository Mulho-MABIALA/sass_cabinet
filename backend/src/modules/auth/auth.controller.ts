import { Request, Response } from "express";
import { authService } from "./auth.service";
import { ok } from "../../shared/apiResponse";
import { LoginInput, RefreshInput } from "./auth.schema";

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    const tokens = await authService.login(req.body as LoginInput);
    res.status(200).json(ok(tokens));
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const tokens = await authService.refresh(req.body as RefreshInput);
    res.status(200).json(ok(tokens));
  },
};
