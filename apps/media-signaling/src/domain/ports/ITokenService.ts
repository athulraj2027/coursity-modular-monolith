import { JoinTicketPayload } from "@/shared/types/ws-signaling.types";

export interface ITokenService {
  createJoinToken(payload: Omit<JoinTicketPayload, "exp">, expiresInSeconds?: number): string;
  verifyToken<T = unknown>(token: string): T;
  decodeToken<T = unknown>(token: string): T | null;
}
