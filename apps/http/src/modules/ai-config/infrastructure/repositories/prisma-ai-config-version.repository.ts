import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { IAIConfigVersionRepository } from "../../domain/repositories/ai-config.repository.interfaces";
import { AIConfigVersionEntity } from "../../domain/entities/ai-config.entities";

export class PrismaAIConfigVersionRepository implements IAIConfigVersionRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  private includeGraph = {
    agentConfigs: {
      include: {
        model: { include: { provider: true } },
        credential: { include: { provider: true } },
        fallbackConfigs: {
          include: {
            model: { include: { provider: true } },
            credential: { include: { provider: true } },
          },
          orderBy: { priority: "asc" },
        },
      },
      orderBy: { agentType: "asc" },
    },
  };

  async findById(id: string): Promise<AIConfigVersionEntity | null> {
    const v = await (this.prisma as any).aIConfigVersion.findUnique({
      where: { id },
      include: this.includeGraph,
    });
    return v ? (v as AIConfigVersionEntity) : null;
  }

  async findByVersion(version: number): Promise<AIConfigVersionEntity | null> {
    const v = await (this.prisma as any).aIConfigVersion.findUnique({
      where: { version },
      include: this.includeGraph,
    });
    return v ? (v as AIConfigVersionEntity) : null;
  }

  async findPublished(): Promise<AIConfigVersionEntity | null> {
    const v = await (this.prisma as any).aIConfigVersion.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { version: "desc" },
      include: this.includeGraph,
    });
    return v ? (v as AIConfigVersionEntity) : null;
  }

  async findDraft(): Promise<AIConfigVersionEntity | null> {
    const v = await (this.prisma as any).aIConfigVersion.findFirst({
      where: { status: "DRAFT" },
      orderBy: { version: "desc" },
      include: this.includeGraph,
    });
    return v ? (v as AIConfigVersionEntity) : null;
  }

  async findAll(): Promise<AIConfigVersionEntity[]> {
    const list = await (this.prisma as any).aIConfigVersion.findMany({
      orderBy: { version: "desc" },
      include: this.includeGraph,
    });
    return list as AIConfigVersionEntity[];
  }

  async getNextVersionNumber(): Promise<number> {
    const latest = await (this.prisma as any).aIConfigVersion.findFirst({
      orderBy: { version: "desc" },
      select: { version: true },
    });
    return latest ? latest.version + 1 : 1;
  }

  async createVersion(data: {
    version: number;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    name?: string;
    description?: string;
    publishedBy?: string;
  }): Promise<AIConfigVersionEntity> {
    const created = await (this.prisma as any).aIConfigVersion.create({
      data: {
        version: data.version,
        status: data.status,
        name: data.name || `Config v${data.version}`,
        description: data.description || undefined,
        publishedBy: data.publishedBy || undefined,
        publishedAt: data.status === "PUBLISHED" ? new Date() : undefined,
      },
      include: this.includeGraph,
    });
    return created as AIConfigVersionEntity;
  }

  async saveDraftAgentConfigs(
    versionId: string,
    configs: Array<{
      agentType: string;
      modelId: string;
      credentialId: string;
      enabled?: boolean;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
      customConfig?: Record<string, any>;
      fallbacks?: Array<{
        priority: number;
        modelId: string;
        credentialId: string;
        temperature?: number;
        customConfig?: Record<string, any>;
      }>;
    }>
  ): Promise<AIConfigVersionEntity> {
    await this.prisma.$transaction(async (tx: any) => {
      // 1. Delete existing agent configs for this draft version
      await tx.agentConfig.deleteMany({
        where: { versionId },
      });

      // 2. Insert new agent configs and their fallbacks
      for (const cfg of configs) {
        const agent = await tx.agentConfig.create({
          data: {
            versionId,
            agentType: cfg.agentType,
            modelId: cfg.modelId,
            credentialId: cfg.credentialId,
            enabled: cfg.enabled !== undefined ? cfg.enabled : true,
            temperature: cfg.temperature !== undefined ? cfg.temperature : 0.2,
            maxTokens: cfg.maxTokens || 2048,
            systemPrompt: cfg.systemPrompt || undefined,
            customConfig: cfg.customConfig || undefined,
          },
        });

        if (cfg.fallbacks && cfg.fallbacks.length > 0) {
          for (const fb of cfg.fallbacks) {
            await tx.agentFallbackConfig.create({
              data: {
                agentConfigId: agent.id,
                priority: fb.priority,
                modelId: fb.modelId,
                credentialId: fb.credentialId,
                temperature: fb.temperature || undefined,
                customConfig: fb.customConfig || undefined,
              },
            });
          }
        }
      }
    });

    return (await this.findById(versionId))!;
  }

  async publishVersion(versionId: string, adminUserId: string): Promise<AIConfigVersionEntity> {
    return await this.prisma.$transaction(async (tx: any) => {
      // 1. Archive previously published versions
      await tx.aIConfigVersion.updateMany({
        where: { status: "PUBLISHED" },
        data: {
          status: "ARCHIVED",
          archivedAt: new Date(),
        },
      });

      // 2. Promote target version to PUBLISHED
      const published = await tx.aIConfigVersion.update({
        where: { id: versionId },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          publishedBy: adminUserId,
        },
        include: this.includeGraph,
      });

      return published as AIConfigVersionEntity;
    });
  }

  async rollbackToVersion(targetVersionId: string, adminUserId: string): Promise<AIConfigVersionEntity> {
    const target = await this.findById(targetVersionId);
    if (!target) {
      throw new Error(`Target configuration version "${targetVersionId}" not found for rollback.`);
    }

    // Rollback creates a new version duplicating target's config and publishes it
    const nextVersionNum = await this.getNextVersionNumber();

    return await this.prisma.$transaction(async (tx: any) => {
      // Archive current published
      await tx.aIConfigVersion.updateMany({
        where: { status: "PUBLISHED" },
        data: {
          status: "ARCHIVED",
          archivedAt: new Date(),
        },
      });

      // Create new published version cloned from target
      const newVersion = await tx.aIConfigVersion.create({
        data: {
          version: nextVersionNum,
          status: "PUBLISHED",
          name: `Rollback to v${target.version} (${target.name || "Historical"})`,
          description: `Rolled back from version ${target.version} by admin ${adminUserId}`,
          publishedAt: new Date(),
          publishedBy: adminUserId,
        },
      });

      // Clone agent configs
      if (target.agentConfigs) {
        for (const ac of target.agentConfigs) {
          const newAc = await tx.agentConfig.create({
            data: {
              versionId: newVersion.id,
              agentType: ac.agentType,
              modelId: ac.modelId,
              credentialId: ac.credentialId,
              enabled: ac.enabled,
              temperature: ac.temperature,
              maxTokens: ac.maxTokens,
              systemPrompt: ac.systemPrompt,
              customConfig: ac.customConfig,
            },
          });

          if (ac.fallbackConfigs) {
            for (const fb of ac.fallbackConfigs) {
              await tx.agentFallbackConfig.create({
                data: {
                  agentConfigId: newAc.id,
                  priority: fb.priority,
                  modelId: fb.modelId,
                  credentialId: fb.credentialId,
                  temperature: fb.temperature,
                  customConfig: fb.customConfig,
                },
              });
            }
          }
        }
      }

      const result = await tx.aIConfigVersion.findUnique({
        where: { id: newVersion.id },
        include: this.includeGraph,
      });

      return result as AIConfigVersionEntity;
    });
  }
}
