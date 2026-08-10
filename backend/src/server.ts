import { initSentry } from "./shared/sentry";
import { createApp } from "./app";
import { env } from "./config/env";
import { demarrerJobRelances } from "./modules/relances/relances.job";
import { demarrerJobRgpd } from "./modules/rgpd/rgpd.job";
import { logger } from "./shared/logger";
import { verifierConnexionSmtp } from "./shared/mailer";

// Doit être initialisé avant la création de l'app pour capturer les erreurs dès le démarrage.
initSentry();

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`Serveur backend démarré sur le port ${env.PORT}`);
  demarrerJobRelances();
  demarrerJobRgpd();
  void verifierConnexionSmtp();
});
