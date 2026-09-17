import { CriterionScoreResult } from "../../../../shared/types/common.types";

export interface IBackendSyncService {
  initializeSession(sessionId: string, livekitRoomSid?: string, meta?: any): Promise<any>;
  startSession(sessionId: string, startedAt?: Date, meta?: any): Promise<any>;
  appendTranscript(data: {
    sessionId: string;
    role: "SYSTEM" | "ASSISTANT" | "CANDIDATE";
    content: string;
    audioUrl?: string;
    sequenceOrder?: number;
    durationMs?: number;
    sentiment?: string;
    turnFeedback?: string;
  }): Promise<any>;
  updateMetadata(sessionId: string, data: { livekitRoomSid?: string; recordingUrl?: string; meta?: any }): Promise<any>;
  endSession(data: {
    sessionId: string;
    endedAt?: Date;
    durationSeconds?: number;
    overallScore: number;
    outcome?: "PASSED" | "FAILED" | "NEEDS_HUMAN_REVIEW";
    summaryFeedback: string;
    strengths?: string[];
    improvements?: string[];
    recordingUrl?: string;
    criteriaScores?: CriterionScoreResult[];
    meta?: any;
  }): Promise<any>;
  abandonSession(sessionId: string, reason?: string): Promise<any>;
}
