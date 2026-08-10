import { Request, Response } from "express";
import { typeDossiersService } from "./typeDossiers.service";
import { ok } from "../../shared/apiResponse";
import { CreateTypeDossierInput } from "./typeDossiers.schema";
import { UnauthorizedError } from "../../shared/AppError";

export const typeDossiersController = {
  async list(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const typeDossiers = await typeDossiersService.list(req.user.cabinetId);
    res.status(200).json(ok(typeDossiers));
  },

  async getById(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const typeDossier = await typeDossiersService.getById(req.params.id, req.user.cabinetId);
    res.status(200).json(ok(typeDossier));
  },

  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const typeDossier = await typeDossiersService.create(
      req.user.cabinetId,
      req.body as CreateTypeDossierInput
    );
    res.status(201).json(ok(typeDossier));
  },
};
