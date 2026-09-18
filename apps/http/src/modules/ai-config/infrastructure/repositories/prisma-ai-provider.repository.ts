import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { IAIProviderRepository } from "../../domain/repositories/ai-config.repository.interfaces";
import { AIProviderEntity } from "../../domain/entities/ai-config.entities";

export class PrismaAIProviderRepository implements IAIProviderRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async findById(id: string): Promise<AIProviderEntity | null> {
    const p = await (this.prisma as any).aIProvider.findUnique({
      where: { id },
    });
    return p ? (p as AIProviderEntity) : null;
  }

  async findBySlug(slug: string): Promise<AIProviderEntity | null> {
    const p = await (this.prisma as any).aIProvider.findUnique({
      where: { slug },
    });
    return p ? (p as AIProviderEntity) : null;
  }

  async findAll(): Promise<AIProviderEntity[]> {
    const list = await (this.prisma as any).aIProvider.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { models: true, credentials: true },
        },
      },
    });
    return list as AIProviderEntity[];
  }

  async create(
    data: Omit<AIProviderEntity, "id" | "createdAt" | "updatedAt">
  ): Promise<AIProviderEntity> {
    const created = await (this.prisma as any).aIProvider.create({
      data: {
        slug: data.slug,
        name: data.name,
        type: data.type,
        status: data.status || "ACTIVE",
        metadata: data.metadata || undefined,
      },
    });
    return created as AIProviderEntity;
  }

  async update(id: string, data: Partial<AIProviderEntity>): Promise<AIProviderEntity> {
    const updated = await (this.prisma as any).aIProvider.update({
      where: { id },
      data: {
        name: data.name,
        status: data.status as any,
        metadata: data.metadata !== undefined ? data.metadata : undefined,
      },
    });
    return updated as AIProviderEntity;
  }
}
