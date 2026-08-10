import { Router } from "express";
import { webhooksController } from "./webhooks.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../shared/asyncHandler";
import { createWebhookSchema, updateWebhookSchema, webhookIdParamSchema } from "./webhooks.schema";

export const webhooksRouter = Router();

webhooksRouter.use(requireAuth);

webhooksRouter.get("/", asyncHandler(webhooksController.list));
webhooksRouter.post(
  "/",
  validate({ body: createWebhookSchema }),
  asyncHandler(webhooksController.create)
);
webhooksRouter.patch(
  "/:id",
  validate({ params: webhookIdParamSchema, body: updateWebhookSchema }),
  asyncHandler(webhooksController.update)
);
webhooksRouter.delete(
  "/:id",
  validate({ params: webhookIdParamSchema }),
  asyncHandler(webhooksController.remove)
);
