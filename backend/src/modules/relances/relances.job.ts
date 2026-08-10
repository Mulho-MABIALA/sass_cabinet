import cron from "node-cron";
import { relancesService } from "./relances.service";
import { env } from "../../config/env";
import { logger } from "../../shared/logger";

export function demarrerJobRelances(): void {
  cron.schedule(env.RELANCE_CRON_EXPRESSION, () => {
    logger.info("Démarrage du job de relances automatiques");
    relancesService.executerRelancesAutomatiques().catch((error) => {
      logger.error("Erreur lors de l'exécution du job de relances", error);
    });
  });

  logger.info(`Job de relances planifié (cron: ${env.RELANCE_CRON_EXPRESSION})`);
}
