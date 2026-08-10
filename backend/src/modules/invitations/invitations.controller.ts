import { Request, Response } from "express";
import { invitationsService } from "./invitations.service";
import { ok } from "../../shared/apiResponse";
import { UnauthorizedError } from "../../shared/AppError";
import { AccepterInvitationInput, InviterInput } from "./invitations.schema";

export const invitationsController = {
  async inviter(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const invitation = await invitationsService.inviter(
      req.user.cabinetId,
      req.body as InviterInput
    );
    res.status(201).json(ok(invitation));
  },

  async getInvitation(req: Request, res: Response): Promise<void> {
    const invitation = await invitationsService.getInvitation(req.params.token);
    res.status(200).json(ok(invitation));
  },

  async accepter(req: Request, res: Response): Promise<void> {
    const tokens = await invitationsService.accepter(
      req.params.token,
      req.body as AccepterInvitationInput
    );
    res.status(200).json(ok(tokens));
  },
};
