import { ITTSService } from "../../domain/ports/tts.port";
import { logger } from "../../../../shared/logger";

export class FallbackTTSProvider implements ITTSService {
  constructor(
    private readonly primary: ITTSService,
    private readonly fallbacks: ITTSService[] = []
  ) {}

  async synthesizeSpeech(text: string, voiceId?: string): Promise<Buffer> {
    const allProviders = [this.primary, ...this.fallbacks];
    let lastError: any = null;

    for (let i = 0; i < allProviders.length; i++) {
      const provider = allProviders[i];
      try {
        if (i > 0) {
          logger.warn(`[FallbackTTS] Attempting fallback TTS provider #${i}`);
        }
        const audio = await provider.synthesizeSpeech(text, voiceId);
        if (audio && audio.length > 0) {
          return audio;
        }
      } catch (err: any) {
        lastError = err;
        logger.warn(`[FallbackTTS] Provider #${i} failed: ${err.message}`);
      }
    }

    if (lastError) {
      logger.error("[FallbackTTS] All TTS providers failed. Last error:", lastError.message);
    }
    return Buffer.alloc(0);
  }
}
