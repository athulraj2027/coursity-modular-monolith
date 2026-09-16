import {
  InterviewDifficulty,
  InterviewOutcome,
  InterviewStatus,
  InterviewType,
} from "../entities/interview.entity";

export interface AdminListSessionsQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: InterviewStatus;
  outcome?: InterviewOutcome;
  type?: InterviewType;
  difficulty?: InterviewDifficulty;
  templateId?: string;
  startDate?: string;
  endDate?: string;
}

export interface AdminOverrideDecisionDto {
  sessionId: string;
  adminId: string;
  outcome: InterviewOutcome;
  overallScore?: number;
  adminNote?: string;
}

export interface AdminAdjustEvaluationDto {
  sessionId: string;
  adminId: string;
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

export interface CreateInterviewTemplateDto {
  title: string;
  slug?: string;
  description?: string;
  type?: InterviewType;
  domain: string;
  difficulty?: InterviewDifficulty;
  systemPrompt?: string;
  voiceId?: string;
  llmModel?: string;
  maxDurationMinutes?: number;
  totalQuestions?: number;
  passingScore?: number;
  isActive?: boolean;
  adminId?: string;
}

export interface UpdateInterviewTemplateDto {
  title?: string;
  description?: string;
  type?: InterviewType;
  domain?: string;
  difficulty?: InterviewDifficulty;
  systemPrompt?: string;
  voiceId?: string;
  llmModel?: string;
  maxDurationMinutes?: number;
  totalQuestions?: number;
  passingScore?: number;
  isActive?: boolean;
  changeLog?: string;
  adminId?: string;
}

export interface AdminListTemplatesQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  domain?: string;
  type?: InterviewType;
  difficulty?: InterviewDifficulty;
  isActive?: boolean;
}

export interface AnalyticsOverviewDto {
  totalInterviews: number;
  completedInterviews: number;
  passedCount: number;
  failedCount: number;
  passRatePercentage: number;
  averageScore: number;
  averageDurationSeconds: number;
  statusDistribution: Record<string, number>;
  outcomeDistribution: Record<string, number>;
}

export interface AnalyticsTimeseriesPointDto {
  date: string;
  total: number;
  passed: number;
  failed: number;
  averageScore: number;
}
