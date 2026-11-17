import { IBaseRepository } from "@/shared/domain/repositories/base.repository.interface";
import {
  AdminListSessionsQueryDto,
} from "../dtos/admin-interview.dto";
import { CandidateListSessionsQueryDto } from "../dtos/candidate-interview.dto";
import {
  InterviewAuditLogEntity,
  InterviewSessionEntity,
  InterviewStatus,
} from "../entities/interview.entity";

export interface CreateInterviewSessionInput {
  userId: string;
  teacherProfileId?: string | null;
  templateId?: string | null;
  type: string;
  domain?: string | null;
  difficulty: string;
  status: InterviewStatus;
}

export interface SaveEvaluationInput {
  sessionId: string;
  overallScore: number;
  outcome: string;
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
}

export interface RecordAuditLogInput {
  sessionId: string;
  actorId?: string | null;
  action: string;
  previousState?: any;
  newState?: any;
  note?: string | null;
}

/**
 * Segregated query repository for reading interview sessions
 */
export interface IInterviewSessionQueryRepository {
  findById(id: string): Promise<InterviewSessionEntity | null>;
  findByUserId(
    query: CandidateListSessionsQueryDto
  ): Promise<{ sessions: InterviewSessionEntity[]; total: number }>;
  findAdminAll(
    query: AdminListSessionsQueryDto
  ): Promise<{ sessions: InterviewSessionEntity[]; total: number }>;
}

/**
 * Segregated repository for interview session lifecycle mutations
 */
export interface IInterviewSessionLifecycleRepository {
  create(data: CreateInterviewSessionInput): Promise<InterviewSessionEntity>;
  updateStatus(
    id: string,
    status: InterviewStatus,
    extra?: Partial<InterviewSessionEntity>
  ): Promise<InterviewSessionEntity>;
  updateSession(
    id: string,
    data: Partial<InterviewSessionEntity>
  ): Promise<InterviewSessionEntity>;
}

/**
 * Segregated repository for evaluation & scoring persistence
 */
export interface IInterviewEvaluationRepository {
  saveEvaluation(data: SaveEvaluationInput): Promise<InterviewSessionEntity>;
}

/**
 * Segregated repository for audit logs
 */
export interface IInterviewAuditRepository {
  recordAuditLog(data: RecordAuditLogInput): Promise<InterviewAuditLogEntity>;
  getAuditLogs(sessionId: string): Promise<InterviewAuditLogEntity[]>;
}

/**
 * Segregated repository for candidate vetting eligibility context
 */
export interface IInterviewVettingContextRepository {
  canCandidateStartInterview(userId: string): Promise<{
    allowed: boolean;
    reason?: "ALREADY_PASSED" | "MAX_ATTEMPTS";
  }>;
}

/**
 * Unified Interview Session Repository (ISP Aggregator)
 */
export interface IInterviewSessionRepository
  extends IInterviewSessionQueryRepository,
    IInterviewSessionLifecycleRepository,
    IInterviewEvaluationRepository,
    IInterviewAuditRepository,
    IInterviewVettingContextRepository {}
