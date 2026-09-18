import { z } from "zod";

export const CreateInterviewSessionSchema = z.object({
  templateId: z.string().uuid().optional(),
  type: z
    .enum([
      "TEACHER_VETTING",
      "TECHNICAL_ASSESSMENT",
      "MOCK_INTERVIEW",
      "PEDAGOGY_EVALUATION",
    ])
    .optional(),
  domain: z.string().min(1).max(200).optional(),
  difficulty: z
    .enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"])
    .optional(),
});

export const CandidateListSessionsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  type: z
    .enum([
      "TEACHER_VETTING",
      "TECHNICAL_ASSESSMENT",
      "MOCK_INTERVIEW",
      "PEDAGOGY_EVALUATION",
    ])
    .optional(),
  status: z.string().optional(),
});

export const AdminListSessionsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z
    .enum([
      "INITIALIZING",
      "IN_PROGRESS",
      "COMPLETED",
      "EVALUATING",
      "EVALUATED",
      "FAILED",
      "CANCELLED",
      "ABANDONED",
    ])
    .optional(),
  outcome: z
    .enum(["PENDING", "PASSED", "FAILED", "NEEDS_HUMAN_REVIEW"])
    .optional(),
  type: z
    .enum([
      "TEACHER_VETTING",
      "TECHNICAL_ASSESSMENT",
      "MOCK_INTERVIEW",
      "PEDAGOGY_EVALUATION",
    ])
    .optional(),
  difficulty: z
    .enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"])
    .optional(),
  templateId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const AdminOverrideDecisionSchema = z.object({
  outcome: z.enum(["PENDING", "PASSED", "FAILED", "NEEDS_HUMAN_REVIEW"]),
  overallScore: z.number().min(0).max(100).optional(),
  adminNote: z.string().max(2000).optional(),
});

export const AdminAdjustEvaluationSchema = z.object({
  overallScore: z.number().min(0).max(100).optional(),
  summaryFeedback: z.string().max(5000).optional(),
  strengths: z.array(z.string()).optional(),
  improvements: z.array(z.string()).optional(),
  criteriaScores: z
    .array(
      z.object({
        criterion: z.string().min(1),
        score: z.number().min(0).max(100),
        feedback: z.string().optional(),
      })
    )
    .optional(),
  adminNote: z.string().max(2000).optional(),
});

export const CreateInterviewTemplateSchema = z.object({
  title: z.string().min(2).max(150),
  slug: z.string().min(2).max(150).optional(),
  description: z.string().max(2000).optional(),
  type: z
    .enum([
      "TEACHER_VETTING",
      "TECHNICAL_ASSESSMENT",
      "MOCK_INTERVIEW",
      "PEDAGOGY_EVALUATION",
    ])
    .default("TEACHER_VETTING"),
  domain: z.string().min(1).max(150),
  difficulty: z
    .enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"])
    .default("INTERMEDIATE"),
  systemPrompt: z.string().max(10000).optional(),
  voiceId: z.string().optional(),
  llmModel: z.string().default("gemini-1.5-flash"),
  maxDurationMinutes: z.number().min(1).max(120).default(15),
  totalQuestions: z.number().min(1).max(30).default(5),
  passingScore: z.number().min(0).max(100).default(70.0),
  isActive: z.boolean().default(true),
});

export const UpdateInterviewTemplateSchema = z.object({
  title: z.string().min(2).max(150).optional(),
  description: z.string().max(2000).optional(),
  type: z
    .enum([
      "TEACHER_VETTING",
      "TECHNICAL_ASSESSMENT",
      "MOCK_INTERVIEW",
      "PEDAGOGY_EVALUATION",
    ])
    .optional(),
  domain: z.string().min(1).max(150).optional(),
  difficulty: z
    .enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"])
    .optional(),
  systemPrompt: z.string().max(10000).optional(),
  voiceId: z.string().optional(),
  llmModel: z.string().optional(),
  maxDurationMinutes: z.number().min(1).max(120).optional(),
  totalQuestions: z.number().min(1).max(30).optional(),
  passingScore: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
  changeLog: z.string().max(1000).optional(),
});

export const AdminListTemplatesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  domain: z.string().optional(),
  type: z
    .enum([
      "TEACHER_VETTING",
      "TECHNICAL_ASSESSMENT",
      "MOCK_INTERVIEW",
      "PEDAGOGY_EVALUATION",
    ])
    .optional(),
  difficulty: z
    .enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"])
    .optional(),
  isActive: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((val) => (typeof val === "boolean" ? val : val === "true"))
    .optional(),
});

export const ToggleTemplateStatusSchema = z.object({
  isActive: z.boolean(),
});

export const InternalInitializeSessionSchema = z.object({
  livekitRoomSid: z.string().optional(),
  meta: z.record(z.string(), z.any()).optional(),
});

export const InternalStartSessionSchema = z.object({
  startedAt: z.string().datetime().optional(),
  meta: z.record(z.string(), z.any()).optional(),
});

export const InternalEndSessionSchema = z.object({
  endedAt: z.string().datetime().optional(),
  durationSeconds: z.number().min(0).optional(),
  overallScore: z.number().min(0).max(100).optional(),
  outcome: z
    .enum(["PENDING", "PASSED", "FAILED", "NEEDS_HUMAN_REVIEW"])
    .optional(),
  summaryFeedback: z.string().optional(),
  strengths: z.array(z.string()).optional(),
  improvements: z.array(z.string()).optional(),
  recordingUrl: z.string().url().optional().or(z.literal("")),
  criteriaScores: z
    .array(
      z.object({
        criterion: z.string().min(1),
        score: z.number().min(0).max(100),
        maxScore: z.number().optional(),
        weight: z.number().optional(),
        feedback: z.string().optional(),
      })
    )
    .optional(),
  meta: z.record(z.string(), z.any()).optional(),
});

export const InternalAppendTranscriptSchema = z.object({
  role: z.enum(["SYSTEM", "ASSISTANT", "CANDIDATE"]),
  content: z.string().min(1),
  audioUrl: z.string().url().optional().or(z.literal("")),
  sequenceOrder: z.number().int().optional(),
  durationMs: z.number().int().optional(),
  sentiment: z.string().optional(),
  turnFeedback: z.string().optional(),
});

export const InternalUpdateMetadataSchema = z.object({
  livekitRoomSid: z.string().optional(),
  recordingUrl: z.string().url().optional().or(z.literal("")),
  meta: z.record(z.string(), z.any()).optional(),
});

export const InternalAbandonSessionSchema = z.object({
  reason: z.string().max(1000).optional(),
});
