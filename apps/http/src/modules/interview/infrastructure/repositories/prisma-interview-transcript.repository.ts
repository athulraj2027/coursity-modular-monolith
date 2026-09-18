import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { IInterviewTranscriptRepository } from "../../domain/repositories/interview-transcript.repository.interface";
import {
  InterviewTranscriptEntity,
  TranscriptRole,
} from "../../domain/entities/interview.entity";

export class PrismaInterviewTranscriptRepository
  implements IInterviewTranscriptRepository
{
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async appendTurn(data: {
    sessionId: string;
    role: TranscriptRole;
    content: string;
    audioUrl?: string | null;
    sequenceOrder?: number;
    durationMs?: number | null;
    sentiment?: string | null;
    turnFeedback?: string | null;
  }): Promise<InterviewTranscriptEntity> {
    let order = data.sequenceOrder;
    if (order === undefined || order === null) {
      const count = await (this.prisma as any).interviewTranscript.count({
        where: { sessionId: data.sessionId },
      });
      order = count + 1;
    }

    const transcript = await (this.prisma as any).interviewTranscript.create({
      data: {
        sessionId: data.sessionId,
        role: data.role as any,
        content: data.content,
        audioUrl: data.audioUrl,
        sequenceOrder: order,
        durationMs: data.durationMs,
        sentiment: data.sentiment,
        turnFeedback: data.turnFeedback,
      },
    });

    return this.mapToEntity(transcript);
  }

  async findBySessionId(sessionId: string): Promise<InterviewTranscriptEntity[]> {
    const transcripts = await (this.prisma as any).interviewTranscript.findMany({
      where: { sessionId },
      orderBy: { sequenceOrder: "asc" },
    });

    return transcripts.map((t: any) => this.mapToEntity(t));
  }

  async getLatestTurns(
    sessionId: string,
    limit: number = 5
  ): Promise<InterviewTranscriptEntity[]> {
    const transcripts = await (this.prisma as any).interviewTranscript.findMany({
      where: { sessionId },
      orderBy: { sequenceOrder: "desc" },
      take: limit,
    });

    return transcripts.reverse().map((t: any) => this.mapToEntity(t));
  }

  async countTurns(sessionId: string): Promise<number> {
    return await (this.prisma as any).interviewTranscript.count({
      where: { sessionId },
    });
  }

  private mapToEntity(raw: any): InterviewTranscriptEntity {
    return {
      id: raw.id,
      sessionId: raw.sessionId,
      role: raw.role,
      content: raw.content,
      audioUrl: raw.audioUrl,
      sequenceOrder: raw.sequenceOrder,
      durationMs: raw.durationMs,
      sentiment: raw.sentiment,
      turnFeedback: raw.turnFeedback,
      createdAt: raw.createdAt,
    };
  }
}
