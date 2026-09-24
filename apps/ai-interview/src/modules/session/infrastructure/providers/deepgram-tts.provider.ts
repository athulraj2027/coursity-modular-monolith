import { ITTSService } from "../../domain/ports/tts.port";
import { env } from "../../../../shared/config/env.config";
import { logger } from "../../../../shared/logger";

export class DeepgramTTSProvider implements ITTSService {
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey?: string, defaultModel?: string) {
    this.apiKey = apiKey || env.STT_API_KEY || "";
    this.defaultModel = defaultModel || "aura-asteria-en";
  }

  async synthesizeSpeech(text: string, voiceOrModel?: string): Promise<Buffer> {
    const model = voiceOrModel && voiceOrModel.startsWith("aura-") ? voiceOrModel : this.defaultModel;

    if (!this.apiKey) {
      logger.warn("[Provider:DeepgramTTS] No API key available for Deepgram TTS.");
      return Buffer.alloc(0);
    }

    try {
      const url = `https://api.deepgram.com/v1/speak?model=${model}&encoding=linear16&sample_rate=16000`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Token ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Deepgram TTS error (${response.status}): ${errText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const pcmBuffer = Buffer.from(arrayBuffer);
      logger.success(`[Provider:DeepgramTTS] Synthesized ${pcmBuffer.length} bytes of speech for: "${text.slice(0, 40)}..."`);
      return pcmBuffer;
    } catch (error: any) {
      logger.error("[Provider:DeepgramTTS] Speech synthesis failed:", error.message);
      return Buffer.alloc(0);
    }
  }
}
