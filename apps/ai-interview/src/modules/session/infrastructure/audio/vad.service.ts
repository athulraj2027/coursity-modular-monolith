import { EventEmitter } from "events";

export interface VadConfig {
  sampleRate: number;
  speechThresholdRms: number;
  silenceThresholdRms: number;
  silenceDurationMs: number;
  minSpeechDurationMs: number;
}

export class VadService extends EventEmitter {
  private isSpeaking: boolean = false;
  private lastSpeechTimestamp: number = 0;
  private speechStartTimestamp: number = 0;
  private noiseFloorRms: number = 0.008;
  private consecutiveSpeechFrames: number = 0;
  private readonly config: VadConfig;

  constructor(config?: Partial<VadConfig>) {
    super();
    this.config = {
      sampleRate: config?.sampleRate || 16000,
      speechThresholdRms: config?.speechThresholdRms || 0.022,
      silenceThresholdRms: config?.silenceThresholdRms || 0.015,
      silenceDurationMs: config?.silenceDurationMs || 850,
      minSpeechDurationMs: config?.minSpeechDurationMs || 200,
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

    // Dynamically track background noise floor during quiet periods
    if (!this.isSpeaking && rms < this.config.speechThresholdRms) {
      this.noiseFloorRms = this.noiseFloorRms * 0.95 + rms * 0.05;
    }

    const dynamicSpeechThreshold = Math.max(this.config.speechThresholdRms, this.noiseFloorRms * 2.2);
    const dynamicSilenceThreshold = Math.max(this.config.silenceThresholdRms, this.noiseFloorRms * 1.4);

    if (rms >= dynamicSpeechThreshold) {
      this.consecutiveSpeechFrames++;
      this.lastSpeechTimestamp = now;

      // Require 2 consecutive frames to prevent single-spike false triggers
      if (!this.isSpeaking && this.consecutiveSpeechFrames >= 2) {
        this.isSpeaking = true;
        this.speechStartTimestamp = now;
        this.emit("speech_start", { timestamp: now, rms });
      }
    } else if (rms < dynamicSilenceThreshold) {
      this.consecutiveSpeechFrames = 0;

      if (this.isSpeaking) {
        const silenceElapsed = now - this.lastSpeechTimestamp;
        const speechDuration = this.lastSpeechTimestamp - this.speechStartTimestamp;

        if (silenceElapsed >= this.config.silenceDurationMs) {
          if (speechDuration >= this.config.minSpeechDurationMs) {
            this.isSpeaking = false;
            this.emit("speech_end", {
              durationMs: speechDuration,
              endTimestamp: this.lastSpeechTimestamp,
            });
          } else {
            this.isSpeaking = false;
          }
        }
      }
    }
  }

  reset(): void {
    this.isSpeaking = false;
    this.consecutiveSpeechFrames = 0;
    this.lastSpeechTimestamp = 0;
    this.speechStartTimestamp = 0;
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}
