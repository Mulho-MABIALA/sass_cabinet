import { Request, Response } from "express";
import { webhooksService } from "./webhooks.service";
import { ok } from "../../shared/apiResponse";
import { UnauthorizedError } from "../../shared/AppError";
import { CreateWebhookInput, UpdateWebhookInput } from "./webhooks.schema";

export const webhooksController = {
  async list(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const webhooks = await webhooksService.list(req.user.cabinetId);
    res.status(200).json(ok(webhooks));
  },

  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const webhook = await webhooksService.create(req.user.cabinetId, req.body as CreateWebhookInput);
    res.status(201).json(ok(webhook));
  },

  async update(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const webhook = await webhooksService.update(
      req.params.id,
      req.user.cabinetId,
      req.body as UpdateWebhookInput
    );
    res.status(200).json(ok(webhook));
  },

  async remove(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    await webhooksService.remove(req.params.id, req.user.cabinetId);
    // 200 + enveloppe JSON (plutôt que 204 sans corps) pour rester cohérent avec le client frontend,
    // qui attend systématiquement une enveloppe { success, data }.
    res.status(200).json(ok({ id: req.params.id }));
  },
};
