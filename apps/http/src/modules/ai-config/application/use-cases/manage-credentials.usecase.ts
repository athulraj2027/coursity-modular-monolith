import crypto from "crypto";
import {
  IAICredentialRepository,
  IAIProviderRepository,
  IAIAuditLogRepository,
} from "../../domain/repositories/ai-config.repository.interfaces";
import { ISecretsStorageService } from "../../domain/services/ai-config.services.interfaces";
import { CreateAICredentialDto, RotateAICredentialDto } from "../dtos/ai-config.dtos";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class ManageCredentialsUseCase {
  constructor(
    private readonly credentialRepo: IAICredentialRepository,
    private readonly providerRepo: IAIProviderRepository,
    private readonly secretsStorage: ISecretsStorageService,
    private readonly auditRepo: IAIAuditLogRepository
  ) {}

  async listCredentials(providerId?: string) {
    const list = await this.credentialRepo.findAll(providerId);
    // Return sanitized credentials (already masked in DB, no secret values)
    return list.map((c) => ({
      id: c.id,
      providerId: c.providerId,
      provider: (c as any).provider ? { id: (c as any).provider.id, name: (c as any).provider.name, slug: (c as any).provider.slug } : undefined,
      name: c.name,
      lastFour: c.lastFour,
      status: c.status,
      lastUsedAt: c.lastUsedAt,
      lastTestedAt: c.lastTestedAt,
      lastTestStatus: c.lastTestStatus,
      lastTestLatency: c.lastTestLatency,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      configured: true,
    }));
  }

  async createCredential(dto: CreateAICredentialDto, adminUserId: string) {
    const rawKey = dto.apiKey?.trim();
    if (!rawKey) {
      throw new BadRequestError("API Key is required to create a credential.");
    }

    const provider = await this.providerRepo.findById(dto.providerId);
    if (!provider) {
      throw new NotFoundError(`AI Provider "${dto.providerId}" not found.`);
    }

    const lastFour = rawKey.length > 4 ? rawKey.slice(-4) : rawKey;
    const secretRef = `ai-interview/${provider.slug}/${crypto.randomUUID()}`;

    // 1. Store encrypted secret in vault
    await this.secretsStorage.storeSecret(secretRef, rawKey);

    // 2. Persist record in database
    const credential = await this.credentialRepo.create({
      providerId: dto.providerId,
      name: dto.name.trim(),
      secretReference: secretRef,
      lastFour,
      status: "ACTIVE",
    });

    // 3. Audit log
    await this.auditRepo.create({
      actorId: adminUserId,
      action: "CREDENTIAL_CREATED",
      resourceType: "CREDENTIAL",
      resourceId: credential.id,
      metadata: { provider: provider.slug, name: credential.name, lastFour },
    });

    return {
      id: credential.id,
      providerId: credential.providerId,
      name: credential.name,
      lastFour: credential.lastFour,
      status: credential.status,
      configured: true,
      createdAt: credential.createdAt,
    };
  }

  async rotateCredential(id: string, dto: RotateAICredentialDto, adminUserId: string) {
    const existing = await this.credentialRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`AI Credential "${id}" not found.`);
    }

    const rawKey = dto.apiKey?.trim();
    if (!rawKey) {
      throw new BadRequestError("New API Key is required for credential rotation.");
    }

    const lastFour = rawKey.length > 4 ? rawKey.slice(-4) : rawKey;

    // 1. Store updated encrypted secret under same or new reference
    await this.secretsStorage.storeSecret(existing.secretReference, rawKey);

    // 2. Update metadata in DB
    const updated = await this.credentialRepo.update(id, {
      name: dto.name ? dto.name.trim() : existing.name,
      lastFour,
      status: "ACTIVE",
      lastTestedAt: null,
      lastTestStatus: null,
      lastTestLatency: null,
    });

    // 3. Audit log
    await this.auditRepo.create({
      actorId: adminUserId,
      action: "CREDENTIAL_ROTATED",
      resourceType: "CREDENTIAL",
      resourceId: updated.id,
      metadata: { credentialId: id, newLastFour: lastFour },
    });

    return {
      id: updated.id,
      providerId: updated.providerId,
      name: updated.name,
      lastFour: updated.lastFour,
      status: updated.status,
      configured: true,
      updatedAt: updated.updatedAt,
    };
  }

  async revokeCredential(id: string, adminUserId: string) {
    const existing = await this.credentialRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`AI Credential "${id}" not found.`);
    }

    // Revoke in DB and purge secret from vault
    await this.credentialRepo.update(id, { status: "REVOKED" });
    await this.secretsStorage.deleteSecret(existing.secretReference);

    await this.auditRepo.create({
      actorId: adminUserId,
      action: "CREDENTIAL_REVOKED",
      resourceType: "CREDENTIAL",
      resourceId: id,
      metadata: { name: existing.name, lastFour: existing.lastFour },
    });

    return { success: true, message: `Credential "${existing.name}" revoked successfully.` };
  }
}
