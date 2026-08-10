import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";
import { BadRequestError } from "../shared/AppError";

interface ValidationSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        throw new BadRequestError("Corps de requête invalide", result.error.flatten());
      }
      req.body = result.data;
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        throw new BadRequestError("Paramètres de route invalides", result.error.flatten());
      }
      req.params = result.data as typeof req.params;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        throw new BadRequestError("Paramètres de requête invalides", result.error.flatten());
      }
      req.query = result.data as typeof req.query;
    }

    next();
  };
}
