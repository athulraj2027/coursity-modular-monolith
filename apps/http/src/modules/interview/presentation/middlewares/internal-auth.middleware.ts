import { Request, Response, NextFunction } from "express";
import { InternalAuthError } from "../../domain/errors/interview.error";

export function internalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const secretHeader = req.headers["x-internal-secret"];
  const authHeader = req.headers["authorization"];

  const expectedSecret =
    process.env.INTERNAL_SERVICE_SECRET ||
    process.env.JWT_SECRET ||
    "coursity_internal_microservice_shared_secret_2026";

  let providedSecret = "";
  if (typeof secretHeader === "string") {
    providedSecret = secretHeader;
  } else if (authHeader && authHeader.startsWith("Bearer ")) {
    providedSecret = authHeader.slice(7).trim();
  }

  if (!providedSecret || providedSecret !== expectedSecret) {
    throw new InternalAuthError(
      "Unauthorized: missing or invalid x-internal-secret header for internal service API"
    );
  }

  next();
}

export default internalAuthMiddleware;
