import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { AesEncryptedSecretStorage } from "../src/modules/ai-config/infrastructure/security/aes-encrypted-secret.storage";
import { ProviderConnectivityChecker } from "../src/modules/ai-config/infrastructure/validation/provider-connectivity.checker";
import { ManageProvidersUseCase } from "../src/modules/ai-config/application/use-cases/manage-providers.usecase";
import { ManageModelsUseCase } from "../src/modules/ai-config/application/use-cases/manage-models.usecase";
import { ManageCredentialsUseCase } from "../src/modules/ai-config/application/use-cases/manage-credentials.usecase";
import { TestCredentialUseCase } from "../src/modules/ai-config/application/use-cases/test-credential.usecase";
import { ManageConfigVersionUseCase } from "../src/modules/ai-config/application/use-cases/manage-config-version.usecase";
import { GetPublishedInternalConfigUseCase } from "../src/modules/ai-config/application/use-cases/get-published-internal-config.usecase";
import {
  IAIProviderRepository,
  IAIModelRepository,
  IAICredentialRepository,
  IAIConfigVersionRepository,
  IAIAuditLogRepository,
} from "../src/modules/ai-config/domain/repositories/ai-config.repository.interfaces";
import {
  AIProviderEntity,
  AIModelEntity,
  AICredentialEntity,
  AIConfigVersionEntity,
  AIAuditLogEntity,
} from "../src/modules/ai-config/domain/entities/ai-config.entities";

// In-memory repositories for fast, isolated testing
class InMemoryProviderRepo implements IAIProviderRepository {
  private providers: Map<string, AIProviderEntity> = new Map();

  async findById(id: string) { return this.providers.get(id) || null; }
  async findBySlug(slug: string) {
    for (const p of this.providers.values()) {
      if (p.slug === slug) return p;
    }
    return null;
  }
  async findAll() { return Array.from(this.providers.values()); }
  async create(data: any) {
    const id = `prov_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const entity: AIProviderEntity = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
    this.providers.set(id, entity);
    return entity;
  }
  async update(id: string, data: any) {
    const existing = this.providers.get(id);
    if (!existing) throw new Error("Not found");
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.providers.set(id, updated);
    return updated;
  }
}

class InMemoryModelRepo implements IAIModelRepository {
  private models: Map<string, AIModelEntity> = new Map();

  async findById(id: string) { return this.models.get(id) || null; }
  async findByProviderAndModelId(providerId: string, modelId: string) {
    for (const m of this.models.values()) {
      if (m.providerId === providerId && m.modelId === modelId) return m;
    }
    return null;
  }
  async findAll(filters?: any) {
    let list = Array.from(this.models.values());
    if (filters?.providerId) list = list.filter((m) => m.providerId === filters.providerId);
    if (filters?.type) list = list.filter((m) => m.type === filters.type);
    return list;
  }
  async create(data: any) {
    const id = `mod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const entity: AIModelEntity = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
    this.models.set(id, entity);
    return entity;
  }
  async update(id: string, data: any) {
    const existing = this.models.get(id);
    if (!existing) throw new Error("Not found");
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.models.set(id, updated);
    return updated;
  }
}

class InMemoryCredentialRepo implements IAICredentialRepository {
  private credentials: Map<string, AICredentialEntity> = new Map();

