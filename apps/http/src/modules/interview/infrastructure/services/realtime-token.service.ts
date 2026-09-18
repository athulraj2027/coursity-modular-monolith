import jwt from "jsonwebtoken";
import { RealtimeTokenDto } from "../../domain/dtos/candidate-interview.dto";

export class RealtimeTokenService {
  private readonly secret: string;

  constructor() {
    this.secret =
      process.env.LIVEKIT_API_SECRET ||
      process.env.JWT_SECRET ||
      "super_secret_interview_realtime_token_key";
  }

  generateToken(params: {
    sessionId: string;
    userId: string;
    userName: string;
    role: "candidate" | "admin" | "ai_service";
    expiresInSeconds?: number;
  }): RealtimeTokenDto {
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
