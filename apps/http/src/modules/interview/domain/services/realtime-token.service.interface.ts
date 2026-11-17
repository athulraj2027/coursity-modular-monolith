import { RealtimeTokenDto } from "../dtos/candidate-interview.dto";

export interface GenerateTokenParams {
  sessionId: string;
  userId: string;
  userName: string;
  role: "candidate" | "admin" | "ai_service";
  expiresInSeconds?: number;
}

/**
 * Domain Service interface for minting real-time WebRTC / LiveKit tokens
 */
export interface IRealtimeTokenService {
  generateToken(params: GenerateTokenParams): RealtimeTokenDto;
}
