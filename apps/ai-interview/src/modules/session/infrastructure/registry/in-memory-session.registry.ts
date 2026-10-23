import { ISessionRegistry } from "../../domain/ports/session-registry.port";
import { IInterviewSession } from "../../domain/ports/interview-session.port";
import { logger } from "../../../../shared/logger";

export class InMemorySessionRegistry implements ISessionRegistry {
  private activeSessions: Map<string, IInterviewSession> = new Map();

  registerSession(sessionId: string, session: IInterviewSession): void {
    this.activeSessions.set(sessionId, session);
    logger.info(`[SessionRegistry] Registered session: ${sessionId} (Active: ${this.activeSessions.size})`);
  }

  getSession(sessionId: string): IInterviewSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  removeSession(sessionId: string): boolean {
    const removed = this.activeSessions.delete(sessionId);
    if (removed) {
      logger.info(`[SessionRegistry] Removed session: ${sessionId} (Remaining: ${this.activeSessions.size})`);
    }
    return removed;
  }

  getActiveCount(): number {
    return this.activeSessions.size;
  }
}
