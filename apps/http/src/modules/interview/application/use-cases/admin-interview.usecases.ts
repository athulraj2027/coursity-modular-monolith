import {
  InterviewNotFoundError,
  TemplateNotFoundError,
} from "../../domain/errors/interview.error";
import { IInterviewSessionRepository } from "../../domain/repositories/interview-session.repository.interface";
import { IInterviewTemplateRepository } from "../../domain/repositories/interview-template.repository.interface";
import { IInterviewTranscriptRepository } from "../../domain/repositories/interview-transcript.repository.interface";
import { IInterviewAnalyticsRepository } from "../../domain/repositories/interview-analytics.repository.interface";
import {
  AdminAdjustEvaluationDto,
  AdminListSessionsQueryDto,
  AdminListTemplatesQueryDto,
  AdminOverrideDecisionDto,
  AnalyticsOverviewDto,
  AnalyticsTimeseriesPointDto,
  CreateInterviewTemplateDto,
  UpdateInterviewTemplateDto,
} from "../../domain/dtos/admin-interview.dto";
import {
  InterviewAuditLogEntity,
  InterviewSessionEntity,
  InterviewTemplateEntity,
  InterviewTemplateVersionEntity,
  InterviewTranscriptEntity,
} from "../../domain/entities/interview.entity";

export class AdminInterviewUseCases {
  constructor(
    private readonly sessionRepo: IInterviewSessionRepository,
    private readonly templateRepo: IInterviewTemplateRepository,
    private readonly transcriptRepo: IInterviewTranscriptRepository,
    private readonly analyticsRepo: IInterviewAnalyticsRepository
  ) {}

  // 1. Session Management
  async getSessions(
    query: AdminListSessionsQueryDto
  ): Promise<{ sessions: InterviewSessionEntity[]; total: number }> {
    return this.sessionRepo.findAdminAll(query);
  }

  async getSessionDetails(id: string): Promise<InterviewSessionEntity> {
    const session = await this.sessionRepo.findById(id);
    if (!session) throw new InterviewNotFoundError();
    return session;
  }

  async getSessionTranscripts(
    sessionId: string
  ): Promise<InterviewTranscriptEntity[]> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new InterviewNotFoundError();
    return this.transcriptRepo.findBySessionId(sessionId);
  }

  async getSessionRecording(
    sessionId: string
  ): Promise<{ recordingUrl: string | null; isReady: boolean }> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new InterviewNotFoundError();
    return {
      recordingUrl: session.recordingUrl || null,
      isReady: !!session.recordingUrl,
    };
  }

  async overrideDecision(
    dto: AdminOverrideDecisionDto
  ): Promise<InterviewSessionEntity> {
    const session = await this.sessionRepo.findById(dto.sessionId);
    if (!session) throw new InterviewNotFoundError();

    const previousOutcome = session.outcome;
    const previousScore = session.overallScore;

    const updated = await this.sessionRepo.updateSession(dto.sessionId, {
      outcome: dto.outcome,
      overallScore:
        dto.overallScore !== undefined ? dto.overallScore : session.overallScore,
      status: "EVALUATED",
    });

    await this.sessionRepo.recordAuditLog({
      sessionId: dto.sessionId,
      actorId: dto.adminId,
      action: "DECISION_OVERRIDDEN",
      previousState: { outcome: previousOutcome, overallScore: previousScore },
      newState: { outcome: dto.outcome, overallScore: updated.overallScore },
      note: dto.adminNote || "Admin manual decision override",
    });

    return updated;
  }

  async adjustEvaluation(
    dto: AdminAdjustEvaluationDto
  ): Promise<InterviewSessionEntity> {
    const session = await this.sessionRepo.findById(dto.sessionId);
    if (!session) throw new InterviewNotFoundError();

    const updated = await this.sessionRepo.saveEvaluation({
      sessionId: dto.sessionId,
      overallScore:
        dto.overallScore !== undefined
          ? dto.overallScore
          : session.overallScore || 0,
      outcome: session.outcome,
      summaryFeedback: dto.summaryFeedback || session.summaryFeedback || undefined,
      strengths: dto.strengths || session.strengths,
      improvements: dto.improvements || session.improvements,
      criteriaScores: dto.criteriaScores,
    });

    await this.sessionRepo.recordAuditLog({
      sessionId: dto.sessionId,
      actorId: dto.adminId,
      action: "EVALUATION_ADJUSTED",
      previousState: {
        overallScore: session.overallScore,
        summaryFeedback: session.summaryFeedback,
      },
      newState: {
        overallScore: updated.overallScore,
        summaryFeedback: updated.summaryFeedback,
      },
      note: dto.adminNote || "Admin adjusted scores and criteria breakdown",
    });

    return updated;
  }

  async getSessionAudit(sessionId: string): Promise<InterviewAuditLogEntity[]> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new InterviewNotFoundError();
    return this.sessionRepo.getAuditLogs(sessionId);
  }

  // 2. Template Management
  async createTemplate(
    dto: CreateInterviewTemplateDto
  ): Promise<InterviewTemplateEntity> {
    return this.templateRepo.create(dto);
  }

  async getTemplates(
    query: AdminListTemplatesQueryDto
  ): Promise<{ templates: InterviewTemplateEntity[]; total: number }> {
    return this.templateRepo.findAdminAll(query);
  }

  async getTemplateById(id: string): Promise<InterviewTemplateEntity> {
    const template = await this.templateRepo.findById(id);
    if (!template) throw new TemplateNotFoundError();
    return template;
  }

  async updateTemplate(
    id: string,
    dto: UpdateInterviewTemplateDto
  ): Promise<InterviewTemplateEntity> {
    const template = await this.templateRepo.findById(id);
    if (!template) throw new TemplateNotFoundError();
    return this.templateRepo.update(id, dto);
  }

  async toggleTemplateStatus(
    id: string,
    isActive: boolean
  ): Promise<InterviewTemplateEntity> {
    const template = await this.templateRepo.findById(id);
    if (!template) throw new TemplateNotFoundError();
    return this.templateRepo.toggleStatus(id, isActive);
  }

  async getTemplateVersions(
    templateId: string
  ): Promise<InterviewTemplateVersionEntity[]> {
    const template = await this.templateRepo.findById(templateId);
    if (!template) throw new TemplateNotFoundError();
    return this.templateRepo.getVersions(templateId);
  }

  // 3. Analytics
  async getAnalyticsOverview(
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsOverviewDto> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsRepo.getOverviewMetrics(start, end);
  }

  async getAnalyticsTimeseries(
    days: number = 30
  ): Promise<AnalyticsTimeseriesPointDto[]> {
    return this.analyticsRepo.getTimeseriesMetrics(days);
  }

  async getTemplateAnalytics(templateId: string) {
    const template = await this.templateRepo.findById(templateId);
    if (!template) throw new TemplateNotFoundError();
    return this.analyticsRepo.getTemplateMetrics(templateId);
  }
}
