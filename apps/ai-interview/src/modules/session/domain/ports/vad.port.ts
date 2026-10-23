export interface SpeechStartEvent {
  timestamp: number;
  rms: number;
}

export interface SpeechEndEvent {
  durationMs: number;
  endTimestamp: number;
}

export interface IVadService {
  processAudioChunk(chunk: Buffer): void;
  getIsSpeaking(): boolean;
  reset(): void;
  on(event: "speech_start", listener: (data: SpeechStartEvent) => void): this;
  on(event: "speech_end", listener: (data: SpeechEndEvent) => void): this;
  on(event: string, listener: (...args: any[]) => void): this;
  removeAllListeners?(event?: string): this;
}
