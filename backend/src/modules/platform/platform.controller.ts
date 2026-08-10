import { Request, Response } from "express";
import { platformService } from "./platform.service";
import { ok } from "../../shared/apiResponse";
import { PlatformLoginInput, UpdateCabinetInput } from "./platform.schema";

export const platformController = {
  async login(req: Request, res: Response): Promise<void> {
    const resultat = await platformService.login(req.body as PlatformLoginInput);
    res.status(200).json(ok(resultat));
  },

  async listCabinets(_req: Request, res: Response): Promise<void> {
    const cabinets = await platformService.listCabinets();
    res.status(200).json(ok(cabinets));
  },

  async getCabinet(req: Request, res: Response): Promise<void> {
    const cabinet = await platformService.getCabinet(req.params.id);
    res.status(200).json(ok(cabinet));
  },

  async updateCabinet(req: Request, res: Response): Promise<void> {
    const cabinet = await platformService.updateCabinet(
      req.params.id,
      req.body as UpdateCabinetInput
    );
    res.status(200).json(ok(cabinet));
  },
};
