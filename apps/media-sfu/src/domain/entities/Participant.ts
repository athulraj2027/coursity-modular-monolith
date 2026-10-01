import type {
  WebRtcTransport,
  Producer,
  Consumer,
  RtpCapabilities,
} from "mediasoup/node/lib/types";
import type { WebSocket } from "ws";
import type { Role } from "@/shared/types/ws-protocol.types";

export interface ParticipantProps {
  userId: string;
  role: Role;
  displayName?: string;
  rtpCapabilities?: RtpCapabilities;
  socket: WebSocket;
  canProduceAudio?: boolean;
  canProduceVideo?: boolean;
  canProduceScreen?: boolean;
  canConsume?: boolean;
}

export class Participant {
  public readonly userId: string;
  public readonly role: Role;
  public readonly displayName: string;
  public readonly joinedAt: Date;
  public rtpCapabilities?: RtpCapabilities;
  public socket: WebSocket;
  public readonly canProduceAudio: boolean;
  public readonly canProduceVideo: boolean;
  public readonly canProduceScreen: boolean;
  public readonly canConsume: boolean;

  // Mediasoup objects owned by this participant
  public readonly transports = new Map<string, WebRtcTransport>();
  public readonly producers = new Map<string, Producer>();
  public readonly consumers = new Map<string, Consumer>();

  constructor(props: ParticipantProps) {
    this.userId = props.userId;
    this.role = props.role;
    this.displayName = props.displayName || `User-${props.userId.substring(0, 6)}`;
    this.rtpCapabilities = props.rtpCapabilities;
    this.socket = props.socket;
    this.canProduceAudio = props.canProduceAudio ?? (props.role === "TEACHER" || props.role === "ADMIN");
    this.canProduceVideo = props.canProduceVideo ?? (props.role === "TEACHER" || props.role === "ADMIN");
    this.canProduceScreen = props.canProduceScreen ?? (props.role === "TEACHER" || props.role === "ADMIN");
    this.canConsume = props.canConsume ?? true;
    this.joinedAt = new Date();
  }

  public canPublishMedia(): boolean {
    return this.canProduceAudio || this.canProduceVideo || this.canProduceScreen;
  }

  public addTransport(transport: WebRtcTransport): void {
    this.transports.set(transport.id, transport);
  }

  public getTransport(transportId: string): WebRtcTransport | undefined {
    return this.transports.get(transportId);
  }

  public removeTransport(transportId: string): void {
    const transport = this.transports.get(transportId);
    if (transport && !transport.closed) {
      transport.close();
    }
    this.transports.delete(transportId);
  }

  public addProducer(producer: Producer): void {
    this.producers.set(producer.id, producer);
  }

  public getProducer(producerId: string): Producer | undefined {
    return this.producers.get(producerId);
  }

  public removeProducer(producerId: string): void {
    const producer = this.producers.get(producerId);
    if (producer && !producer.closed) {
      producer.close();
    }
    this.producers.delete(producerId);
  }

  public addConsumer(consumer: Consumer): void {
    this.consumers.set(consumer.id, consumer);
  }

  public getConsumer(consumerId: string): Consumer | undefined {
    return this.consumers.get(consumerId);
  }

  public removeConsumer(consumerId: string): void {
    const consumer = this.consumers.get(consumerId);
    if (consumer && !consumer.closed) {
      consumer.close();
    }
    this.consumers.delete(consumerId);
  }

  public close(): void {
    for (const consumer of this.consumers.values()) {
      if (!consumer.closed) consumer.close();
    }
    this.consumers.clear();

    for (const producer of this.producers.values()) {
      if (!producer.closed) producer.close();
    }
    this.producers.clear();

    for (const transport of this.transports.values()) {
      if (!transport.closed) transport.close();
    }
    this.transports.clear();
  }

  public sendNotification(type: string, data: unknown): void {
    if (this.socket.readyState === this.socket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type,
          data,
        })
      );
    }
  }
}
