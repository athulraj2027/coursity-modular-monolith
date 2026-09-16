import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { IInterviewSessionRepository } from "../../domain/repositories/interview-session.repository.interface";
import {
  InterviewAuditLogEntity,
  InterviewSessionEntity,
  InterviewStatus,
} from "../../domain/entities/interview.entity";
import {
  AdminListSessionsQueryDto,
} from "../../domain/dtos/admin-interview.dto";
import { CandidateListSessionsQueryDto } from "../../domain/dtos/candidate-interview.dto";

export class PrismaInterviewSessionRepository
  implements IInterviewSessionRepository
{
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async create(data: {
    userId: string;
    teacherProfileId?: string | null;
    templateId?: string | null;
    type: string;
    domain?: string | null;
    difficulty: string;
    status: InterviewStatus;
  }): Promise<InterviewSessionEntity> {
    const session = await (this.prisma as any).interviewSession.create({
      data: {
        userId: data.userId,
        teacherProfileId: data.teacherProfileId,
        templateId: data.templateId,
        type: data.type as any,
        domain: data.domain,
        difficulty: data.difficulty as any,
        status: data.status as any,
      },
      include: {
        template: true,
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return this.mapToEntity(session);
  }

  async findById(id: string): Promise<InterviewSessionEntity | null> {
    const session = await (this.prisma as any).interviewSession.findUnique({
      where: { id },
      include: {
        template: true,
        criteriaScores: true,
        transcripts: {
          orderBy: { sequenceOrder: "asc" },
        },
        auditLogs: {
          orderBy: { createdAt: "desc" },
        },
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!session) return null;
    return this.mapToEntity(session);
  }

  async findByUserId(
    query: CandidateListSessionsQueryDto
  ): Promise<{ sessions: InterviewSessionEntity[]; total: number }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {
      userId: query.userId,
    };

    if (query.type) {
      where.type = query.type;
    }
    if (query.status) {
      where.status = query.status;
    }

    const [records, total] = await Promise.all([
      (this.prisma as any).interviewSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          template: true,
          criteriaScores: true,
        },
      }),
      (this.prisma as any).interviewSession.count({ where }),
    ]);

    return {
      sessions: records.map((r: any) => this.mapToEntity(r)),
      total,
    };
  }

  async findAdminAll(
    query: AdminListSessionsQueryDto
  ): Promise<{ sessions: InterviewSessionEntity[]; total: number }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.outcome) {
      where.outcome = query.outcome;
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.difficulty) {
      where.difficulty = query.difficulty;
    }
    if (query.templateId) {
      where.templateId = query.templateId;
    }
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }
    if (query.search) {
      where.OR = [
        { user: { name: { contains: query.search, mode: "insensitive" } } },
        { user: { email: { contains: query.search, mode: "insensitive" } } },
        { domain: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [records, total] = await Promise.all([
      (this.prisma as any).interviewSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          template: true,
          criteriaScores: true,
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      (this.prisma as any).interviewSession.count({ where }),
    ]);

    return {
      sessions: records.map((r: any) => this.mapToEntity(r)),
      total,
    };
  }

  async updateStatus(
    id: string,
    status: InterviewStatus,
    extra?: Partial<InterviewSessionEntity>
  ): Promise<InterviewSessionEntity> {
    const updateData: any = {
      status,
      ...extra,
    };

    const session = await (this.prisma as any).interviewSession.update({
      where: { id },
      data: updateData,
      include: {
        template: true,
        criteriaScores: true,
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return this.mapToEntity(session);
  }

  async updateSession(
    id: string,
    data: Partial<InterviewSessionEntity>
  ): Promise<InterviewSessionEntity> {
    const session = await (this.prisma as any).interviewSession.update({
      where: { id },
      data: data as any,
      include: {
        template: true,
        criteriaScores: true,
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return this.mapToEntity(session);
  }

  async recordAuditLog(data: {
    sessionId: string;
    actorId?: string | null;
    action: string;
    previousState?: any;
    newState?: any;
    note?: string | null;
  }): Promise<InterviewAuditLogEntity> {
    const log = await (this.prisma as any).interviewAuditLog.create({
      data: {
        sessionId: data.sessionId,
        actorId: data.actorId,
        action: data.action,
        previousState: data.previousState,
        newState: data.newState,
        note: data.note,
      },
    });

    return {
      id: log.id,
      sessionId: log.sessionId,
      actorId: log.actorId,
      action: log.action,
      previousState: log.previousState,
      newState: log.newState,
      note: log.note,
      createdAt: log.createdAt,
    };
  }

  async getAuditLogs(sessionId: string): Promise<InterviewAuditLogEntity[]> {
    const logs = await (this.prisma as any).interviewAuditLog.findMany({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
    });

    return logs.map((log: any) => ({
      id: log.id,
      sessionId: log.sessionId,
      actorId: log.actorId,
      action: log.action,
      previousState: log.previousState,
      newState: log.newState,
      note: log.note,
      createdAt: log.createdAt,
    }));
  }

  async saveEvaluation(data: {
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
  }): Promise<InterviewSessionEntity> {
    const result = await (this.prisma as any).$transaction(async (tx: any) => {
      if (data.criteriaScores && data.criteriaScores.length > 0) {
        await tx.interviewScore.deleteMany({
          where: { sessionId: data.sessionId },
        });

        await tx.interviewScore.createMany({
          data: data.criteriaScores.map((c) => ({
            sessionId: data.sessionId,
            criterion: c.criterion,
            score: c.score,
            maxScore: c.maxScore ?? 100,
            weight: c.weight ?? 1.0,
            feedback: c.feedback,
          })),
        });
      }

      const updatedSession = await tx.interviewSession.update({
        where: { id: data.sessionId },
        data: {
          status: "EVALUATED",
          overallScore: data.overallScore,
          outcome: data.outcome as any,
          summaryFeedback: data.summaryFeedback,
          strengths: data.strengths || [],
          improvements: data.improvements || [],
          recordingUrl: data.recordingUrl,
          endedAt: new Date(),
        },
        include: {
          template: true,
          criteriaScores: true,
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      // Also update TeacherProfile if attached and outcome is set
      if (updatedSession.teacherProfileId) {
        await tx.teacherProfile.update({
          where: { id: updatedSession.teacherProfileId },
          data: {
            isInterviewPassed: data.outcome === "PASSED",
            interviewScore: data.overallScore,
            interviewFeedback: data.summaryFeedback,
            lastInterviewAt: new Date(),
            interviewAttempts: {
              increment: 1,
            },
          },
        });
      }

      return updatedSession;
    });

    return this.mapToEntity(result);
  }

  private mapToEntity(raw: any): InterviewSessionEntity {
    return {
      id: raw.id,
      userId: raw.userId,
      teacherProfileId: raw.teacherProfileId,
      templateId: raw.templateId,
      type: raw.type,
      status: raw.status,
      difficulty: raw.difficulty,
      domain: raw.domain,
      scheduledAt: raw.scheduledAt,
      startedAt: raw.startedAt,
      endedAt: raw.endedAt,
      durationSeconds: raw.durationSeconds,
      overallScore: raw.overallScore ? Number(raw.overallScore) : null,
      outcome: raw.outcome,
      summaryFeedback: raw.summaryFeedback,
      strengths: raw.strengths || [],
      improvements: raw.improvements || [],
      recordingUrl: raw.recordingUrl,
      livekitRoomSid: raw.livekitRoomSid,
      meta: raw.meta,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      template: raw.template ? { ...raw.template } : null,
      criteriaScores: raw.criteriaScores
        ? raw.criteriaScores.map((c: any) => ({
            id: c.id,
            sessionId: c.sessionId,
            criterion: c.criterion,
            score: Number(c.score),
            maxScore: Number(c.maxScore),
            weight: Number(c.weight),
            feedback: c.feedback,
            createdAt: c.createdAt,
          }))
        : [],
      transcripts: raw.transcripts
        ? raw.transcripts.map((t: any) => ({
            id: t.id,
            sessionId: t.sessionId,
            role: t.role,
            content: t.content,
            audioUrl: t.audioUrl,
            sequenceOrder: t.sequenceOrder,
            durationMs: t.durationMs,
            sentiment: t.sentiment,
            turnFeedback: t.turnFeedback,
            createdAt: t.createdAt,
          }))
        : [],
      auditLogs: raw.auditLogs ? raw.auditLogs : [],
      user: raw.user || null,
    };
  }
}
