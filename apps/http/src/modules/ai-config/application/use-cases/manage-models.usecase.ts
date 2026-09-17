import {
  IAIModelRepository,
  IAIProviderRepository,
  IAIAuditLogRepository,
} from "../../domain/repositories/ai-config.repository.interfaces";
import { CreateAIModelDto, UpdateAIModelDto } from "../dtos/ai-config.dtos";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class ManageModelsUseCase {
  constructor(
    private readonly modelRepo: IAIModelRepository,
    private readonly providerRepo: IAIProviderRepository,
    private readonly auditRepo: IAIAuditLogRepository
  ) {}

  async listModels(filters?: { providerId?: string; type?: string }) {
    return await this.modelRepo.findAll(filters);
  }

  async getModelById(id: string) {
    const model = await this.modelRepo.findById(id);
    if (!model) {
      throw new NotFoundError(`AI Model "${id}" not found.`);
    }
    return model;
  }

  async createModel(dto: CreateAIModelDto, adminUserId: string) {
    const provider = await this.providerRepo.findById(dto.providerId);
    if (!provider) {
      throw new NotFoundError(`AI Provider "${dto.providerId}" not found.`);
    }

    const existing = await this.modelRepo.findByProviderAndModelId(dto.providerId, dto.modelId.trim());
    if (existing) {
      throw new BadRequestError(
        `Model "${dto.modelId}" is already registered for provider "${provider.name}".`
      );
    }

    const model = await this.modelRepo.create({
      providerId: dto.providerId,
      name: dto.name.trim(),
      modelId: dto.modelId.trim(),
      type: dto.type || provider.type,
      status: dto.status || "ACTIVE",
      metadata: dto.metadata || null,
    });

    await this.auditRepo.create({
      actorId: adminUserId,
      action: "MODEL_CREATED",
      resourceType: "MODEL",
      resourceId: model.id,
      metadata: { modelId: model.modelId, name: model.name, providerId: model.providerId },
    });

    return model;
  }

  async updateModel(id: string, dto: UpdateAIModelDto, adminUserId: string) {
    const existing = await this.modelRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`AI Model "${id}" not found.`);
    }

    const updated = await this.modelRepo.update(id, dto);

    await this.auditRepo.create({
      actorId: adminUserId,
      action: "MODEL_UPDATED",
      resourceType: "MODEL",
      resourceId: updated.id,
      metadata: { previous: { name: existing.name, status: existing.status }, updated: dto },
    });

    return updated;
  }
}
