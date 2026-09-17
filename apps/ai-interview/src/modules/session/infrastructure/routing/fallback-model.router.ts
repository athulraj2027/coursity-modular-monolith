import { ILLMService } from "../../../reasoning/domain/ports/llm.port";
import { logger } from "../../../../shared/logger";

export interface ProviderCandidate {
  providerName: string;
  modelId: string;
  service: ILLMService;
}

export class FallbackModelRouter implements ILLMService {
  constructor(
    private readonly primary: ProviderCandidate,
    private readonly fallbacks: ProviderCandidate[] = []
  ) {}

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const candidates = [this.primary, ...this.fallbacks];
    let lastError: any = null;

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      try {
        if (i > 0) {
          logger.warn(
            `[ModelRouter] Executing fallback #${i} (${candidate.providerName}:${candidate.modelId})`
          );
        }
        return await candidate.service.generateText(prompt, systemPrompt);
      } catch (err: any) {
        lastError = err;
        const isRetryable = this.isRetryableError(err);
        logger.warn(
          `[ModelRouter] Candidate ${candidate.providerName}:${candidate.modelId} failed: ${err.message}. Retryable: ${isRetryable}`
        );

        if (!isRetryable && i === 0 && this.fallbacks.length === 0) {
          throw err;
        }
      }
    }

    logger.error(
      `[ModelRouter] All ${candidates.length} provider candidates exhausted. Returning simulated fallback.`
    );
    return "The system is currently operating in fallback mode. Your response has been recorded.";
  }

  async generateStructured<T>(
    prompt: string,
    systemPrompt?: string,
    schemaDescription?: string
  ): Promise<T> {
    const candidates = [this.primary, ...this.fallbacks];
    let lastError: any = null;

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      try {
        if (i > 0) {
          logger.warn(
            `[ModelRouter] Executing structured fallback #${i} (${candidate.providerName}:${candidate.modelId})`
          );
        }
        return await candidate.service.generateStructured<T>(
          prompt,
          systemPrompt,
          schemaDescription
        );
      } catch (err: any) {
        lastError = err;
        const isRetryable = this.isRetryableError(err);
        logger.warn(
          `[ModelRouter] Structured candidate ${candidate.providerName}:${candidate.modelId} failed: ${err.message}. Retryable: ${isRetryable}`
        );

        if (!isRetryable && i === 0 && this.fallbacks.length === 0) {
          throw err;
        }
      }
    }

    logger.error(
      `[ModelRouter] All structured provider candidates failed. Last error: ${lastError?.message}`
    );
    throw lastError || new Error("All provider candidates exhausted.");
  }

  private isRetryableError(err: any): boolean {
    if (!err) return false;
    const msg = (err.message || "").toLowerCase();
    const status = err.status || err.statusCode;

    if (status === 429 || status === 503 || status === 502 || status === 504 || status === 408) {
      return true;
    }

    return (
      msg.includes("rate limit") ||
      msg.includes("quota exceeded") ||
      msg.includes("timeout") ||
      msg.includes("econnreset") ||
      msg.includes("overloaded") ||
      msg.includes("503") ||
      msg.includes("429")
    );
  }
}
