import { Router } from "express";
import { invitationsController } from "./invitations.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../shared/asyncHandler";
import {
  accepterInvitationSchema,
  inviterSchema,
  tokenParamSchema,
} from "./invitations.schema";

export const invitationsRouter = Router();

// Réservé aux admins d'un cabinet : inviter un nouveau membre.
invitationsRouter.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validate({ body: inviterSchema }),
  asyncHandler(invitationsController.inviter)
);

// Public : l'invité consulte puis accepte son invitation, sans être connecté au préalable.
invitationsRouter.get(
  "/:token",
  validate({ params: tokenParamSchema }),
  asyncHandler(invitationsController.getInvitation)
);
invitationsRouter.post(
  "/:token/accepter",
  validate({ params: tokenParamSchema, body: accepterInvitationSchema }),
  asyncHandler(invitationsController.accepter)
);
