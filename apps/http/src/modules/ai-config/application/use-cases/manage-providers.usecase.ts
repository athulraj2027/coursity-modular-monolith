import {
  IAIProviderRepository,
  IAIAuditLogRepository,
} from "../../domain/repositories/ai-config.repository.interfaces";
import { CreateAIProviderDto, UpdateAIProviderDto } from "../dtos/ai-config.dtos";
import { BadRequestError, NotFoundError } from "@/app/errors";

import { seedDefaultAIProviders } from "../../infrastructure/seed/default-ai-providers.seed";

export class ManageProvidersUseCase {
  constructor(
    private readonly providerRepo: IAIProviderRepository,
    private readonly auditRepo: IAIAuditLogRepository
  ) {}

  async listProviders() {
    let providers = await this.providerRepo.findAll();
    if (providers.length === 0) {
      await seedDefaultAIProviders();
      providers = await this.providerRepo.findAll();
    }
    return providers;
  }

  async getProviderById(id: string) {
    const provider = await this.providerRepo.findById(id);
    if (!provider) {
      throw new NotFoundError(`AI Provider "${id}" not found.`);
    }
    return provider;
  }

  async createProvider(dto: CreateAIProviderDto, adminUserId: string) {
    const existing = await this.providerRepo.findBySlug(dto.slug.toLowerCase().trim());
    if (existing) {
      throw new BadRequestError(`AI Provider with slug "${dto.slug}" already exists.`);
    }

    const provider = await this.providerRepo.create({
      slug: dto.slug.toLowerCase().trim(),
      name: dto.name.trim(),
      type: dto.type,
      status: dto.status || "ACTIVE",
      metadata: dto.metadata || null,
    });

    await this.auditRepo.create({
      actorId: adminUserId,
      action: "PROVIDER_CREATED",
      resourceType: "PROVIDER",
      resourceId: provider.id,
      metadata: { slug: provider.slug, name: provider.name, type: provider.type },
    });

    return provider;
  }

  async updateProvider(id: string, dto: UpdateAIProviderDto, adminUserId: string) {
    const existing = await this.providerRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`AI Provider "${id}" not found.`);
    }

    const updated = await this.providerRepo.update(id, dto);

    await this.auditRepo.create({
      actorId: adminUserId,
      action: "PROVIDER_UPDATED",
      resourceType: "PROVIDER",
      resourceId: updated.id,
      metadata: { previous: { name: existing.name, status: existing.status }, updated: dto },
    });

    return updated;
  }
}
