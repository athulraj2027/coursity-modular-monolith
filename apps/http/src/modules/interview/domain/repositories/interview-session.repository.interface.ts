import {
  AdminListSessionsQueryDto,
  AdminOverrideDecisionDto,
  AdminAdjustEvaluationDto,
} from "../dtos/admin-interview.dto";
import { CandidateListSessionsQueryDto } from "../dtos/candidate-interview.dto";
import {
  InterviewAuditLogEntity,
  InterviewSessionEntity,
  InterviewStatus,
} from "../entities/interview.entity";

export interface IInterviewSessionRepository {
  create(data: {
    userId: string;
    teacherProfileId?: string | null;
    templateId?: string | null;
    type: string;
    domain?: string | null;
    difficulty: string;
    status: InterviewStatus;
  }): Promise<InterviewSessionEntity>;

  findById(id: string): Promise<InterviewSessionEntity | null>;

  findByUserId(
    query: CandidateListSessionsQueryDto
  ): Promise<{ sessions: InterviewSessionEntity[]; total: number }>;

  findAdminAll(
    query: AdminListSessionsQueryDto
  ): Promise<{ sessions: InterviewSessionEntity[]; total: number }>;

  updateStatus(
    id: string,
    status: InterviewStatus,
    extra?: Partial<InterviewSessionEntity>
  ): Promise<InterviewSessionEntity>;

  updateSession(
    id: string,
    data: Partial<InterviewSessionEntity>
  ): Promise<InterviewSessionEntity>;

  recordAuditLog(data: {
    sessionId: string;
    actorId?: string | null;
    action: string;
    previousState?: any;
    newState?: any;
    note?: string | null;
  }): Promise<InterviewAuditLogEntity>;

  getAuditLogs(sessionId: string): Promise<InterviewAuditLogEntity[]>;

  saveEvaluation(data: {
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
  }): Promise<InterviewSessionEntity>;
}
