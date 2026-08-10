import { Request, Response } from "express";
import { portailService } from "./portail.service";
import { ok } from "../../shared/apiResponse";
import { BadRequestError } from "../../shared/AppError";
import { UploadBodyInput } from "./portail.schema";

export const portailController = {
  async getByToken(req: Request, res: Response): Promise<void> {
    const vue = await portailService.getByToken(req.params.token);
    res.status(200).json(ok(vue));
  },

  async upload(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      throw new BadRequestError("Aucun fichier reçu");
    }

    const { documentRequisId } = req.body as UploadBodyInput;
    const vue = await portailService.upload(req.params.token, documentRequisId, req.file);
    res.status(200).json(ok(vue));
  },
};
