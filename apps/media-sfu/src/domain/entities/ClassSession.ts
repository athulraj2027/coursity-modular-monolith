import type { Router, Producer, MediaKind } from "mediasoup/node/lib/types";
import { Participant } from "./Participant";

export class ClassSession {
  public readonly roomId: string;
  public readonly router: Router;
  public readonly workerIndex: number;
  public readonly createdAt: Date;
  public readonly participants = new Map<string, Participant>();

  constructor(roomId: string, router: Router, workerIndex: number) {
    this.roomId = roomId;
    this.router = router;
    this.workerIndex = workerIndex;
    this.createdAt = new Date();
  }

  public addParticipant(participant: Participant): void {
    this.participants.set(participant.userId, participant);
  }

  public getParticipant(userId: string): Participant | undefined {
    return this.participants.get(userId);
  }

  public removeParticipant(userId: string): Participant | undefined {
    const participant = this.participants.get(userId);
    if (participant) {
      participant.close();
      this.participants.delete(userId);
    }
    return participant;
  }

  public getActiveProducers(): Array<{
    producerId: string;
    producerUserId: string;
    kind: MediaKind;
    appData?: Record<string, unknown>;
  }> {
    const activeProducers: Array<{
      producerId: string;
      producerUserId: string;
      kind: MediaKind;
      appData?: Record<string, unknown>;
    }> = [];

    for (const participant of this.participants.values()) {
      for (const producer of participant.producers.values()) {
        if (!producer.closed) {
          activeProducers.push({
            producerId: producer.id,
            producerUserId: participant.userId,
            kind: producer.kind,
            appData: producer.appData as Record<string, unknown>,
          });
        }
      }
    }

    return activeProducers;
  }

  public findProducer(producerId: string): { producer: Producer; ownerUserId: string } | undefined {
    for (const participant of this.participants.values()) {
      const producer = participant.getProducer(producerId);
      if (producer && !producer.closed) {
        return { producer, ownerUserId: participant.userId };
      }
    }
    return undefined;
  }

  public broadcast(type: string, data: unknown, excludeUserId?: string): void {
    for (const participant of this.participants.values()) {
      if (participant.userId !== excludeUserId) {
        participant.sendNotification(type, data);
      }
    }
  }

  public close(): void {
    for (const participant of this.participants.values()) {
      participant.close();
    }
    this.participants.clear();

    if (!this.router.closed) {
      this.router.close();
    }
  }
}
