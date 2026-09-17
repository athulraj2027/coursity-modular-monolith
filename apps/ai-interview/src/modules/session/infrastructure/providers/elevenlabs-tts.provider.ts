import { ITTSService } from "../../domain/ports/tts.port";
import { env } from "../../../../shared/config/env.config";
import { logger } from "../../../../shared/logger";

export class ElevenLabsTTSProvider implements ITTSService {
  private apiKey: string;
  private defaultVoiceId: string;

  constructor(apiKey?: string, defaultVoiceId?: string) {
    this.apiKey = apiKey || env.TTS_API_KEY;
    this.defaultVoiceId =
      defaultVoiceId || env.TTS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
  }

  async synthesizeSpeech(text: string, voiceId?: string): Promise<Buffer> {
    const targetVoiceId = voiceId || this.defaultVoiceId;

    if (!this.apiKey) {
      logger.warn(
        "[Provider:TTS] No TTS_API_KEY provided. Returning mock audio buffer."
      );
      return Buffer.alloc(32000);
    }

    try {
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}?output_format=pcm_16000`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "xi-api-key": this.apiKey,
          "Content-Type": "application/json",
          Accept: "audio/pcm",
        },
        body: JSON.stringify({
          text,
          model_id: env.TTS_MODEL || "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`ElevenLabs TTS error (${response.status}): ${errText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error: any) {
      logger.error("[Provider:ElevenLabs] Speech synthesis failed:", error.message);
      return Buffer.alloc(32000);
    }
  }
}
