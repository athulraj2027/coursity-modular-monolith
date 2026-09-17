import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { IAIAuditLogRepository } from "../../domain/repositories/ai-config.repository.interfaces";
import { AIAuditLogEntity } from "../../domain/entities/ai-config.entities";

export class PrismaAIAuditLogRepository implements IAIAuditLogRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async create(data: Omit<AIAuditLogEntity, "id" | "createdAt">): Promise<AIAuditLogEntity> {
    const created = await (this.prisma as any).aIAuditLog.create({
      data: {
        actorId: data.actorId || undefined,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        versionId: data.versionId || undefined,
        metadata: data.metadata || undefined,
      },
    });
    return created as AIAuditLogEntity;
  }

  async findAll(limit: number = 50): Promise<AIAuditLogEntity[]> {
    const list = await (this.prisma as any).aIAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        version: { select: { version: true, name: true } },
      },
    });
    return list as AIAuditLogEntity[];
  }
}
