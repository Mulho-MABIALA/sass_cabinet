import { Request, Response } from "express";
import { relancesService } from "./relances.service";
import { ok } from "../../shared/apiResponse";
import { UnauthorizedError } from "../../shared/AppError";

export const relancesController = {
  async relancerManuellement(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const result = await relancesService.relancerManuellement(req.params.id, req.user.cabinetId);
    res.status(200).json(ok(result));
  },
};
