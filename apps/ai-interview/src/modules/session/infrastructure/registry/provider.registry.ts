import { ILLMService } from "../../../reasoning/domain/ports/llm.port";
import { ISTTService } from "../../domain/ports/stt.port";
import { ITTSService } from "../../domain/ports/tts.port";
import { GeminiProvider } from "../providers/gemini.provider";
import { DeepgramSTTProvider } from "../providers/deepgram-stt.provider";
import { ElevenLabsTTSProvider } from "../providers/elevenlabs-tts.provider";
import { FallbackModelRouter, ProviderCandidate } from "../routing/fallback-model.router";
import { AIConfigClient, globalAIConfigClient } from "../../../../shared/config/ai-config.client";
import { env } from "../../../../shared/config/env.config";

export type LLMFactoryFn = (apiKey: string, modelId: string) => ILLMService;

export class ProviderRegistry {
  private readonly llmFactories = new Map<string, LLMFactoryFn>();

  constructor(private readonly configClient: AIConfigClient = globalAIConfigClient) {
    this.registerLLMProvider("gemini", (apiKey, modelId) => new GeminiProvider(apiKey, modelId));
    this.registerLLMProvider("google", (apiKey, modelId) => new GeminiProvider(apiKey, modelId));
  }

  /**
   * Registers a new LLM provider factory, satisfying the Open/Closed Principle.
   */
  registerLLMProvider(providerName: string, factory: LLMFactoryFn): void {
    this.llmFactories.set(providerName.toLowerCase(), factory);
  }

  /**
   * Resolves the configured LLM service (primary + fallbacks) for a specific agent type.
   */
  async getLLM(agentType: string): Promise<ILLMService> {
    const config = await this.configClient.getActiveConfig();
    const agentConfig = config.agents[agentType] || config.agents["DEFAULT"];

    if (!agentConfig) {
      return this.instantiateLLM("gemini", env.LLM_MODEL, env.LLM_API_KEY);
    }

    // 1. Primary candidate
    const primaryCandidate: ProviderCandidate = {
      providerName: agentConfig.primary.provider,
      modelId: agentConfig.primary.modelId,
      service: this.instantiateLLM(
        agentConfig.primary.provider,
        agentConfig.primary.modelId,
        agentConfig.primary.apiKey
      ),
    };

    // 2. Fallback candidates
    const fallbackCandidates: ProviderCandidate[] = (agentConfig.fallbacks || []).map((fb) => ({
      providerName: fb.provider,
      modelId: fb.modelId,
      service: this.instantiateLLM(fb.provider, fb.modelId, fb.apiKey),
    }));

    return new FallbackModelRouter(primaryCandidate, fallbackCandidates);
  }

  /**
   * Resolves STT service
   */
  async getSTT(): Promise<ISTTService> {
    const config = await this.configClient.getActiveConfig();
    const sttAgent = config.agents["STT"];
    const apiKey = sttAgent?.primary.apiKey || env.STT_API_KEY;
    return new DeepgramSTTProvider(apiKey);
  }

  /**
   * Resolves TTS service
   */
  async getTTS(): Promise<ITTSService> {
    const config = await this.configClient.getActiveConfig();
    const ttsAgent = config.agents["TTS"];
    const apiKey = ttsAgent?.primary.apiKey || env.TTS_API_KEY;
    const voiceId = ttsAgent?.customConfig?.voiceId || env.TTS_VOICE_ID;
    return new ElevenLabsTTSProvider(apiKey, voiceId);
  }

  private instantiateLLM(provider: string, modelId: string, apiKey: string): ILLMService {
    const factory = this.llmFactories.get((provider || "").toLowerCase());
    if (factory) {
      return factory(apiKey || env.LLM_API_KEY, modelId || env.LLM_MODEL);
    }
    return new GeminiProvider(apiKey || env.LLM_API_KEY, modelId || env.LLM_MODEL);
  }
}

export const globalProviderRegistry = new ProviderRegistry();
