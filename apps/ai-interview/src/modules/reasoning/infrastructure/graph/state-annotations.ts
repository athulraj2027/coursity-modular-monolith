import { Annotation } from "@langchain/langgraph";
import {
  InterviewPhase,
  NextAction,
  InterviewDifficulty,
  CandidateContext,
  InterviewPlan,
  AnswerAnalysis,
  ExtractedEvidence,
  ConversationQualitySignal,
  IntegrityAnomalySignal,
  EvaluationReportResult,
  CandidateFeedback,
  DialogueMessage,
} from "../../../../shared/types/common.types";

export const InterviewStateAnnotation = Annotation.Root({
  interviewId: Annotation<string>(),
  candidate: Annotation<CandidateContext>({
    reducer: (curr, update) => update ?? curr,
    default: () => ({ userId: "unknown", name: "Candidate" }),
  }),
  domain: Annotation<string>({
    reducer: (curr, update) => update ?? curr,
    default: () => "Technical Evaluation",
  }),
  difficulty: Annotation<InterviewDifficulty>({
    reducer: (curr, update) => update ?? curr,
    default: () => "INTERMEDIATE",
  }),
  systemPrompt: Annotation<string | null | undefined>({
    reducer: (curr, update) => update ?? curr,
    default: () => undefined,
  }),
  phase: Annotation<InterviewPhase>({
    reducer: (curr, update) => (update !== undefined ? update : curr ?? "INITIALIZING"),
    default: () => "INITIALIZING",
  }),

  // Plan
  plan: Annotation<InterviewPlan | undefined>({
    reducer: (curr, update) => (update !== undefined ? update : curr),
    default: () => undefined,
  }),
  topics: Annotation<string[]>({
    reducer: (curr, update) => (update !== undefined ? update : curr ?? []),
    default: () => ["Core Competencies", "Pedagogy & Problem Solving", "System Architecture"],
  }),
  coveredTopics: Annotation<string[]>({
    reducer: (curr, update) => Array.from(new Set([...(curr || []), ...(update || [])])),
    default: () => [],
  }),
  currentTopic: Annotation<string | null>({
    reducer: (curr, update) => (update !== undefined ? update : curr ?? null),
    default: () => null,
  }),

  // Progression
  questionIndex: Annotation<number>({
    reducer: (curr, update) => (update !== undefined ? update : curr ?? 0),
    default: () => 0,
  }),
  totalQuestions: Annotation<number>({
    reducer: (curr, update) => (update !== undefined ? update : curr ?? 5),
    default: () => 5,
  }),
  currentQuestion: Annotation<string | null>({
    reducer: (curr, update) => (update !== undefined ? update : curr ?? null),
    default: () => null,
  }),
  previousQuestions: Annotation<string[]>({
    reducer: (curr, update) => Array.from(new Set([...(curr || []), ...(update || [])])),
    default: () => [],
  }),

  // Candidate Turn
  candidateAnswer: Annotation<string | null>({
    reducer: (curr, update) => (update !== undefined ? update : curr ?? null),
    default: () => null,
  }),
  conversation: Annotation<DialogueMessage[]>({
    reducer: (curr, update) => [...(curr || []), ...(update || [])],
    default: () => [],
  }),

  // Signals
  answerAnalysis: Annotation<AnswerAnalysis | undefined>({
    reducer: (curr, update) => (update !== undefined ? update : curr),
    default: () => undefined,
  }),
  analyses: Annotation<AnswerAnalysis[]>({
    reducer: (curr, update) => [...(curr || []), ...(update || [])],
    default: () => [],
  }),
  evidence: Annotation<ExtractedEvidence | undefined>({
    reducer: (curr, update) => (update !== undefined ? update : curr),
    default: () => undefined,
  }),
  quality: Annotation<ConversationQualitySignal | undefined>({
    reducer: (curr, update) => (update !== undefined ? update : curr),
    default: () => undefined,
  }),
  anomaly: Annotation<IntegrityAnomalySignal | undefined>({
    reducer: (curr, update) => (update !== undefined ? update : curr),
    default: () => undefined,
  }),
  performanceTrend: Annotation<"STRONG" | "MODERATE" | "STRUGGLING">({
    reducer: (curr, update) => update ?? curr ?? "MODERATE",
    default: () => "MODERATE",
  }),

  // Flow Controls
  consecutiveFollowUps: Annotation<number>({
    reducer: (curr, update) => (update !== undefined ? update : curr ?? 0),
    default: () => 0,
  }),
  timeRemainingSeconds: Annotation<number>({
    reducer: (curr, update) => (update !== undefined ? update : curr ?? 1800),
    default: () => 1800,
  }),
  nextAction: Annotation<NextAction | undefined>({
    reducer: (curr, update) => (update !== undefined ? update : curr),
    default: () => undefined,
  }),
  responseText: Annotation<string | undefined>({
    reducer: (curr, update) => (update !== undefined ? update : curr),
    default: () => undefined,
  }),

  // Final Output
  evaluation: Annotation<EvaluationReportResult | undefined>({
    reducer: (curr, update) => (update !== undefined ? update : curr),
    default: () => undefined,
  }),
  feedback: Annotation<CandidateFeedback | undefined>({
    reducer: (curr, update) => (update !== undefined ? update : curr),
    default: () => undefined,
  }),
});

export type InterviewGraphStateType = typeof InterviewStateAnnotation.State;
