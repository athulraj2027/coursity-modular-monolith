import { ISessionRegistry } from "@/domain/ports/ISessionRegistry";
import { TransportFactory } from "@/infrastructure/mediasoup/TransportFactory";
import { RoomNotFoundError, ParticipantNotFoundError } from "@/shared/errors/AppErrors";
import type { CreateTransportResponseData, TransportDirection } from "@/shared/types/ws-protocol.types";

export interface CreateWebRtcTransportDTO {
  roomId: string;
  userId: string;
  direction: TransportDirection;
}

export class CreateWebRtcTransportUseCase {
  constructor(private readonly sessionRegistry: ISessionRegistry) {}

  public async execute(dto: CreateWebRtcTransportDTO): Promise<CreateTransportResponseData> {
    const session = this.sessionRegistry.get(dto.roomId);
    if (!session) {
      throw new RoomNotFoundError(`Session ${dto.roomId} does not exist`);
    }

    const participant = session.getParticipant(dto.userId);
    if (!participant) {
      throw new ParticipantNotFoundError(`Participant ${dto.userId} not found in session`);
    }

    const transport = await TransportFactory.createWebRtcTransport(session.router, {
      direction: dto.direction,
      enableSctp: false,
    });

    participant.addTransport(transport);

    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
      sctpParameters: transport.sctpParameters,
    };
  }
}
