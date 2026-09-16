import {
  InterviewAccessDeniedError,
  InterviewNotFoundError,
  InvalidInterviewStateError,
  TemplateNotFoundError,
} from "../../domain/errors/interview.error";
import { IInterviewSessionRepository } from "../../domain/repositories/interview-session.repository.interface";
import { IInterviewTemplateRepository } from "../../domain/repositories/interview-template.repository.interface";
import { IInterviewTranscriptRepository } from "../../domain/repositories/interview-transcript.repository.interface";
import { RealtimeTokenService } from "../../infrastructure/services/realtime-token.service";
import {
  CandidateListSessionsQueryDto,
  CreateInterviewSessionDto,
  RealtimeTokenDto,
} from "../../domain/dtos/candidate-interview.dto";
import {
  InterviewSessionEntity,
  InterviewTemplateEntity,
  InterviewTranscriptEntity,
} from "../../domain/entities/interview.entity";

export class CandidateInterviewUseCases {
  constructor(
    private readonly sessionRepo: IInterviewSessionRepository,
    private readonly templateRepo: IInterviewTemplateRepository,
    private readonly transcriptRepo: IInterviewTranscriptRepository,
    private readonly tokenService: RealtimeTokenService
  ) {}

  async getActiveTemplates(query?: {
    domain?: string;
    difficulty?: string;
    type?: string;
  }): Promise<InterviewTemplateEntity[]> {
    return this.templateRepo.findActive(query);
  }

  async getTemplateBySlug(slug: string): Promise<InterviewTemplateEntity> {
    const template = await this.templateRepo.findBySlug(slug);
    if (!template || !template.isActive) {
      throw new TemplateNotFoundError("Interview template not found or inactive");
    }
    return template;
  }

  async createSession(
    dto: CreateInterviewSessionDto
  ): Promise<InterviewSessionEntity> {
    let type = dto.type || "TEACHER_VETTING";
    let difficulty = dto.difficulty || "INTERMEDIATE";
    let domain = dto.domain || "General";
    let templateId = dto.templateId;

    if (templateId) {
      const template = await this.templateRepo.findById(templateId);
      if (!template || !template.isActive) {
        throw new TemplateNotFoundError("Selected interview template is invalid or inactive");
      }
      type = template.type;
      difficulty = template.difficulty;
      domain = template.domain;
    }

    const session = await this.sessionRepo.create({
      userId: dto.userId,
      templateId,
      type,
      domain,
      difficulty,
      status: "INITIALIZING",
    });

    await this.sessionRepo.recordAuditLog({
      sessionId: session.id,
      actorId: dto.userId,
      action: "SESSION_CREATED",
      newState: { status: "INITIALIZING", domain, difficulty, type },
      note: "Candidate booked interview session",
    });

    return session;
  }

