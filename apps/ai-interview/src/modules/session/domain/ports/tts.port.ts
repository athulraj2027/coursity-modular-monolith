export interface ITTSService {
  synthesizeSpeech(text: string, voiceId?: string): Promise<Buffer>;
}
