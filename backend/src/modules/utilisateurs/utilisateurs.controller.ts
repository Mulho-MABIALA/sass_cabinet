import { Request, Response } from "express";
import { utilisateursService } from "./utilisateurs.service";
import { ok } from "../../shared/apiResponse";
import { CreateUtilisateurInput } from "./utilisateurs.schema";
import { UnauthorizedError } from "../../shared/AppError";

export const utilisateursController = {
  async list(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const utilisateurs = await utilisateursService.list(req.user.cabinetId);
    res.status(200).json(ok(utilisateurs));
  },

  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const utilisateur = await utilisateursService.create(
      req.user.cabinetId,
      req.body as CreateUtilisateurInput
    );
    res.status(201).json(ok(utilisateur));
  },
};
