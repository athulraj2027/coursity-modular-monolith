import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { IAIModelRepository } from "../../domain/repositories/ai-config.repository.interfaces";
import { AIModelEntity } from "../../domain/entities/ai-config.entities";

export class PrismaAIModelRepository implements IAIModelRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async findById(id: string): Promise<AIModelEntity | null> {
    const m = await (this.prisma as any).aIModel.findUnique({
      where: { id },
      include: { provider: true },
    });
    return m ? (m as AIModelEntity) : null;
  }

  async findByProviderAndModelId(providerId: string, modelId: string): Promise<AIModelEntity | null> {
    const m = await (this.prisma as any).aIModel.findUnique({
      where: {
        providerId_modelId: {
          providerId,
          modelId,
        },
      },
    });
    return m ? (m as AIModelEntity) : null;
  }

  async findAll(filters?: { providerId?: string; type?: string }): Promise<AIModelEntity[]> {
    const where: any = {};
    if (filters?.providerId) {
      where.providerId = filters.providerId;
    }
    if (filters?.type) {
      where.type = filters.type;
    }

    const list = await (this.prisma as any).aIModel.findMany({
      where,
      include: { provider: true },
      orderBy: { name: "asc" },
    });
    return list as AIModelEntity[];
  }

  async create(data: Omit<AIModelEntity, "id" | "createdAt" | "updatedAt">): Promise<AIModelEntity> {
    const created = await (this.prisma as any).aIModel.create({
      data: {
        providerId: data.providerId,
        name: data.name,
        modelId: data.modelId,
        type: data.type,
        status: data.status || "ACTIVE",
        metadata: data.metadata || undefined,
      },
      include: { provider: true },
    });
    return created as AIModelEntity;
  }

  async update(id: string, data: Partial<AIModelEntity>): Promise<AIModelEntity> {
    const updated = await (this.prisma as any).aIModel.update({
      where: { id },
      data: {
        name: data.name,
        status: data.status as any,
        metadata: data.metadata !== undefined ? data.metadata : undefined,
      },
      include: { provider: true },
    });
    return updated as AIModelEntity;
  }
}
