import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../shared/jwt";
import { UnauthorizedError } from "../shared/AppError";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new UnauthorizedError("Token d'accès manquant");
  }

  const token = header.slice("Bearer ".length);

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    throw new UnauthorizedError("Token d'accès invalide ou expiré");
  }
}
