import { Role } from "@prisma/client";
import { prisma } from "../../config/prisma";

export interface CreateInvitationData {
  cabinetId: string;
  email: string;
  role: Role;
  expiresAt: Date;
}

export const invitationsRepository = {
  create(data: CreateInvitationData) {
    return prisma.invitationUtilisateur.create({ data });
  },

  findPendingByCabinetAndEmail(cabinetId: string, email: string) {
    return prisma.invitationUtilisateur.findFirst({
      where: { cabinetId, email, accepteeLe: null, expiresAt: { gt: new Date() } },
    });
  },

  findByToken(token: string) {
    return prisma.invitationUtilisateur.findUnique({
      where: { token },
      include: { cabinet: { select: { nom: true } } },
    });
  },

  marquerAcceptee(id: string) {
    return prisma.invitationUtilisateur.update({
      where: { id },
      data: { accepteeLe: new Date() },
    });
  },

  findCabinetNom(cabinetId: string) {
    return prisma.cabinet.findUnique({ where: { id: cabinetId }, select: { nom: true } });
  },
};
