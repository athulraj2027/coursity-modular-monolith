import { ISessionRegistry } from "@/domain/ports/ISessionRegistry";
import { RoomNotFoundError, ParticipantNotFoundError, NotFoundError } from "@/shared/errors/AppErrors";

export interface ResumeConsumerDTO {
  roomId: string;
  userId: string;
  consumerId: string;
}

export class ResumeConsumerUseCase {
  constructor(private readonly sessionRegistry: ISessionRegistry) {}

  public async execute(dto: ResumeConsumerDTO): Promise<{ resumed: boolean }> {
    const session = this.sessionRegistry.get(dto.roomId);
    if (!session) {
      throw new RoomNotFoundError(`Session ${dto.roomId} not found`);
    }

    const participant = session.getParticipant(dto.userId);
    if (!participant) {
      throw new ParticipantNotFoundError(`Participant ${dto.userId} not found`);
    }

    const consumer = participant.getConsumer(dto.consumerId);
    if (!consumer) {
      throw new NotFoundError(`Consumer ${dto.consumerId} not found`);
    }

    await consumer.resume();

    return { resumed: true };
  }
}
