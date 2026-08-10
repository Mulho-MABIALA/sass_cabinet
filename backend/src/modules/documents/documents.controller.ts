import { Request, Response } from "express";
import { documentsService } from "./documents.service";
import { ok } from "../../shared/apiResponse";
import { UnauthorizedError } from "../../shared/AppError";

export const documentsController = {
  async valider(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const result = await documentsService.valider(req.params.id, req.user.cabinetId);
    res.status(200).json(ok(result));
  },

  async refuser(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const result = await documentsService.refuser(req.params.id, req.user.cabinetId);
    res.status(200).json(ok(result));
  },

  async envoyerPourSignature(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const result = await documentsService.envoyerPourSignature(req.params.id, req.user.cabinetId);
    res.status(200).json(ok(result));
  },
};
