import type { WebSocket } from "ws";
import type { RtpCapabilities } from "mediasoup/node/lib/types";
import { GetOrCreateSessionUseCase } from "./GetOrCreateSessionUseCase";
import { Participant } from "@/domain/entities/Participant";
import type { JoinSessionResponseData, Role } from "@/shared/types/ws-protocol.types";
import { logger } from "@/shared/logger/Logger";

export interface JoinSessionDTO {
  roomId: string;
  userId: string;
  role: Role;
  displayName?: string;
  rtpCapabilities: RtpCapabilities;
  socket: WebSocket;
}

export class JoinSessionUseCase {
  constructor(private readonly getOrCreateSession: GetOrCreateSessionUseCase) {}

  public async execute(dto: JoinSessionDTO): Promise<JoinSessionResponseData> {
    const session = await this.getOrCreateSession.execute(dto.roomId);

    // If participant already exists in room, close previous connection cleanly
    const existing = session.getParticipant(dto.userId);
    if (existing) {
      existing.close();
      session.removeParticipant(dto.userId);
    }

    const participant = new Participant({
      userId: dto.userId,
      role: dto.role,
      displayName: dto.displayName,
      rtpCapabilities: dto.rtpCapabilities,
      socket: dto.socket,
    });

    session.addParticipant(participant);

    // Broadcast peer:joined to all other participants in the room
    session.broadcast(
      "peer:joined",
      {
        userId: participant.userId,
        role: participant.role,
        displayName: participant.displayName,
        joinedAt: participant.joinedAt.toISOString(),
      },
      dto.userId
    );

    logger.info(
      `Participant [${participant.displayName} (${participant.userId})] joined session [${dto.roomId}] as ${dto.role}`
    );

    const activeProducers = session.getActiveProducers().filter((p) => p.producerUserId !== dto.userId);

    const participants = Array.from(session.participants.values()).map((p) => ({
      userId: p.userId,
      role: p.role,
      displayName: p.displayName,
    }));

    return {
      routerRtpCapabilities: session.router.rtpCapabilities,
      activeProducers,
      participants,
    };
  }
}
