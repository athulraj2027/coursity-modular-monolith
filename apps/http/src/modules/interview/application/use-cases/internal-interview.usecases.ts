import { InterviewNotFoundError } from "../../domain/errors/interview.error";
import { IInterviewSessionRepository } from "../../domain/repositories/interview-session.repository.interface";
import { IInterviewTranscriptRepository } from "../../domain/repositories/interview-transcript.repository.interface";
import {
  InternalAbandonSessionDto,
  InternalAppendTranscriptDto,
  InternalEndSessionDto,
  InternalInitializeSessionDto,
  InternalStartSessionDto,
  InternalUpdateMetadataDto,
} from "../../domain/dtos/internal-interview.dto";
import {
  InterviewSessionEntity,
  InterviewTranscriptEntity,
} from "../../domain/entities/interview.entity";

export class InternalInterviewUseCases {
  constructor(
    private readonly sessionRepo: IInterviewSessionRepository,
    private readonly transcriptRepo: IInterviewTranscriptRepository
  ) {}

  async initializeSession(
    dto: InternalInitializeSessionDto
  ): Promise<InterviewSessionEntity> {
    const session = await this.sessionRepo.findById(dto.sessionId);
    if (!session) throw new InterviewNotFoundError();

    const updated = await this.sessionRepo.updateSession(dto.sessionId, {
      status: session.status === "INITIALIZING" ? "INITIALIZING" : session.status,
      livekitRoomSid: dto.livekitRoomSid || session.livekitRoomSid,
      meta: dto.meta
        ? { ...(session.meta || {}), ...dto.meta }
        : session.meta,
    });

    await this.sessionRepo.recordAuditLog({
      sessionId: dto.sessionId,
      actorId: "AI_SERVICE",
      action: "INTERNAL_SESSION_INITIALIZED",
      newState: { livekitRoomSid: dto.livekitRoomSid },
      note: "AI service initialized room context",
    });

    return updated;
  }

  async startSession(
    dto: InternalStartSessionDto
  ): Promise<InterviewSessionEntity> {
    const session = await this.sessionRepo.findById(dto.sessionId);
    if (!session) throw new InterviewNotFoundError();

    const startedAt = dto.startedAt || session.startedAt || new Date();

    const updated = await this.sessionRepo.updateStatus(
      dto.sessionId,
      "IN_PROGRESS",
      {
        startedAt,
        meta: dto.meta
          ? { ...(session.meta || {}), ...dto.meta }
          : session.meta,
      }
    );

    await this.sessionRepo.recordAuditLog({
      sessionId: dto.sessionId,
      actorId: "AI_SERVICE",
      action: "INTERNAL_SESSION_STARTED",
      newState: { status: "IN_PROGRESS", startedAt },
      note: "AI service connected to candidate voice stream",
    });

    return updated;
  }

  async endSession(dto: InternalEndSessionDto): Promise<InterviewSessionEntity> {
    const session = await this.sessionRepo.findById(dto.sessionId);
    if (!session) throw new InterviewNotFoundError();

    const endedAt = dto.endedAt || new Date();
    const durationSeconds =
      dto.durationSeconds !== undefined
        ? dto.durationSeconds
        : session.startedAt
        ? Math.round(
            (endedAt.getTime() - new Date(session.startedAt).getTime()) / 1000
          )
        : session.durationSeconds || 0;

    let outcome = dto.outcome || "NEEDS_HUMAN_REVIEW";
    const overallScore = dto.overallScore !== undefined ? dto.overallScore : 0;

    // Check passing score if template is attached and outcome was not explicitly set
    if (!dto.outcome && session.template) {
      outcome =
        overallScore >= session.template.passingScore ? "PASSED" : "FAILED";
    }

    const updated = await this.sessionRepo.saveEvaluation({
      sessionId: dto.sessionId,
      overallScore,
      outcome,
      summaryFeedback: dto.summaryFeedback,
      strengths: dto.strengths || [],
      improvements: dto.improvements || [],
      recordingUrl: dto.recordingUrl || session.recordingUrl || undefined,
      criteriaScores: dto.criteriaScores,
    });

    await this.sessionRepo.updateSession(dto.sessionId, {
      endedAt,
      durationSeconds,
      meta: dto.meta
        ? { ...(session.meta || {}), ...dto.meta }
        : session.meta,
    });

    await this.sessionRepo.recordAuditLog({
      sessionId: dto.sessionId,
      actorId: "AI_SERVICE",
      action: "INTERNAL_EVALUATION_SUBMITTED",
      newState: {
        status: "EVALUATED",
        overallScore,
        outcome,
        durationSeconds,
      },
      note: "AI service submitted final evaluation and criteria scores",
    });

    return updated;
  }

  async appendTranscript(
    dto: InternalAppendTranscriptDto
  ): Promise<InterviewTranscriptEntity> {
    const session = await this.sessionRepo.findById(dto.sessionId);
    if (!session) throw new InterviewNotFoundError();

    return this.transcriptRepo.appendTurn({
      sessionId: dto.sessionId,
      role: dto.role,
      content: dto.content,
      audioUrl: dto.audioUrl,
      sequenceOrder: dto.sequenceOrder,
      durationMs: dto.durationMs,
      sentiment: dto.sentiment,
      turnFeedback: dto.turnFeedback,
    });
  }

  async updateMetadata(
    dto: InternalUpdateMetadataDto
  ): Promise<InterviewSessionEntity> {
    const session = await this.sessionRepo.findById(dto.sessionId);
    if (!session) throw new InterviewNotFoundError();

    const mergedMeta = dto.meta
      ? { ...(session.meta || {}), ...dto.meta }
      : session.meta;

    return this.sessionRepo.updateSession(dto.sessionId, {
      livekitRoomSid: dto.livekitRoomSid || session.livekitRoomSid,
      recordingUrl: dto.recordingUrl || session.recordingUrl,
      meta: mergedMeta,
    });
  }

  async abandonSession(
    dto: InternalAbandonSessionDto
  ): Promise<InterviewSessionEntity> {
    const session = await this.sessionRepo.findById(dto.sessionId);
    if (!session) throw new InterviewNotFoundError();

    const updated = await this.sessionRepo.updateStatus(
      dto.sessionId,
      "ABANDONED"
    );

    await this.sessionRepo.recordAuditLog({
      sessionId: dto.sessionId,
      actorId: "AI_SERVICE",
      action: "INTERNAL_SESSION_ABANDONED",
      previousState: { status: session.status },
      newState: { status: "ABANDONED" },
      note: dto.reason || "Candidate disconnected or abandoned session",
    });

    return updated;
  }
}
