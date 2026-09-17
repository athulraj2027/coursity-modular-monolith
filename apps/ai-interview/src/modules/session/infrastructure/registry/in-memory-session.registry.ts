import { ISessionRegistry } from "../../domain/ports/session-registry.port";
import { InterviewSessionCoordinator } from "../../application/coordinator/interview-session.coordinator";
import { logger } from "../../../../shared/logger";

export class InMemorySessionRegistry implements ISessionRegistry {
  private activeSessions: Map<string, InterviewSessionCoordinator> = new Map();

  registerSession(sessionId: string, session: InterviewSessionCoordinator): void {
    this.activeSessions.set(sessionId, session);
    logger.info(`[SessionRegistry] Registered session: ${sessionId} (Active: ${this.activeSessions.size})`);
  }

  getSession(sessionId: string): InterviewSessionCoordinator | undefined {
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
