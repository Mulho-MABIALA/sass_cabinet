import { Prisma, WebhookConfig } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const webhooksRepository = {
  findByCabinet(cabinetId: string): Promise<WebhookConfig[]> {
    return prisma.webhookConfig.findMany({
      where: { cabinetId },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string, cabinetId: string): Promise<WebhookConfig | null> {
    return prisma.webhookConfig.findFirst({ where: { id, cabinetId } });
  },

  create(data: {
    cabinetId: string;
    url: string;
    evenement: string;
    actif: boolean;
  }): Promise<WebhookConfig> {
    return prisma.webhookConfig.create({ data });
  },

  update(id: string, data: Prisma.WebhookConfigUpdateInput): Promise<WebhookConfig> {
    return prisma.webhookConfig.update({ where: { id }, data });
  },

  delete(id: string): Promise<void> {
    return prisma.webhookConfig.delete({ where: { id } }).then(() => undefined);
  },

  findActifsPourEvenement(cabinetId: string, evenement: string): Promise<WebhookConfig[]> {
    return prisma.webhookConfig.findMany({
      where: { cabinetId, evenement, actif: true },
    });
  },
};