  async getSession(
    sessionId: string,
    userId: string,
    userRole: string
  ): Promise<InterviewSessionEntity> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) {
      throw new InterviewNotFoundError();
    }

    if (session.userId !== userId && userRole !== "ADMIN") {
      throw new InterviewAccessDeniedError();
    }

    return session;
  }

  async startSession(
    sessionId: string,
    userId: string
  ): Promise<InterviewSessionEntity> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new InterviewNotFoundError();
    if (session.userId !== userId) throw new InterviewAccessDeniedError();

    if (session.status !== "INITIALIZING" && session.status !== "IN_PROGRESS") {
      throw new InvalidInterviewStateError(
        `Cannot start interview from state ${session.status}`
      );
    }

    const updated = await this.sessionRepo.updateStatus(sessionId, "IN_PROGRESS", {
      startedAt: session.startedAt || new Date(),
    });

    await this.sessionRepo.recordAuditLog({
      sessionId,
      actorId: userId,
      action: "SESSION_STARTED",
      previousState: { status: session.status },
      newState: { status: "IN_PROGRESS" },
      note: "Candidate started the interview",
    });

    return updated;
  }

  async generateRealtimeToken(
    sessionId: string,
    userId: string,
    userName: string
  ): Promise<RealtimeTokenDto> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new InterviewNotFoundError();
    if (session.userId !== userId) throw new InterviewAccessDeniedError();

    if (
      session.status !== "INITIALIZING" &&
      session.status !== "IN_PROGRESS"
    ) {
      throw new InvalidInterviewStateError(
        `Realtime token can only be issued for active sessions (current status: ${session.status})`
      );
    }

    return this.tokenService.generateToken({
      sessionId,
      userId,
      userName: userName || "Candidate",
      role: "candidate",
    });
  }

  async getTranscripts(
    sessionId: string,
    userId: string,
    userRole: string
  ): Promise<InterviewTranscriptEntity[]> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new InterviewNotFoundError();
    if (session.userId !== userId && userRole !== "ADMIN") {
      throw new InterviewAccessDeniedError();
    }

    return this.transcriptRepo.findBySessionId(sessionId);
  }

  async getLatestTranscripts(
    sessionId: string,
    userId: string,
    limit: number = 5
  ): Promise<InterviewTranscriptEntity[]> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new InterviewNotFoundError();
    if (session.userId !== userId) throw new InterviewAccessDeniedError();

    return this.transcriptRepo.getLatestTurns(sessionId, limit);
  }

  async completeSession(
    sessionId: string,
    userId: string
  ): Promise<InterviewSessionEntity> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new InterviewNotFoundError();
    if (session.userId !== userId) throw new InterviewAccessDeniedError();

    if (session.status !== "IN_PROGRESS" && session.status !== "INITIALIZING") {
      throw new InvalidInterviewStateError(
        `Cannot complete session with status ${session.status}`
      );
    }

    const endedAt = new Date();
    const durationSeconds = session.startedAt
      ? Math.round((endedAt.getTime() - new Date(session.startedAt).getTime()) / 1000)
      : session.durationSeconds || 0;

    const updated = await this.sessionRepo.updateStatus(sessionId, "EVALUATING", {
      endedAt,
      durationSeconds,
    });

    await this.sessionRepo.recordAuditLog({
      sessionId,
      actorId: userId,
      action: "SESSION_COMPLETED_BY_CANDIDATE",
      previousState: { status: session.status },
      newState: { status: "EVALUATING", durationSeconds },
      note: "Candidate submitted the interview for evaluation",
    });

    return updated;
  }

  async cancelSession(
    sessionId: string,
    userId: string,
    reason?: string
  ): Promise<InterviewSessionEntity> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new InterviewNotFoundError();
    if (session.userId !== userId) throw new InterviewAccessDeniedError();

    if (session.status === "COMPLETED" || session.status === "EVALUATED") {
      throw new InvalidInterviewStateError("Cannot cancel a completed interview");
    }

    const updated = await this.sessionRepo.updateStatus(sessionId, "CANCELLED");

    await this.sessionRepo.recordAuditLog({
      sessionId,
      actorId: userId,
      action: "SESSION_CANCELLED",
      previousState: { status: session.status },
      newState: { status: "CANCELLED" },
      note: reason || "Cancelled by candidate",
    });

    return updated;
  }

  async getReport(
    sessionId: string,
    userId: string,
    userRole: string
  ): Promise<InterviewSessionEntity> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new InterviewNotFoundError();
    if (session.userId !== userId && userRole !== "ADMIN") {
      throw new InterviewAccessDeniedError();
    }

    return session;
  }

  async getRecordingUrl(
    sessionId: string,
    userId: string,
    userRole: string
  ): Promise<{ recordingUrl: string | null; isReady: boolean }> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new InterviewNotFoundError();
    if (session.userId !== userId && userRole !== "ADMIN") {
      throw new InterviewAccessDeniedError();
    }

    return {
      recordingUrl: session.recordingUrl || null,
      isReady: !!session.recordingUrl,
    };
  }

  async getMyInterviews(
    query: CandidateListSessionsQueryDto
  ): Promise<{ sessions: InterviewSessionEntity[]; total: number }> {
    return this.sessionRepo.findByUserId(query);
  }
}
