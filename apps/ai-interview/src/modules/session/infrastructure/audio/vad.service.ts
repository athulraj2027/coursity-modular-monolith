import { EventEmitter } from "events";

export interface VadConfig {
  sampleRate: number;
  silenceThresholdRms: number;
  silenceDurationMs: number;
  minSpeechDurationMs: number;
}

export class VadService extends EventEmitter {
  private isSpeaking: boolean = false;
  private lastSpeechTimestamp: number = 0;
  private speechStartTimestamp: number = 0;
  private silenceTimer: NodeJS.Timeout | null = null;
  private readonly config: VadConfig;

  constructor(config?: Partial<VadConfig>) {
    super();
    this.config = {
      sampleRate: config?.sampleRate || 16000,
      silenceThresholdRms: config?.silenceThresholdRms || 0.006,
      silenceDurationMs: config?.silenceDurationMs || 900,
      minSpeechDurationMs: config?.minSpeechDurationMs || 250,
    };
  }

  private calculateRms(pcmBuffer: Buffer): number {
    if (pcmBuffer.length < 2) return 0;

    let sumSquares = 0;
    const sampleCount = Math.floor(pcmBuffer.length / 2);

    for (let i = 0; i < pcmBuffer.length - 1; i += 2) {
      const sample = pcmBuffer.readInt16LE(i) / 32768.0;
      sumSquares += sample * sample;
    }

    return Math.sqrt(sumSquares / sampleCount);
  }

  processAudioChunk(chunk: Buffer): void {
    const rms = this.calculateRms(chunk);
    const now = Date.now();

    if (rms >= this.config.silenceThresholdRms) {
      this.lastSpeechTimestamp = now;

      if (!this.isSpeaking) {
        this.isSpeaking = true;
        this.speechStartTimestamp = now;
        this.emit("speech_start", { timestamp: now, rms });
      }

      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }
    } else {
      if (this.isSpeaking && !this.silenceTimer) {
        this.silenceTimer = setTimeout(() => {
          const duration = this.lastSpeechTimestamp - this.speechStartTimestamp;
          if (duration >= this.config.minSpeechDurationMs) {
            this.isSpeaking = false;
            this.emit("speech_end", {
              durationMs: duration,
              endTimestamp: this.lastSpeechTimestamp,
            });
          }
          this.silenceTimer = null;
        }, this.config.silenceDurationMs);
      }
    }
  }

  reset(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    this.isSpeaking = false;
    this.lastSpeechTimestamp = 0;
    this.speechStartTimestamp = 0;
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}
