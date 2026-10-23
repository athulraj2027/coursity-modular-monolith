import { IInterviewSession } from "./interview-session.port";

export interface ISessionMetricsReader {
  getActiveCount(): number;
}

export interface ISessionRegistry extends ISessionMetricsReader {
  registerSession(sessionId: string, session: IInterviewSession): void;
  getSession(sessionId: string): IInterviewSession | undefined;
  removeSession(sessionId: string): boolean;
  getActiveCount(): number;
}

