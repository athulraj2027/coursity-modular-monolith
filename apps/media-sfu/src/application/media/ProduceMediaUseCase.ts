import type { MediaKind, RtpParameters } from "mediasoup/node/lib/types";
import { ISessionRegistry } from "@/domain/ports/ISessionRegistry";
import {
  RoomNotFoundError,
  ParticipantNotFoundError,
  TransportNotFoundError,
  ForbiddenError,
} from "@/shared/errors/AppErrors";
import { logger } from "@/shared/logger/Logger";

export interface ProduceMediaDTO {
  roomId: string;
  userId: string;
  transportId: string;
  kind: MediaKind;
  rtpParameters: RtpParameters;
  appData?: Record<string, unknown>;
}

export class ProduceMediaUseCase {
  constructor(private readonly sessionRegistry: ISessionRegistry) {}

  public async execute(dto: ProduceMediaDTO): Promise<{ producerId: string }> {
    const session = this.sessionRegistry.get(dto.roomId);
    if (!session) {
      throw new RoomNotFoundError(`Session ${dto.roomId} not found`);
    }

    const participant = session.getParticipant(dto.userId);
    if (!participant) {
      throw new ParticipantNotFoundError(`Participant ${dto.userId} not found`);
    }

    // Broadcast permission validation:
    // Students/viewers are not permitted to stream audio/video
    if (dto.kind === "audio" && !participant.canProduceAudio) {
      throw new ForbiddenError(
        `Participant [${participant.displayName} (${participant.role})] is not authorized to publish audio streams.`
      );
    }

    const isScreenShare = dto.appData?.shareScreen === true || dto.appData?.source === "screen";
    if (dto.kind === "video") {
      if (isScreenShare && !participant.canProduceScreen) {
        throw new ForbiddenError(
          `Participant [${participant.displayName} (${participant.role})] is not authorized to share screen.`
        );
      } else if (!isScreenShare && !participant.canProduceVideo) {
        throw new ForbiddenError(
          `Participant [${participant.displayName} (${participant.role})] is not authorized to publish video streams.`
        );
      }
    }

    const transport = participant.getTransport(dto.transportId);
    if (!transport) {
      throw new TransportNotFoundError(`Transport ${dto.transportId} not found`);
    }

    const producer = await transport.produce({
      kind: dto.kind,
      rtpParameters: dto.rtpParameters,
      appData: {
        ...dto.appData,
        ownerUserId: dto.userId,
      },
    });

    participant.addProducer(producer);

    logger.info(
      `Producer created [id:${producer.id}, kind:${producer.kind}] by user [${dto.userId}] in room [${dto.roomId}]`
    );

    // Broadcast producer:available to all other participants in the room
    session.broadcast(
      "producer:available",
      {
        producerId: producer.id,
        producerUserId: dto.userId,
        kind: producer.kind,
        appData: producer.appData,
      },
      dto.userId
    );

    producer.observer.on("close", () => {
      logger.info(`Producer [${producer.id}] closed.`);
      session.broadcast(
        "producer:closed",
        {
          producerId: producer.id,
          producerUserId: dto.userId,
        },
        dto.userId
      );
    });

    return { producerId: producer.id };
  }
}
