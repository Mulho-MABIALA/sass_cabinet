import { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../shared/AppError";

export function requireRole(...roles: Array<"admin" | "collaborateur">) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError("Rôle insuffisant pour cette action");
    }

    next();
  };
}
