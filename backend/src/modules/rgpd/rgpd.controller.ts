import { Request, Response } from "express";
import { rgpdService } from "./rgpd.service";
import { ok } from "../../shared/apiResponse";
import { UnauthorizedError } from "../../shared/AppError";

export const rgpdController = {
  async effacerDossier(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const result = await rgpdService.effacerDossier(req.params.id, req.user.cabinetId);
    res.status(200).json(ok(result));
  },
};
