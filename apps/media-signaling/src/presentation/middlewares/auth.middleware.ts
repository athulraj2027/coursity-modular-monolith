import { Request, Response, NextFunction } from "express";
import { JwtTokenService } from "@/infrastructure/security/JwtTokenService";
import { UnauthorizedError } from "@/shared/errors/AppErrors";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role?: string;
    email?: string;
    name?: string;
  };
}

const tokenService = new JwtTokenService();

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Bearer authentication token required"));
  }

  const token = authHeader.substring(7);

  try {
    const decoded = tokenService.verifyToken<{
      userId?: string;
      id?: string;
      sub?: string;
      role?: string;
      email?: string;
      name?: string;
    }>(token);

    req.user = {
      userId: decoded.userId || decoded.id || decoded.sub || "anonymous",
      role: decoded.role,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (err) {
    next(new UnauthorizedError(`Authentication failed: ${(err as Error).message}`));
  }
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = tokenService.verifyToken<{
        userId?: string;
        id?: string;
        sub?: string;
        role?: string;
        email?: string;
        name?: string;
      }>(token);

      req.user = {
        userId: decoded.userId || decoded.id || decoded.sub || "anonymous",
        role: decoded.role,
        email: decoded.email,
        name: decoded.name,
      };
    } catch {
      // Ignore invalid token on optional auth
    }
  }

  next();
};
