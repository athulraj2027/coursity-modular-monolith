export type InterviewType =
  | "TEACHER_VETTING"
  | "TECHNICAL_ASSESSMENT"
  | "MOCK_INTERVIEW"
  | "PEDAGOGY_EVALUATION";

export type InterviewStatus =
  | "INITIALIZING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "EVALUATING"
  | "EVALUATED"
  | "FAILED"
  | "CANCELLED"
  | "ABANDONED";

export type InterviewOutcome =
  | "PENDING"
  | "PASSED"
  | "FAILED"
  | "NEEDS_HUMAN_REVIEW";

export type InterviewDifficulty =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "EXPERT";

export type TranscriptRole = "SYSTEM" | "ASSISTANT" | "CANDIDATE";

export interface InterviewTemplate {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  type: InterviewType;
  domain: string;
  difficulty: InterviewDifficulty;
  systemPrompt?: string | null;
  voiceId?: string | null;
  llmModel: string;
  maxDurationMinutes: number;
  totalQuestions: number;
  passingScore: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewTranscript {
  id?: string;
  sessionId: string;
  role: TranscriptRole;
  content: string;
  audioUrl?: string | null;
  sequenceOrder: number;
  durationMs?: number | null;
  sentiment?: string | null;
  turnFeedback?: string | null;
  phase?: string;
  createdAt: string;
}

export interface InterviewScore {
  id: string;
  sessionId: string;
  criterion: string;
  score: number;
  maxScore: number;
  weight: number;
  feedback?: string | null;
}

export interface InterviewSession {
  id: string;
  userId: string;
  teacherProfileId?: string | null;
  templateId?: string | null;
  type: InterviewType;
  status: InterviewStatus;
  difficulty: InterviewDifficulty;
  domain?: string | null;
  scheduledAt?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  durationSeconds?: number | null;
  overallScore?: number | null;
  outcome: InterviewOutcome;
  summaryFeedback?: string | null;
  strengths: string[];
  improvements: string[];
  recordingUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  template?: InterviewTemplate | null;
  transcripts?: InterviewTranscript[];
  criteriaScores?: InterviewScore[];
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;
}

export interface RealtimeToken {
  sessionId: string;
  userId: string;
  userName: string;
  roomName: string;
  participantIdentity: string;
  token: string;
  expiresIn: number;
}

export interface InterviewReportData {
  sessionId: string;
  type: InterviewType;
  status: InterviewStatus;
  difficulty: InterviewDifficulty;
  domain?: string;
  overallScore?: number | null;
  outcome: InterviewOutcome;
  summaryFeedback?: string | null;
  strengths: string[];
  improvements: string[];
  criteriaScores?: InterviewScore[];
  durationSeconds?: number | null;
  startedAt?: string | null;
  endedAt?: string | null;
  recordingUrl?: string | null;
}

// WebSocket Realtime Events
export type ConnectionState =
  | "DISCONNECTED"
  | "CONNECTING"
  | "CONNECTED"
  | "RECONNECTING"
  | "ERROR";

export type NetworkQuality = "EXCELLENT" | "GOOD" | "UNSTABLE" | "OFFLINE";

export type OrbState =
  | "IDLE"
  | "LISTENING"
  | "THINKING"
  | "SPEAKING"
  | "COMPLETING"
  | "ERROR";

export interface OutboundAuthMessage {
  type: "AUTH";
  token: string;
  sessionId: string;
}

export interface OutboundTextMessage {
  type: "TEXT_INPUT";
  text: string;
}

export interface OutboundInterruptMessage {
  type: "INTERRUPT";
}

export interface OutboundCompleteMessage {
  type: "COMPLETE_SESSION";
}

export interface InboundAuthSuccessMessage {
  type: "AUTH_SUCCESS";
  phase: string;
  meta: {
    sessionId: string;
    userId: string;
    candidateName: string;
  };
}

export interface InboundTranscriptMessage {
  type: "TRANSCRIPT_FINAL";
  role: TranscriptRole;
  content: string;
  phase?: string;
  sequenceOrder: number;
}

export interface InboundSpeakingStartMessage {
  type: "AI_SPEAKING_START";
  role: "ASSISTANT";
  content?: string;
}

export interface InboundSpeakingEndMessage {
  type: "AI_SPEAKING_END";
  role: "ASSISTANT";
}

export interface InboundAudioChunkMessage {
  type: "AI_AUDIO_CHUNK";
  role: "ASSISTANT";
  audioBase64: string;
}

export interface InboundAnswerAnalysisMessage {
  type: "ANSWER_ANALYSIS";
  analysis: any;
  evidence: any;
  quality: any;
  sequenceOrder: number;
}

export interface InboundInterruptionAckMessage {
  type: "INTERRUPTION_ACK";
}

export interface InboundSessionStateMessage {
  type: "SESSION_STATE";
  phase: string;
}

export interface InboundEvaluationReportMessage {
  type: "EVALUATION_REPORT";
  phase: "COMPLETED";
  report: {
    overallScore: number;
    outcome: InterviewOutcome;
    summaryFeedback: string;
    strengths: string[];
    improvements: string[];
    criteriaScores: Array<{
      criterion: string;
      score: number;
      maxScore: number;
      weight: number;
      feedback: string;
    }>;
    recordingUrl?: string;
  };
}

export interface InboundErrorMessage {
  type: "ERROR" | "AUTH_ERROR";
  error: string;
}

export type InboundSocketMessage =
  | InboundAuthSuccessMessage
  | InboundTranscriptMessage
  | InboundSpeakingStartMessage
  | InboundSpeakingEndMessage
  | InboundAudioChunkMessage
  | InboundAnswerAnalysisMessage
  | InboundInterruptionAckMessage
  | InboundSessionStateMessage
  | InboundEvaluationReportMessage
  | InboundErrorMessage;

// Audio Device Types
export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

// ==========================================
// ADMIN INTERVIEW TYPES
// ==========================================

export interface AdminSessionFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: InterviewStatus;
  outcome?: InterviewOutcome;
  type?: InterviewType;
  difficulty?: InterviewDifficulty;
  domain?: string;
  templateId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "createdAt" | "startedAt" | "overallScore" | "durationSeconds";
  sortOrder?: "asc" | "desc";
}

export interface AdminInterviewSessionListResponse {
  success: boolean;
  data: InterviewSession[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminDecisionOverridePayload {
  outcome: InterviewOutcome;
  overallScore?: number;
  adminNote?: string;
}

export interface AdminEvaluationUpdatePayload {
  overallScore?: number;
  summaryFeedback?: string;
  strengths?: string[];
  improvements?: string[];
  criteriaScores?: Array<{
    criterion: string;
    score: number;
    feedback?: string;
  }>;
  adminNote?: string;
}

export interface InterviewAuditLog {
  id: string;
  sessionId: string;
  actorId?: string | null;
  action: string;
  previousState?: any;
  newState?: any;
  note?: string | null;
  createdAt: string;
}

export interface InterviewAnalyticsOverview {
  totalSessions: number;
  completedSessions: number;
  passedSessions: number;
  failedSessions: number;
  needsReviewSessions: number;
  inProgressSessions: number;
  passRatePercentage: number;
  averageScore: number;
  averageDurationMinutes: number;
}

