import { CriterionScoreResult } from "../../../../shared/types/common.types";

export interface SyncOperationResult<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  [key: string]: any;
}

export interface AppendTranscriptPayload {
  sessionId: string;
  role: "SYSTEM" | "ASSISTANT" | "CANDIDATE";
  content: string;
  audioUrl?: string;
  sequenceOrder?: number;
  durationMs?: number;
  sentiment?: string;
  turnFeedback?: string;
}

export interface EndSessionPayload {
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
}

export interface ITranscriptSyncService {
  appendTranscript(data: AppendTranscriptPayload): Promise<SyncOperationResult>;
}

export interface ISessionLifecycleSyncService {
  initializeSession(sessionId: string, livekitRoomSid?: string, meta?: any): Promise<SyncOperationResult>;
  startSession(sessionId: string, startedAt?: Date, meta?: any): Promise<SyncOperationResult>;
  updateMetadata(sessionId: string, data: { livekitRoomSid?: string; recordingUrl?: string; meta?: any }): Promise<SyncOperationResult>;
  endSession(data: EndSessionPayload): Promise<SyncOperationResult>;
  abandonSession(sessionId: string, reason?: string): Promise<SyncOperationResult>;
}

export interface IBackendSyncService extends ISessionLifecycleSyncService, ITranscriptSyncService {}

