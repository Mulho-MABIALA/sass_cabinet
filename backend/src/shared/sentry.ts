import * as Sentry from "@sentry/node";
import { env } from "../config/env";
import { logger } from "./logger";

// Monitoring erreurs (Sentry, palier gratuit) — no-op si SENTRY_DSN absent, pour ne pas bloquer
// le développement local sans compte Sentry (même principe que les autres intégrations optionnelles).
export function initSentry(): void {
  if (!env.SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    // Pas de traçage de performance (payant au-delà d'un quota réduit) : uniquement la capture d'erreurs,
    // qui reste dans le palier gratuit.
    tracesSampleRate: 0,
  });

  logger.info("Sentry initialisé");
}

export function capturerErreur(err: unknown): void {
  if (!env.SENTRY_DSN) {
    return;
  }
  Sentry.captureException(err);
}
