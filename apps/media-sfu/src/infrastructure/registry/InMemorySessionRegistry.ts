import { ISessionRegistry } from "@/domain/ports/ISessionRegistry";
import { ClassSession } from "@/domain/entities/ClassSession";

export class InMemorySessionRegistry implements ISessionRegistry {
  private sessions = new Map<string, ClassSession>();

  public get(roomId: string): ClassSession | undefined {
    return this.sessions.get(roomId);
  }

  public set(session: ClassSession): void {
    this.sessions.set(session.roomId, session);
  }

  public delete(roomId: string): boolean {
    const session = this.sessions.get(roomId);
    if (session) {
      session.close();
      return this.sessions.delete(roomId);
    }
    return false;
  }

  public getAll(): ClassSession[] {
    return Array.from(this.sessions.values());
  }

  public count(): number {
    return this.sessions.size;
  }

  public getTotalConsumersCount(): number {
    let count = 0;
    for (const session of this.sessions.values()) {
      for (const participant of session.participants.values()) {
        count += participant.consumers.size;
      }
    }
    return count;
  }

  public getTotalProducersCount(): number {
    let count = 0;
    for (const session of this.sessions.values()) {
      for (const participant of session.participants.values()) {
        count += participant.producers.size;
      }
    }
    return count;
  }

  public getTotalTransportsCount(): number {
    let count = 0;
    for (const session of this.sessions.values()) {
      for (const participant of session.participants.values()) {
        count += participant.transports.size;
      }
    }
    return count;
  }
}
