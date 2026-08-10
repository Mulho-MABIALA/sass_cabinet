import { NextFunction, Request, Response } from "express";
import { AppError } from "../shared/AppError";
import { fail } from "../shared/apiResponse";
import { logger } from "../shared/logger";
import { capturerErreur } from "../shared/sentry";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    // Seules les erreurs serveur (5xx, ex. échec d'un provider externe) sont remontées à Sentry :
    // les erreurs métier attendues (400/401/404...) ne sont pas des incidents à surveiller.
    if (err.statusCode >= 500) {
      capturerErreur(err);
    }
    res.status(err.statusCode).json(fail(err.message, err.details));
    return;
  }

  logger.error("Erreur non gérée", err);
  capturerErreur(err);
  res.status(500).json(fail("Erreur interne du serveur"));
}
