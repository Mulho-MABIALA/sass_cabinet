import { Request, Response } from "express";
import { inscriptionService } from "./inscription.service";
import { ok } from "../../shared/apiResponse";
import { InscriptionInput } from "./inscription.schema";

export const inscriptionController = {
  async inscrire(req: Request, res: Response): Promise<void> {
    const tokens = await inscriptionService.inscrire(req.body as InscriptionInput);
    res.status(201).json(ok(tokens));
  },
};
