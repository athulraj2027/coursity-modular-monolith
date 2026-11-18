import jwt from "jsonwebtoken";
import { RealtimeTokenDto } from "../../domain/dtos/candidate-interview.dto";
import {
  GenerateTokenParams,
  IRealtimeTokenService,
} from "../../domain/services/realtime-token.service.interface";

export class RealtimeTokenService implements IRealtimeTokenService {
  private readonly secret: string;

  constructor(secret?: string) {
    this.secret =
      secret ||
      process.env.LIVEKIT_API_SECRET ||
      process.env.JWT_SECRET ||
      "super_secret_interview_realtime_token_key";
  }

  generateToken(params: GenerateTokenParams): RealtimeTokenDto {
    const expiresIn = params.expiresInSeconds || 3600; // 1 hour
    const roomName = `interview-room-${params.sessionId}`;
    const participantIdentity = `${params.role}_${params.userId}`;

    const payload = {
      sub: params.userId,
      name: params.userName,
      room: roomName,
      identity: participantIdentity,
      role: params.role,
      sessionId: params.sessionId,
      video: {
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      },
    };

    const token = jwt.sign(payload, this.secret, {
      expiresIn: `${expiresIn}s`,
    });

    return {
      sessionId: params.sessionId,
      userId: params.userId,
      userName: params.userName,
      roomName,
      participantIdentity,
      token,
      expiresIn,
    };
  }
}
