export interface IAudioRecorderService {
  appendChunk(chunk: Buffer): void;
  getBufferedDurationSeconds(): number;
  exportWavBuffer(): Buffer;
  exportWav(): Buffer;
  getRawPcmBuffer(): Buffer;
  clear(): void;
  trimToLastBytes(maxBytes: number): void;
}
