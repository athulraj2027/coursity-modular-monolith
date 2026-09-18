import { IAIConfigVersionRepository } from "../../domain/repositories/ai-config.repository.interfaces";
import { ISecretsStorageService } from "../../domain/services/ai-config.services.interfaces";
import { NotFoundError } from "@/app/errors";

export interface InternalAgentRuntimeConfig {
  agentType: string;
  enabled: boolean;
  temperature: number;
  maxTokens?: number;
  systemPrompt?: string;
  customConfig?: Record<string, any>;
  primary: {
    provider: string;
    providerType: string;
    modelId: string;
    apiKey: string;
  };
  fallbacks: Array<{
    priority: number;
    provider: string;
    providerType: string;
    modelId: string;
    apiKey: string;
    temperature?: number;
    customConfig?: Record<string, any>;
  }>;
}

export interface InternalPublishedRuntimeConfig {
  versionId: string;
  version: number;
  name: string;
  publishedAt: string;
  agents: Record<string, InternalAgentRuntimeConfig>;
}

export class GetPublishedInternalConfigUseCase {
  constructor(
    private readonly versionRepo: IAIConfigVersionRepository,
    private readonly secretsStorage: ISecretsStorageService
  ) {}

  async execute(versionId?: string): Promise<InternalPublishedRuntimeConfig> {
    const configVersion = versionId
      ? await this.versionRepo.findById(versionId)
      : await this.versionRepo.findPublished();

    if (!configVersion) {
      throw new NotFoundError(
        versionId
          ? `AI Config Version "${versionId}" not found.`
          : "No published AI configuration found."
      );
    }

    const agentsMap: Record<string, InternalAgentRuntimeConfig> = {};

    if (configVersion.agentConfigs) {
      for (const ac of configVersion.agentConfigs) {
        const primaryProvider = (ac.model as any)?.provider?.slug || "gemini";
        const primaryType = (ac.model as any)?.type || "LLM";
        const primaryModelId = (ac.model as any)?.modelId || "gemini-1.5-flash";
        const primarySecretRef = (ac.credential as any)?.secretReference;

        const primaryApiKey = primarySecretRef
          ? (await this.secretsStorage.getSecret(primarySecretRef)) || ""
          : "";

        const fallbacks: InternalAgentRuntimeConfig["fallbacks"] = [];

        if (ac.fallbackConfigs) {
          for (const fb of ac.fallbackConfigs) {
            const fbProvider = (fb.model as any)?.provider?.slug || "openai";
            const fbType = (fb.model as any)?.type || "LLM";
            const fbModelId = (fb.model as any)?.modelId || "gpt-4o-mini";
            const fbSecretRef = (fb.credential as any)?.secretReference;

            const fbApiKey = fbSecretRef
              ? (await this.secretsStorage.getSecret(fbSecretRef)) || ""
              : "";

            fallbacks.push({
              priority: fb.priority,
              provider: fbProvider,
              providerType: fbType,
              modelId: fbModelId,
              apiKey: fbApiKey,
              temperature: fb.temperature ?? undefined,
              customConfig: fb.customConfig || undefined,
            });
          }
        }

        agentsMap[ac.agentType] = {
          agentType: ac.agentType,
          enabled: ac.enabled,
          temperature: ac.temperature,
          maxTokens: ac.maxTokens || 2048,
          systemPrompt: ac.systemPrompt || undefined,
          customConfig: ac.customConfig || undefined,
          primary: {
            provider: primaryProvider,
            providerType: primaryType,
            modelId: primaryModelId,
            apiKey: primaryApiKey,
          },
          fallbacks,
        };
      }
    }

    return {
      versionId: configVersion.id,
      version: configVersion.version,
      name: configVersion.name || `Config v${configVersion.version}`,
      publishedAt: configVersion.publishedAt?.toISOString() || new Date().toISOString(),
      agents: agentsMap,
    };
  }
}
