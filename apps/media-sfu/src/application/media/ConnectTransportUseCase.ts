import type { DtlsParameters } from "mediasoup/node/lib/types";
import { ISessionRegistry } from "@/domain/ports/ISessionRegistry";
import { RoomNotFoundError, ParticipantNotFoundError, TransportNotFoundError } from "@/shared/errors/AppErrors";

export interface ConnectTransportDTO {
  roomId: string;
  userId: string;
  transportId: string;
  dtlsParameters: DtlsParameters;
}

export class ConnectTransportUseCase {
  constructor(private readonly sessionRegistry: ISessionRegistry) {}

  public async execute(dto: ConnectTransportDTO): Promise<{ connected: boolean }> {
    const session = this.sessionRegistry.get(dto.roomId);
    if (!session) {
      throw new RoomNotFoundError(`Session ${dto.roomId} not found`);
    }

    const participant = session.getParticipant(dto.userId);
    if (!participant) {
      throw new ParticipantNotFoundError(`Participant ${dto.userId} not found`);
    }

    const transport = participant.getTransport(dto.transportId);
    if (!transport) {
      throw new TransportNotFoundError(`Transport ${dto.transportId} not found`);
    }

    await transport.connect({ dtlsParameters: dto.dtlsParameters });

    return { connected: true };
  }
}
