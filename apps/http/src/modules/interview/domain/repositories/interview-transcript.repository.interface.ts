import {
  InterviewTranscriptEntity,
  TranscriptRole,
} from "../entities/interview.entity";

export interface IInterviewTranscriptRepository {
  appendTurn(data: {
    sessionId: string;
    role: TranscriptRole;
    content: string;
    audioUrl?: string | null;
    sequenceOrder?: number;
    durationMs?: number | null;
    sentiment?: string | null;
    turnFeedback?: string | null;
  }): Promise<InterviewTranscriptEntity>;

  findBySessionId(sessionId: string): Promise<InterviewTranscriptEntity[]>;

  getLatestTurns(
    sessionId: string,
    limit?: number
  ): Promise<InterviewTranscriptEntity[]>;

  countTurns(sessionId: string): Promise<number>;
}
