import { ISessionRegistry } from "@/domain/ports/ISessionRegistry";
import { RouterManager } from "@/infrastructure/mediasoup/RouterManager";
import { logger } from "@/shared/logger/Logger";

export interface LeaveSessionDTO {
  roomId: string;
  userId: string;
}

export class LeaveSessionUseCase {
  constructor(
    private readonly sessionRegistry: ISessionRegistry,
    private readonly routerManager: RouterManager
  ) {}

  public execute(dto: LeaveSessionDTO): void {
    const session = this.sessionRegistry.get(dto.roomId);
    if (!session) return;

    const participant = session.getParticipant(dto.userId);
    if (!participant) return;

    // Notify other peers about closed producers
    for (const producer of participant.producers.values()) {
      session.broadcast(
        "producer:closed",
        {
          producerId: producer.id,
          producerUserId: dto.userId,
        },
        dto.userId
      );
    }

    // Remove & close participant
    session.removeParticipant(dto.userId);

    // Notify room of peer leaving
    session.broadcast(
      "peer:left",
      {
        userId: dto.userId,
      },
      dto.userId
    );

    logger.info(`Participant [${dto.userId}] left session [${dto.roomId}]. Remaining: ${session.participants.size}`);

    // If session is empty, auto-clean router and session
    if (session.participants.size === 0) {
      logger.info(`Session [${dto.roomId}] is now empty. Tearing down router and memory state.`);
      this.sessionRegistry.delete(dto.roomId);
      this.routerManager.deleteRouter(dto.roomId);
    }
  }
}
