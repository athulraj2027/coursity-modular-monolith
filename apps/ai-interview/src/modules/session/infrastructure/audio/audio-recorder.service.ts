export class AudioRecorderService {
  private chunks: Buffer[] = [];
  private totalByteLength: number = 0;
  private readonly sampleRate: number;
  private readonly numChannels: number;
  private readonly bitDepth: number;

  constructor(
    sampleRateOrOptions?: number | { sampleRate?: number; numChannels?: number; bitDepth?: number },
    numChannels?: number,
    bitDepth?: number
  ) {
    if (typeof sampleRateOrOptions === "object") {
      this.sampleRate = sampleRateOrOptions.sampleRate || 16000;
      this.numChannels = sampleRateOrOptions.numChannels || 1;
      this.bitDepth = sampleRateOrOptions.bitDepth || 16;
    } else {
      this.sampleRate = sampleRateOrOptions || 16000;
      this.numChannels = numChannels || 1;
      this.bitDepth = bitDepth || 16;
    }
  }

  appendChunk(chunk: Buffer): void {
    this.chunks.push(chunk);
    this.totalByteLength += chunk.length;
  }

  getBufferedDurationSeconds(): number {
    const bytesPerSample = this.bitDepth / 8;
    const bytesPerSecond = this.sampleRate * this.numChannels * bytesPerSample;
    return this.totalByteLength / bytesPerSecond;
  }

  exportWavBuffer(): Buffer {
    const pcmData = Buffer.concat(this.chunks, this.totalByteLength);
    const wavHeader = this.createWavHeader(pcmData.length);
    return Buffer.concat([wavHeader, pcmData]);
  }

  exportWav(): Buffer {
    return this.exportWavBuffer();
  }

  getRawPcmBuffer(): Buffer {
    return Buffer.concat(this.chunks, this.totalByteLength);
  }

  clear(): void {
    this.chunks = [];
    this.totalByteLength = 0;
  }

  trimToLastBytes(maxBytes: number): void {
    while (this.chunks.length > 0 && this.totalByteLength > maxBytes) {
      const removed = this.chunks.shift();
      if (removed) {
        this.totalByteLength -= removed.length;
      }
    }
  }

  private createWavHeader(dataByteLength: number): Buffer {
    const header = Buffer.alloc(44);
    const byteRate = (this.sampleRate * this.numChannels * this.bitDepth) / 8;
    const blockAlign = (this.numChannels * this.bitDepth) / 8;

    header.write("RIFF", 0);
    header.writeUInt32LE(36 + dataByteLength, 4);
    header.write("WAVE", 8);
    header.write("fmt ", 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(this.numChannels, 22);
    header.writeUInt32LE(this.sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(this.bitDepth, 34);
    header.write("data", 36);
    header.writeUInt32LE(dataByteLength, 40);

    return header;
  }
}
