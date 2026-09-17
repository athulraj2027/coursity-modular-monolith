export interface ISTTService {
  transcribeAudio(pcmBuffer: Buffer, sampleRate?: number): Promise<string>;
}