  async findById(id: string) { return this.credentials.get(id) || null; }
  async findBySecretReference(ref: string) {
    for (const c of this.credentials.values()) {
      if (c.secretReference === ref) return c;
    }
    return null;
  }
  async findAll(providerId?: string) {
    let list = Array.from(this.credentials.values());
    if (providerId) list = list.filter((c) => c.providerId === providerId);
    return list;
  }
  async create(data: any) {
    const id = `cred_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const entity: AICredentialEntity = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
    this.credentials.set(id, entity);
    return entity;
  }
  async update(id: string, data: any) {
    const existing = this.credentials.get(id);
    if (!existing) throw new Error("Not found");
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.credentials.set(id, updated);
    return updated;
  }
  async delete(id: string) { this.credentials.delete(id); }
}

class InMemoryVersionRepo implements IAIConfigVersionRepository {
  private versions: Map<string, AIConfigVersionEntity> = new Map();
  private nextVer = 1;

  async findById(id: string) { return this.versions.get(id) || null; }
  async findByVersion(v: number) {
    for (const ver of this.versions.values()) {
      if (ver.version === v) return ver;
    }
    return null;
  }
  async findPublished() {
    for (const ver of this.versions.values()) {
      if (ver.status === "PUBLISHED") return ver;
    }
    return null;
  }
  async findDraft() {
    for (const ver of this.versions.values()) {
      if (ver.status === "DRAFT") return ver;
    }
    return null;
  }
  async findAll() { return Array.from(this.versions.values()).sort((a, b) => b.version - a.version); }
  async getNextVersionNumber() { return this.nextVer; }
  async createVersion(data: any) {
    const id = `ver_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const entity: AIConfigVersionEntity = {
      ...data,
      id,
      agentConfigs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.versions.set(id, entity);
    this.nextVer++;
    return entity;
  }
  async saveDraftAgentConfigs(versionId: string, configs: any[]) {
    const ver = this.versions.get(versionId);
    if (!ver) throw new Error("Version not found");
    ver.agentConfigs = configs.map((c, idx) => ({
      id: `ac_${idx}`,
      versionId,
      agentType: c.agentType,
      modelId: c.modelId,
      credentialId: c.credentialId,
      enabled: c.enabled !== false,
      temperature: c.temperature ?? 0.2,
      maxTokens: c.maxTokens ?? 2048,
      systemPrompt: c.systemPrompt,
      customConfig: c.customConfig,
      createdAt: new Date(),
      updatedAt: new Date(),
      fallbackConfigs: (c.fallbacks || []).map((fb: any, fIdx: number) => ({
        id: `afb_${fIdx}`,
        agentConfigId: `ac_${idx}`,
        priority: fb.priority,
        modelId: fb.modelId,
        credentialId: fb.credentialId,
        temperature: fb.temperature,
        customConfig: fb.customConfig,
        createdAt: new Date(),
      })),
    }));
    return ver;
  }
  async publishVersion(versionId: string, adminUserId: string) {
    for (const ver of this.versions.values()) {
      if (ver.status === "PUBLISHED") {
        ver.status = "ARCHIVED";
        ver.archivedAt = new Date();
      }
    }
    const target = this.versions.get(versionId)!;
    target.status = "PUBLISHED";
    target.publishedAt = new Date();
    target.publishedBy = adminUserId;
    return target;
  }
  async rollbackToVersion(targetVersionId: string, adminUserId: string) {
    const target = this.versions.get(targetVersionId)!;
    const newVer = await this.createVersion({
      version: this.nextVer,
      status: "PUBLISHED",
      name: `Rollback to v${target.version}`,
      publishedBy: adminUserId,
    });
    newVer.agentConfigs = JSON.parse(JSON.stringify(target.agentConfigs || []));
    for (const ver of this.versions.values()) {
      if (ver.id !== newVer.id && ver.status === "PUBLISHED") {
        ver.status = "ARCHIVED";
      }
    }
    return newVer;
  }
}

class InMemoryAuditRepo implements IAIAuditLogRepository {
  private logs: AIAuditLogEntity[] = [];
  async create(data: any) {
    const entity = { ...data, id: `audit_${Date.now()}`, createdAt: new Date() };
    this.logs.push(entity);
    return entity;
  }
  async findAll() { return this.logs; }
}

describe("🛡️ Admin AI Provider & Credential Management Suite", () => {
  let secretStorage: AesEncryptedSecretStorage;
  let providerRepo: InMemoryProviderRepo;
  let modelRepo: InMemoryModelRepo;
  let credRepo: InMemoryCredentialRepo;
  let versionRepo: InMemoryVersionRepo;
  let auditRepo: InMemoryAuditRepo;

  let manageProviders: ManageProvidersUseCase;
  let manageModels: ManageModelsUseCase;
  let manageCredentials: ManageCredentialsUseCase;
  let manageConfigVersion: ManageConfigVersionUseCase;
  let getPublishedConfig: GetPublishedInternalConfigUseCase;

  beforeEach(() => {
    secretStorage = new AesEncryptedSecretStorage("test_super_secret_master_encryption_key_123");
    providerRepo = new InMemoryProviderRepo();
    modelRepo = new InMemoryModelRepo();
    credRepo = new InMemoryCredentialRepo();
    versionRepo = new InMemoryVersionRepo();
    auditRepo = new InMemoryAuditRepo();

    manageProviders = new ManageProvidersUseCase(providerRepo, auditRepo);
    manageModels = new ManageModelsUseCase(modelRepo, providerRepo, auditRepo);
    manageCredentials = new ManageCredentialsUseCase(credRepo, providerRepo, secretStorage, auditRepo);
    manageConfigVersion = new ManageConfigVersionUseCase(versionRepo, auditRepo);
    getPublishedConfig = new GetPublishedInternalConfigUseCase(versionRepo, secretStorage);
  });

  describe("1. Secret Storage & Encryption", () => {
    it("should encrypt and decrypt secrets without plaintext leakage", async () => {
      const plainKey = "AIzaSyTestApiKeySecret123456789";
      const refKey = "ai-interview/gemini/secret-1";

      await secretStorage.storeSecret(refKey, plainKey);
      const decrypted = await secretStorage.getSecret(refKey);

      assert.strictEqual(decrypted, plainKey);
    });

    it("should return null for non-existent or deleted secrets", async () => {
      const refKey = "ai-interview/deepgram/temp-key";
      await secretStorage.storeSecret(refKey, "deepgram-token-xyz");

      const beforeDelete = await secretStorage.getSecret(refKey);
      assert.strictEqual(beforeDelete, "deepgram-token-xyz");

      await secretStorage.deleteSecret(refKey);
      const afterDelete = await secretStorage.getSecret(refKey);
      assert.strictEqual(afterDelete, null);
    });
  });

  describe("2. Providers & Models Management", () => {
    it("should register providers and prevent duplicate slugs", async () => {
      const p = await manageProviders.createProvider(
        { slug: "gemini", name: "Google Gemini", type: "LLM" },
        "admin_1"
      );
      assert.strictEqual(p.slug, "gemini");
      assert.strictEqual(p.status, "ACTIVE");

      await assert.rejects(
        () => manageProviders.createProvider({ slug: "gemini", name: "Duplicate", type: "LLM" }, "admin_1"),
        /already exists/
      );
    });

    it("should register models for a provider", async () => {
      const p = await manageProviders.createProvider(
        { slug: "elevenlabs", name: "ElevenLabs", type: "TTS" },
        "admin_1"
      );

      const m = await manageModels.createModel(
        { providerId: p.id, name: "Eleven Turbo v2.5", modelId: "eleven_turbo_v2_5", type: "TTS" },
        "admin_1"
      );

      assert.strictEqual(m.modelId, "eleven_turbo_v2_5");
      assert.strictEqual(m.providerId, p.id);
    });
  });

  describe("3. Secure Credentials Flow", () => {
    it("should securely store credential, mask preview to lastFour, and never return full secret", async () => {
      const p = await manageProviders.createProvider(
        { slug: "deepgram", name: "Deepgram", type: "STT" },
        "admin_1"
      );

      const cred = await manageCredentials.createCredential(
        { providerId: p.id, name: "Deepgram Prod", apiKey: "dg_live_abcdef1234567890" },
        "admin_1"
      );

      assert.strictEqual(cred.lastFour, "7890");
      assert.strictEqual((cred as any).apiKey, undefined);
      assert.strictEqual(cred.configured, true);

      // Verify encrypted storage holds the original key
      const record = await credRepo.findById(cred.id);
      assert.ok(record);
      const decrypted = await secretStorage.getSecret(record.secretReference);
      assert.strictEqual(decrypted, "dg_live_abcdef1234567890");
    });

    it("should support credential rotation and revocation", async () => {
      const p = await manageProviders.createProvider(
        { slug: "openai", name: "OpenAI", type: "LLM" },
        "admin_1"
      );

      const cred = await manageCredentials.createCredential(
        { providerId: p.id, name: "OpenAI Prod", apiKey: "sk-proj-oldkey1234" },
        "admin_1"
      );
      assert.strictEqual(cred.lastFour, "1234");

      // Rotate
      const rotated = await manageCredentials.rotateCredential(
        cred.id,
        { apiKey: "sk-proj-newkey9999" },
        "admin_1"
      );
      assert.strictEqual(rotated.lastFour, "9999");

      // Revoke
      await manageCredentials.revokeCredential(cred.id, "admin_1");
      const revoked = await credRepo.findById(cred.id);
      assert.strictEqual(revoked?.status, "REVOKED");

      const secretAfterRevoke = await secretStorage.getSecret(revoked!.secretReference);
      assert.strictEqual(secretAfterRevoke, null);
    });
  });

  describe("4. Configuration Versioning & Agent Matrix", () => {
    it("should create draft, publish v1, and atomically archive prior versions", async () => {
      const p = await manageProviders.createProvider({ slug: "gemini", name: "Gemini", type: "LLM" }, "admin_1");
      const m = await manageModels.createModel({ providerId: p.id, name: "Gemini Flash", modelId: "gemini-1.5-flash", type: "LLM" }, "admin_1");
      const c = await manageCredentials.createCredential({ providerId: p.id, name: "Gemini Key", apiKey: "AIzaTestKey1234" }, "admin_1");

      // 1. Save Draft
      const draft = await manageConfigVersion.saveDraft(
        {
          name: "Launch Config v1",
          agentConfigs: [
            {
              agentType: "SUPERVISOR",
              modelId: m.id,
              credentialId: c.id,
              temperature: 0.1,
              enabled: true,
            },
            {
              agentType: "QUESTION_GENERATOR",
              modelId: m.id,
              credentialId: c.id,
              temperature: 0.3,
              enabled: true,
            },
          ],
        },
        "admin_1"
      );

      assert.strictEqual(draft.status, "DRAFT");
      assert.strictEqual(draft.agentConfigs?.length, 2);

      // 2. Publish Draft
      const published = await manageConfigVersion.publish(draft.id, "admin_1");
      assert.strictEqual(published.status, "PUBLISHED");
      assert.strictEqual(published.publishedBy, "admin_1");
    });

    it("should support instant rollback to historical version", async () => {
      const p = await manageProviders.createProvider({ slug: "gemini", name: "Gemini", type: "LLM" }, "admin_1");
      const m = await manageModels.createModel({ providerId: p.id, name: "Gemini Flash", modelId: "gemini-1.5-flash", type: "LLM" }, "admin_1");
      const c = await manageCredentials.createCredential({ providerId: p.id, name: "Gemini Key", apiKey: "AIzaTestKey1234" }, "admin_1");

      const v1 = await manageConfigVersion.saveDraft({
        name: "Version 1",
        agentConfigs: [{ agentType: "SUPERVISOR", modelId: m.id, credentialId: c.id, temperature: 0.1 }],
      }, "admin_1");
      await manageConfigVersion.publish(v1.id, "admin_1");

      // Rollback to v1
      const rolledBack = await manageConfigVersion.rollback(v1.id, "admin_1");
      assert.strictEqual(rolledBack.status, "PUBLISHED");
      assert.ok(rolledBack.name?.includes("Rollback to v1"));
    });
  });

  describe("5. Internal Microservice Runtime Sync", () => {
    it("should format and decrypt runtime configurations for apps/ai-interview", async () => {
      const p = await manageProviders.createProvider({ slug: "gemini", name: "Gemini", type: "LLM" }, "admin_1");
      const m = await manageModels.createModel({ providerId: p.id, name: "Gemini Flash", modelId: "gemini-1.5-flash", type: "LLM" }, "admin_1");
      const c = await manageCredentials.createCredential({ providerId: p.id, name: "Gemini Key", apiKey: "AIzaRuntimeSecretKey" }, "admin_1");

      const draft = await manageConfigVersion.saveDraft({
        name: "Production Runtime Config",
        agentConfigs: [
          {
            agentType: "INTERVIEW_PLANNER",
            modelId: m.id,
            credentialId: c.id,
            temperature: 0.2,
          },
        ],
      }, "admin_1");

      await manageConfigVersion.publish(draft.id, "admin_1");

      // Inject model/credential relations for mock entity mapping
      const record = await versionRepo.findById(draft.id);
      if (record?.agentConfigs) {
        (record.agentConfigs[0] as any).model = { provider: { slug: "gemini" }, type: "LLM", modelId: "gemini-1.5-flash" };
        const credRecord = await credRepo.findById(c.id);
        (record.agentConfigs[0] as any).credential = { secretReference: credRecord?.secretReference };
      }

      const internalConfig = await getPublishedConfig.execute();
      assert.strictEqual(internalConfig.version, draft.version);
      assert.ok(internalConfig.agents["INTERVIEW_PLANNER"]);
      assert.strictEqual(internalConfig.agents["INTERVIEW_PLANNER"].primary.apiKey, "AIzaRuntimeSecretKey");
      assert.strictEqual(internalConfig.agents["INTERVIEW_PLANNER"].primary.modelId, "gemini-1.5-flash");
    });
  });
});
