import jwt from "jsonwebtoken";
import { ITokenService } from "@/domain/ports/ITokenService";
import { JoinTicketPayload } from "@/shared/types/ws-signaling.types";
import { env } from "@/config/env";
import { UnauthorizedError } from "@/shared/errors/AppErrors";

export class JwtTokenService implements ITokenService {
  private readonly secret = env.JWT_SECRET;

  public createJoinToken(
    payload: Omit<JoinTicketPayload, "exp">,
    expiresInSeconds: number = env.JOIN_TOKEN_EXPIRES_IN_SECONDS
  ): string {
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const ticket: JoinTicketPayload = {
      ...payload,
      exp,
    };

    return jwt.sign(ticket, this.secret, {
      algorithm: "HS256",
      expiresIn: expiresInSeconds,
    });
  }

  public verifyToken<T = unknown>(token: string): T {
    try {
      return jwt.verify(token, this.secret) as T;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid token";
      throw new UnauthorizedError(`Token verification failed: ${msg}`);
    }
  }

  public decodeToken<T = unknown>(token: string): T | null {
    try {
      return jwt.decode(token) as T | null;
    } catch {
      return null;
    }
  }
}
