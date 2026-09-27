import jwt from "jsonwebtoken";
import type { WebSocket } from "ws";
import { JoinSessionUseCase } from "@/application/session/JoinSessionUseCase";
import { LeaveSessionUseCase } from "@/application/session/LeaveSessionUseCase";
import { env } from "@/config/env";
import { UnauthorizedError } from "@/shared/errors/AppErrors";
import type {
  JoinSessionRequestData,
  JoinSessionResponseData,
  JoinTicketPayload,
} from "@/shared/types/ws-protocol.types";

export class SessionHandler {
  constructor(
    private readonly joinSessionUseCase: JoinSessionUseCase,
    private readonly leaveSessionUseCase: LeaveSessionUseCase
  ) {}

  public async handleJoin(
    socket: WebSocket,
    data: JoinSessionRequestData
  ): Promise<{ response: JoinSessionResponseData; sessionContext: { roomId: string; userId: string } }> {
    let payload: JoinTicketPayload;
    try {
      payload = jwt.verify(data.joinToken, env.JWT_SECRET) as JoinTicketPayload;
    } catch {
      throw new UnauthorizedError("Invalid or expired join token");
    }

    const response = await this.joinSessionUseCase.execute({
      roomId: payload.classSessionId,
      userId: payload.userId,
      role: payload.role,
      displayName: payload.displayName,
      rtpCapabilities: data.rtpCapabilities,
      socket,
    });

    return {
      response,
      sessionContext: {
        roomId: payload.classSessionId,
        userId: payload.userId,
      },
    };
  }

  public handleLeave(roomId: string, userId: string): void {
    this.leaveSessionUseCase.execute({ roomId, userId });
  }
}
