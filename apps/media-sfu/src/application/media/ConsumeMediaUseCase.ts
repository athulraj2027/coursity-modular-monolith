import type { RtpCapabilities } from "mediasoup/node/lib/types";
import { ISessionRegistry } from "@/domain/ports/ISessionRegistry";
import {
  RoomNotFoundError,
  ParticipantNotFoundError,
  TransportNotFoundError,
  ProducerNotFoundError,
  MediaNegotiationError,
} from "@/shared/errors/AppErrors";
import type { ConsumeMediaResponseData } from "@/shared/types/ws-protocol.types";
import { logger } from "@/shared/logger/Logger";

export interface ConsumeMediaDTO {
  roomId: string;
  userId: string;
  transportId: string;
  producerId: string;
  rtpCapabilities: RtpCapabilities;
}

export class ConsumeMediaUseCase {
  constructor(private readonly sessionRegistry: ISessionRegistry) {}

  public async execute(dto: ConsumeMediaDTO): Promise<ConsumeMediaResponseData> {
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
      throw new TransportNotFoundError(`Receive transport ${dto.transportId} not found`);
    }

    const producerInfo = session.findProducer(dto.producerId);
    if (!producerInfo) {
      throw new ProducerNotFoundError(`Producer ${dto.producerId} not found in room`);
    }

    // Check if client device RTP capabilities can consume this producer
    const canConsume = session.router.canConsume({
      producerId: dto.producerId,
      rtpCapabilities: dto.rtpCapabilities,
    });

    if (!canConsume) {
      throw new MediaNegotiationError(
        `Client RTP capabilities cannot consume producer ${dto.producerId} (${producerInfo.producer.kind})`
      );
    }

    // Create consumer in paused state first (mediasoup standard practice)
    const consumer = await transport.consume({
      producerId: dto.producerId,
      rtpCapabilities: dto.rtpCapabilities,
      paused: true,
      appData: {
        ownerUserId: dto.userId,
        producerUserId: producerInfo.ownerUserId,
      },
    });

    participant.addConsumer(consumer);

    consumer.on("transportclose", () => {
      participant.removeConsumer(consumer.id);
    });

    consumer.on("producerclose", () => {
      participant.removeConsumer(consumer.id);
      participant.sendNotification("consumer:closed", {
        consumerId: consumer.id,
        producerId: dto.producerId,
      });
    });

    consumer.on("producerpause", () => {
      participant.sendNotification("consumer:paused", {
        consumerId: consumer.id,
      });
    });

    consumer.on("producerresume", () => {
      participant.sendNotification("consumer:resumed", {
        consumerId: consumer.id,
      });
    });

    logger.debug(
      `Consumer created [id:${consumer.id}, kind:${consumer.kind}] for user [${dto.userId}] on producer [${dto.producerId}]`
    );

    return {
      consumerId: consumer.id,
      producerId: dto.producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    };
  }
}
