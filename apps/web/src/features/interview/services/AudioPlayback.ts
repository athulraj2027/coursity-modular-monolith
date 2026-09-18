export interface AudioPlaybackOptions {
  onLevelChange?: (level: number) => void;
  onPlaybackStateChange?: (isPlaying: boolean) => void;
  onProgressChange?: (progress: number) => void;
}

export class AudioPlayback {
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private activeSourceNodes: AudioBufferSourceNode[] = [];
  private nextPlayTime: number = 0;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;
  private animFrameId: number | null = null;
  private playbackStartTime: number = 0;
  private totalScheduledDuration: number = 0;

  private onLevelChange?: (level: number) => void;
  private onPlaybackStateChange?: (isPlaying: boolean) => void;
  private onProgressChange?: (progress: number) => void;

  constructor(options?: AudioPlaybackOptions) {
    this.onLevelChange = options?.onLevelChange;
    this.onPlaybackStateChange = options?.onPlaybackStateChange;
    this.onProgressChange = options?.onProgressChange;
  }

  private initAudioContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === "closed") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      try {
        this.audioContext = new AudioCtx({ sampleRate: 16000 });
      } catch {
        this.audioContext = new AudioCtx();
      }

      this.gainNode = this.audioContext.createGain();
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;

      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioContext.destination);

      this.startLevelMonitoring();
    }
    return this.audioContext;
  }

  async resume(): Promise<void> {
    const ctx = this.initAudioContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
  }

  enqueuePcmChunk(base64Pcm: string, sampleRate: number = 16000): void {
    if (this.isMuted) return;

    try {
      const ctx = this.initAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // 1. Decode base64 to 16-bit PCM Int16
      const binaryStr = window.atob(base64Pcm);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const int16Array = new Int16Array(bytes.buffer);
      const sampleCount = int16Array.length;
      if (sampleCount === 0) return;

      // 2. Create AudioBuffer and copy normalized Float32 samples
      const audioBuffer = ctx.createBuffer(1, sampleCount, sampleRate);
      const channelData = audioBuffer.getChannelData(0);

      for (let i = 0; i < sampleCount; i++) {
        channelData[i] = int16Array[i] / 32768.0;
      }

      // 3. Schedule playback seamlessly
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode!);

      const now = ctx.currentTime;
      const startTime = Math.max(now, this.nextPlayTime);
      source.start(startTime);
      this.nextPlayTime = startTime + audioBuffer.duration;

      if (this.activeSourceNodes.length === 0) {
        this.playbackStartTime = startTime;
        this.totalScheduledDuration = audioBuffer.duration;
      } else {
        this.totalScheduledDuration += audioBuffer.duration;
      }

      this.activeSourceNodes.push(source);
      this.setPlayingState(true);

      source.onended = () => {
        const idx = this.activeSourceNodes.indexOf(source);
        if (idx !== -1) {
          this.activeSourceNodes.splice(idx, 1);
        }
        if (this.activeSourceNodes.length === 0) {
          this.setPlayingState(false);
          this.onLevelChange?.(0);
          this.onProgressChange?.(1.0);
          this.totalScheduledDuration = 0;
        }
      };
    } catch (err) {
      console.error("[AudioPlayback] Error enqueueing PCM chunk:", err);
    }
  }

  interrupt(): void {
    // Instantly stop all playing audio (for barge-in)
    this.activeSourceNodes.forEach((node) => {
      try {
        node.stop();
        node.disconnect();
      } catch {}
    });
    this.activeSourceNodes = [];
    if (this.audioContext) {
      this.nextPlayTime = this.audioContext.currentTime;
    }
    this.totalScheduledDuration = 0;
    this.setPlayingState(false);
    this.onLevelChange?.(0);
    this.onProgressChange?.(0);
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.setValueAtTime(muted ? 0 : 1, this.audioContext.currentTime);
    }
    if (muted) {
      this.interrupt();
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private setPlayingState(playing: boolean): void {
    if (this.isPlaying !== playing) {
      this.isPlaying = playing;
      this.onPlaybackStateChange?.(playing);
    }
  }

  private startLevelMonitoring(): void {
    if (this.animFrameId !== null) return;

    const dataArray = new Uint8Array(128);

    const checkLevel = () => {
      if (this.analyserNode && this.isPlaying && !this.isMuted) {
        this.analyserNode.getByteTimeDomainData(dataArray);
        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const norm = (dataArray[i] - 128) / 128.0;
          sumSquares += norm * norm;
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);
        this.onLevelChange?.(Math.min(1.0, rms * 4.0));

        if (this.audioContext && this.totalScheduledDuration > 0) {
          const elapsed = this.audioContext.currentTime - this.playbackStartTime;
          const progress = Math.min(1.0, Math.max(0, elapsed / this.totalScheduledDuration));
          this.onProgressChange?.(progress);
        }
      } else {
        this.onLevelChange?.(0);
      }
      this.animFrameId = requestAnimationFrame(checkLevel);
    };

    this.animFrameId = requestAnimationFrame(checkLevel);
  }

  stop(): void {
    this.interrupt();
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
  }
}
