import {
  InterviewOutcome,
  InterviewStatus,
  TranscriptRole,
} from "../entities/interview.entity";

export interface InternalInitializeSessionDto {
  sessionId: string;
  livekitRoomSid?: string;
  meta?: any;
}

export interface InternalStartSessionDto {
  sessionId: string;
  startedAt?: Date;
  meta?: any;
}

export interface InternalEndSessionDto {
  sessionId: string;
  endedAt?: Date;
  durationSeconds?: number;
  overallScore?: number;
  outcome?: InterviewOutcome;
  summaryFeedback?: string;
  strengths?: string[];
  improvements?: string[];
  recordingUrl?: string;
  criteriaScores?: Array<{
    criterion: string;
    score: number;
    maxScore?: number;
    weight?: number;
    feedback?: string;
  }>;
  meta?: any;
}

export interface InternalAppendTranscriptDto {
  sessionId: string;
  role: TranscriptRole;
  content: string;
  audioUrl?: string;
  sequenceOrder?: number;
  durationMs?: number;
  sentiment?: string;
  turnFeedback?: string;
}

export interface InternalUpdateMetadataDto {
  sessionId: string;
  livekitRoomSid?: string;
  recordingUrl?: string;
  meta?: any;
}

export interface InternalAbandonSessionDto {
  sessionId: string;
  reason?: string;
}
