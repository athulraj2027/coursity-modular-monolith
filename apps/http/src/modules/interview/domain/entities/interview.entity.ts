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

export interface InterviewTemplateEntity {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewTemplateVersionEntity {
  id: string;
  templateId: string;
  version: number;
  title: string;
  systemPrompt?: string | null;
  voiceId?: string | null;
  llmModel: string;
  maxDurationMinutes: number;
  totalQuestions: number;
  passingScore: number;
  changeLog?: string | null;
  createdBy?: string | null;
  createdAt: Date;
}

export interface InterviewScoreEntity {
  id: string;
  sessionId: string;
  criterion: string;
  score: number;
  maxScore: number;
  weight: number;
  feedback?: string | null;
  createdAt: Date;
}

export interface InterviewTranscriptEntity {
  id: string;
  sessionId: string;
  role: TranscriptRole;
  content: string;
  audioUrl?: string | null;
  sequenceOrder: number;
  durationMs?: number | null;
  sentiment?: string | null;
  turnFeedback?: string | null;
  createdAt: Date;
}

export interface InterviewAuditLogEntity {
  id: string;
  sessionId: string;
  actorId?: string | null;
  action: string;
  previousState?: any;
  newState?: any;
  note?: string | null;
  createdAt: Date;
}

export interface InterviewSessionEntity {
  id: string;
  userId: string;
  teacherProfileId?: string | null;
  templateId?: string | null;
  type: InterviewType;
  status: InterviewStatus;
  difficulty: InterviewDifficulty;
  domain?: string | null;
  scheduledAt?: Date | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
  durationSeconds?: number | null;
  overallScore?: number | null;
  outcome: InterviewOutcome;
  summaryFeedback?: string | null;
  strengths: string[];
  improvements: string[];
  recordingUrl?: string | null;
  livekitRoomSid?: string | null;
  meta?: any;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  template?: InterviewTemplateEntity | null;
  transcripts?: InterviewTranscriptEntity[];
  criteriaScores?: InterviewScoreEntity[];
  auditLogs?: InterviewAuditLogEntity[];
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}
