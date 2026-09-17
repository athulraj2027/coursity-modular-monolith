import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { IAICredentialRepository } from "../../domain/repositories/ai-config.repository.interfaces";
import { AICredentialEntity } from "../../domain/entities/ai-config.entities";

export class PrismaAICredentialRepository implements IAICredentialRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async findById(id: string): Promise<AICredentialEntity | null> {
    const c = await (this.prisma as any).aICredential.findUnique({
      where: { id },
      include: { provider: true },
    });
    return c ? (c as AICredentialEntity) : null;
  }

  async findBySecretReference(secretReference: string): Promise<AICredentialEntity | null> {
    const c = await (this.prisma as any).aICredential.findUnique({
      where: { secretReference },
      include: { provider: true },
    });
    return c ? (c as AICredentialEntity) : null;
  }

  async findAll(providerId?: string): Promise<AICredentialEntity[]> {
    const where = providerId ? { providerId } : {};
    const list = await (this.prisma as any).aICredential.findMany({
      where,
      include: { provider: true },
      orderBy: { createdAt: "desc" },
    });
    return list as AICredentialEntity[];
  }

  async create(data: Omit<AICredentialEntity, "id" | "createdAt" | "updatedAt">): Promise<AICredentialEntity> {
    const created = await (this.prisma as any).aICredential.create({
      data: {
        providerId: data.providerId,
        name: data.name,
        secretReference: data.secretReference,
        lastFour: data.lastFour,
        status: data.status || "ACTIVE",
        lastUsedAt: data.lastUsedAt || undefined,
        lastTestedAt: data.lastTestedAt || undefined,
        lastTestStatus: data.lastTestStatus || undefined,
        lastTestLatency: data.lastTestLatency || undefined,
      },
      include: { provider: true },
    });
    return created as AICredentialEntity;
  }

  async update(id: string, data: Partial<AICredentialEntity>): Promise<AICredentialEntity> {
    const updated = await (this.prisma as any).aICredential.update({
      where: { id },
      data: {
        name: data.name,
        secretReference: data.secretReference,
        lastFour: data.lastFour,
        status: data.status as any,
        lastUsedAt: data.lastUsedAt !== undefined ? data.lastUsedAt : undefined,
        lastTestedAt: data.lastTestedAt !== undefined ? data.lastTestedAt : undefined,
        lastTestStatus: data.lastTestStatus !== undefined ? data.lastTestStatus : undefined,
        lastTestLatency: data.lastTestLatency !== undefined ? data.lastTestLatency : undefined,
      },
      include: { provider: true },
    });
    return updated as AICredentialEntity;
  }

  async delete(id: string): Promise<void> {
    await (this.prisma as any).aICredential.delete({
      where: { id },
    });
  }
}
