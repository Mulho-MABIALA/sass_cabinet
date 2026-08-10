import cron from "node-cron";
import { rgpdService } from "./rgpd.service";
import { env } from "../../config/env";
import { logger } from "../../shared/logger";

export function demarrerJobRgpd(): void {
  cron.schedule(env.RGPD_CRON_EXPRESSION, () => {
    logger.info("Démarrage du job de purge RGPD");
    rgpdService.executerPurgeAutomatique().catch((error) => {
      logger.error("Erreur lors de l'exécution du job de purge RGPD", error);
    });
  });

  logger.info(`Job de purge RGPD planifié (cron: ${env.RGPD_CRON_EXPRESSION})`);
}
