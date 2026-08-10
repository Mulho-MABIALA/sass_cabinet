import { Request, Response } from "express";
import { facturationService } from "./facturation.service";
import { ok } from "../../shared/apiResponse";
import { BadRequestError, UnauthorizedError } from "../../shared/AppError";
import { logger } from "../../shared/logger";

export const facturationController = {
  async getUsage(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const usage = await facturationService.getUsage(req.user.cabinetId);
    res.status(200).json(ok(usage));
  },

  async creerCheckout(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const session = await facturationService.creerSessionCheckout(
      req.user.cabinetId,
      req.user.userId,
      req.body.plan
    );
    res.status(200).json(ok(session));
  },

  async creerPortail(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const session = await facturationService.creerSessionPortail(req.user.cabinetId);
    res.status(200).json(ok(session));
  },

  // Route publique appelée par Stripe (pas par le frontend) : le corps est le buffer brut (voir app.ts,
  // express.raw() spécifique à cette route) et la signature est vérifiée avant tout traitement.
  async webhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers["stripe-signature"];
    if (typeof signature !== "string") {
      throw new BadRequestError("Signature Stripe manquante");
    }

    try {
      await facturationService.traiterWebhook(req.body, signature);
    } catch (error) {
      logger.error("Webhook Stripe : échec de traitement", error);
      throw new BadRequestError("Webhook invalide");
    }

    res.status(200).json(ok({ recu: true }));
  },
};
