export interface IAudioStorageService {
  uploadAudioRecording(sessionId: string, wavBuffer: Buffer): Promise<string>;
}
