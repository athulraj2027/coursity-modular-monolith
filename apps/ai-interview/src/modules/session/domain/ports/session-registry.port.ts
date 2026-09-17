import { InterviewSessionCoordinator } from "../../application/coordinator/interview-session.coordinator";

export interface ISessionRegistry {
  registerSession(sessionId: string, session: InterviewSessionCoordinator): void;
  getSession(sessionId: string): InterviewSessionCoordinator | undefined;
  removeSession(sessionId: string): boolean;
  getActiveCount(): number;
}
