import { env } from "./env.config";
import { logger } from "../logger";

export interface InternalAgentConfigItem {
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

export interface ActiveRuntimeAIConfig {
  versionId: string;
  version: number;
  name: string;
  publishedAt: string;
  agents: Record<string, InternalAgentConfigItem>;
}

export class AIConfigClient {
  private activeConfig: ActiveRuntimeAIConfig | null = null;
  private lastFetchedAt: number = 0;
  private readonly cacheTtlMs: number = 30000; // 30s cache TTL
  private readonly backendUrl: string;
  private readonly internalSecret: string;

  constructor(backendUrl?: string, internalSecret?: string) {
    this.backendUrl = backendUrl || env.HTTP_BACKEND_URL;
    this.internalSecret = internalSecret || env.INTERNAL_SERVICE_SECRET;
  }

  /**
   * Fetches published AI configuration from apps/http with in-memory caching.
   * Falls back to .env variables if backend is offline or no published version exists.
   */
  async getActiveConfig(forceRefresh: boolean = false): Promise<ActiveRuntimeAIConfig> {
    const now = Date.now();
    if (!forceRefresh && this.activeConfig && now - this.lastFetchedAt < this.cacheTtlMs) {
      return this.activeConfig;
    }

    try {
      const url = `${this.backendUrl}/internal/ai-config/published`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "x-internal-secret": this.internalSecret,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const body = (await res.json()) as { success: boolean; data: ActiveRuntimeAIConfig };
        if (body.success && body.data) {
          this.activeConfig = body.data;
          this.lastFetchedAt = now;
          logger.info(
            `[AIConfigClient] Successfully loaded published AI Config v${body.data.version} ("${body.data.name}")`
          );
          return this.activeConfig;
        }
      }
    } catch (err: any) {
      logger.warn(
        `[AIConfigClient] Could not fetch remote AI config (${err.message}). Using fallback environment configuration.`
      );
    }

    // Fallback config generated from environment variables
    this.activeConfig = this.buildFallbackEnvConfig();
    this.lastFetchedAt = now;
    return this.activeConfig;
  }

  /**
   * Constructs default runtime configuration from environment variables
   */
  private buildFallbackEnvConfig(): ActiveRuntimeAIConfig {
    const defaultAgentConfig: InternalAgentConfigItem = {
      agentType: "DEFAULT",
      enabled: true,
      temperature: 0.2,
      maxTokens: 2048,
      primary: {
        provider: env.LLM_PROVIDER || "gemini",
        providerType: "LLM",
        modelId: env.LLM_MODEL || "gemini-1.5-flash",
        apiKey: env.LLM_API_KEY || "",
      },
      fallbacks: [],
    };

    const agentTypes = [
      "SUPERVISOR",
      "INTERVIEW_PLANNER",
      "QUESTION_GENERATOR",
      "ANSWER_ANALYZER",
      "EVIDENCE_EXTRACTOR",
      "FOLLOW_UP",
      "DIFFICULTY_ADAPTER",
      "CONVERSATION_QUALITY",
      "EVALUATOR",
      "REPORT_GENERATOR",
      "FEEDBACK",
      "INTEGRITY",
    ];

    const agentsMap: Record<string, InternalAgentConfigItem> = {};
    for (const at of agentTypes) {
      agentsMap[at] = {
        ...defaultAgentConfig,
        agentType: at,
      };
    }

    return {
      versionId: "env_bootstrap_v0",
      version: 0,
      name: "Environment Bootstrap Configuration",
      publishedAt: new Date().toISOString(),
      agents: agentsMap,
    };
  }

  /**
   * Directly sets active configuration (useful for testing)
   */
  setActiveConfigForTesting(config: ActiveRuntimeAIConfig): void {
    this.activeConfig = config;
    this.lastFetchedAt = Date.now();
  }
}

export const globalAIConfigClient = new AIConfigClient();
