import {
  IAIConfigVersionRepository,
  IAIAuditLogRepository,
} from "../../domain/repositories/ai-config.repository.interfaces";
import { SaveDraftConfigDto } from "../dtos/ai-config.dtos";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class ManageConfigVersionUseCase {
  constructor(
    private readonly versionRepo: IAIConfigVersionRepository,
    private readonly auditRepo: IAIAuditLogRepository
  ) {}

  async getActiveAndDraft() {
    const published = await this.versionRepo.findPublished();
    const draft = await this.versionRepo.findDraft();

    return {
      published,
      draft,
    };
  }

  async listVersions() {
    return await this.versionRepo.findAll();
  }

  async listAuditLogs(limit: number = 50) {
    return await this.auditRepo.findAll(limit);
  }

  async saveDraft(dto: SaveDraftConfigDto, adminUserId: string) {
    let draft = await this.versionRepo.findDraft();

    if (!draft) {
      const nextVer = await this.versionRepo.getNextVersionNumber();
      draft = await this.versionRepo.createVersion({
        version: nextVer,
        status: "DRAFT",
        name: dto.name || `Draft v${nextVer}`,
        description: dto.description || "In-progress draft configuration",
      });
    }

    // Save agent configs & fallbacks for this draft
    const updatedDraft = await this.versionRepo.saveDraftAgentConfigs(
      draft.id,
      dto.agentConfigs as any
    );

    await this.auditRepo.create({
      actorId: adminUserId,
      action: "CONFIG_DRAFT_UPDATED",
      resourceType: "CONFIG_VERSION",
      resourceId: updatedDraft.id,
      versionId: updatedDraft.id,
      metadata: { version: updatedDraft.version, agentsCount: dto.agentConfigs.length },
    });

    return updatedDraft;
  }

  async publish(versionId: string, adminUserId: string) {
    const target = await this.versionRepo.findById(versionId);
    if (!target) {
      throw new NotFoundError(`Config Version "${versionId}" not found.`);
    }

    if (target.status === "PUBLISHED") {
      throw new BadRequestError(`Config Version v${target.version} is already published.`);
    }

    const published = await this.versionRepo.publishVersion(versionId, adminUserId);

    await this.auditRepo.create({
      actorId: adminUserId,
      action: "CONFIG_PUBLISHED",
      resourceType: "CONFIG_VERSION",
      resourceId: published.id,
      versionId: published.id,
      metadata: { version: published.version, name: published.name },
    });

    return published;
  }

  async rollback(targetVersionId: string, adminUserId: string) {
    const target = await this.versionRepo.findById(targetVersionId);
    if (!target) {
      throw new NotFoundError(`Target Config Version "${targetVersionId}" not found for rollback.`);
    }

    const newPublished = await this.versionRepo.rollbackToVersion(targetVersionId, adminUserId);

    await this.auditRepo.create({
      actorId: adminUserId,
      action: "CONFIG_ROLLED_BACK",
      resourceType: "CONFIG_VERSION",
      resourceId: newPublished.id,
      versionId: newPublished.id,
      metadata: {
        fromTargetVersion: target.version,
        newVersion: newPublished.version,
      },
    });

    return newPublished;
  }
}
