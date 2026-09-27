import { ISessionRegistry } from "@/domain/ports/ISessionRegistry";
import { RoomNotFoundError, ParticipantNotFoundError, ProducerNotFoundError } from "@/shared/errors/AppErrors";

export interface CloseProducerDTO {
  roomId: string;
  userId: string;
  producerId: string;
}

export class CloseProducerUseCase {
  constructor(private readonly sessionRegistry: ISessionRegistry) {}

  public execute(dto: CloseProducerDTO): { closed: boolean } {
    const session = this.sessionRegistry.get(dto.roomId);
    if (!session) {
      throw new RoomNotFoundError(`Session ${dto.roomId} not found`);
    }

    const participant = session.getParticipant(dto.userId);
    if (!participant) {
      throw new ParticipantNotFoundError(`Participant ${dto.userId} not found`);
    }

    const producer = participant.getProducer(dto.producerId);
    if (!producer) {
      throw new ProducerNotFoundError(`Producer ${dto.producerId} not found on user`);
    }

    participant.removeProducer(dto.producerId);

    session.broadcast(
      "producer:closed",
      {
        producerId: dto.producerId,
        producerUserId: dto.userId,
      },
      dto.userId
    );

    return { closed: true };
  }
}
