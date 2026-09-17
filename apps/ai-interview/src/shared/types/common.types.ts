export type InterviewPhase =
  | "INITIALIZING"
  | "PLANNING"
  | "GREETING"
  | "QUESTION_ACTIVE"
  | "FOLLOW_UP"
  | "EVALUATING"
  | "COMPLETED"
  | "ABANDONED";

export type NextAction =
  | "GREETING"
  | "ASK_QUESTION"
  | "FOLLOW_UP"
  | "CLARIFY"
  | "END_INTERVIEW";

export type InterviewDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export interface CandidateContext {
  userId: string;
  name: string;
  email?: string;
  bio?: string;
  experienceYears?: number;
  expertise?: string[];
  qualifications?: string;
  resumeHighlights?: string[];
}

export interface InterviewPlanTopic {
  id: string;
  name: string;
  difficulty: InterviewDifficulty;
  weight: number;
  minQuestions: number;
  expectedSignals: string[];
  covered: boolean;
}

export interface InterviewPlan {
  planId: string;
  domain: string;
  initialDifficulty: InterviewDifficulty;
  currentDifficulty: InterviewDifficulty;
  totalPlannedQuestions: number;
  topics: InterviewPlanTopic[];
  strategyNotes: string;
}

export interface AnswerAnalysis {
  relevance: number; // 0.0 - 1.0
  completeness: number; // 0.0 - 1.0
  correctness: number; // 0.0 - 1.0
  clarity: number; // 0.0 - 1.0
  needsFollowUp: boolean;
  critique: string;
}

export interface ExtractedEvidence {
  technicalClaims: string[];
  concreteExamples: string[];
  metricsCited: string[];
  missingEvidence: string[];
}

export interface ConversationQualitySignal {
  isRambling: boolean;
  isTooBrief: boolean;
  isOffTopic: boolean;
  isMisunderstood: boolean;
  sentiment: "CONFIDENT" | "NEUTRAL" | "HESITANT" | "DEFENSIVE";
  qualityScore: number; // 0.0 - 1.0
}

export interface IntegrityAnomalySignal {
  anomalyDetected: boolean;
  anomalyType?: "PROMPT_INJECTION" | "READING_SCRIPT" | "SYSTEM_EXTRACTION" | "SUSPICIOUS_DELAY" | "OFF_TOPIC_EVASION";
  severity: "LOW" | "MEDIUM" | "HIGH";
  reason?: string;
}

export interface QuestionDecision {
  question: string;
  topic: string;
  difficulty: InterviewDifficulty;
  expectedSignals: string[];
  rationale?: string;
}

export interface FollowUpDecision {
  shouldFollowUp: boolean;
  reason: string;
  question: string;
  targetMissingEvidence?: string[];
}

export interface CriterionScoreResult {
  criterion: string;
  score: number;
  maxScore?: number;
  weight?: number;
  feedback?: string;
}

export interface CandidateFeedback {
  keyStrengths: string[];
  improvementAreas: string[];
  coachingRecommendations: string[];
  actionableNextSteps: string[];
}

export interface EvaluationReportResult {
  overallScore: number;
  outcome: "PASSED" | "FAILED" | "NEEDS_HUMAN_REVIEW";
  summaryFeedback: string;
  strengths: string[];
  improvements: string[];
  criteriaScores: CriterionScoreResult[];
  candidateFeedback?: CandidateFeedback;
  anomalySummary?: string[];
}

export interface DialogueMessage {
  role: "system" | "ai" | "candidate";
  content: string;
  timestamp?: Date;
  analysis?: AnswerAnalysis;
  evidence?: ExtractedEvidence;
  quality?: ConversationQualitySignal;
  anomaly?: IntegrityAnomalySignal;
}
