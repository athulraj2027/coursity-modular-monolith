import { ISTTService } from "../../domain/ports/stt.port";
import { env } from "../../../../shared/config/env.config";
import { logger } from "../../../../shared/logger";

export class DeepgramSTTProvider implements ISTTService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || env.STT_API_KEY;
  }

  async transcribeAudio(
    pcmBuffer: Buffer,
    sampleRate: number = 16000
  ): Promise<string> {
    if (!this.apiKey) {
      logger.warn(
        "[Provider:STT] No STT_API_KEY provided. Using simulated STT."
      );
      return "Candidate response recorded in simulation mode.";
    }

    try {
      const model = env.STT_MODEL || "nova-2";
      const url = `https://api.deepgram.com/v1/listen?model=${model}&encoding=linear16&sample_rate=${sampleRate}&channels=1&punctuate=true&smart_format=true`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Token ${this.apiKey}`,
          "Content-Type": "audio/raw",
        },
        body: new Uint8Array(pcmBuffer),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Deepgram STT error (${response.status}): ${errText}`);
      }

      const data: any = await response.json();
      const transcript =
        data.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

      return transcript.trim();
    } catch (error: any) {
      logger.error("[Provider:Deepgram] Transcription failed:", error.message);
      return "";
    }
  }
}
