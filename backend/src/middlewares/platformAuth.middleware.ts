import { NextFunction, Request, Response } from "express";
import { verifyPlatformAccessToken } from "../shared/jwt";
import { UnauthorizedError } from "../shared/AppError";

// Distinct de requireAuth (routes cabinet) : vérifie un token signé avec PLATFORM_JWT_SECRET,
// jamais accepté par requireAuth et vice-versa — les deux univers d'authentification sont étanches.
export function requirePlatformAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new UnauthorizedError("Token d'accès plateforme manquant");
  }

  const token = header.slice("Bearer ".length);

  try {
    req.platformAdmin = verifyPlatformAccessToken(token);
    next();
  } catch {
    throw new UnauthorizedError("Token d'accès plateforme invalide ou expiré");
  }
}
