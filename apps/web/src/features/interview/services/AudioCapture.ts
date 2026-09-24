export interface AudioCaptureOptions {
  sampleRate?: number;
  bufferSize?: number;
  onAudioChunk?: (chunk: ArrayBuffer) => void;
  onLevelChange?: (level: number) => void;
}

export class AudioCapture {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private muteGain: GainNode | null = null;
  private isCapturing: boolean = false;
  private isMuted: boolean = false;
  private ownsMediaStream: boolean = false;

  private readonly targetSampleRate: number;
  private readonly bufferSize: number;
  private onAudioChunk?: (chunk: ArrayBuffer) => void;
  private onLevelChange?: (level: number) => void;

  constructor(options?: AudioCaptureOptions) {
    this.targetSampleRate = options?.sampleRate || 16000;
    this.bufferSize = options?.bufferSize || 4096;
    this.onAudioChunk = options?.onAudioChunk;
    this.onLevelChange = options?.onLevelChange;
  }

  async resume(): Promise<void> {
    if (this.audioContext && (this.audioContext.state === "suspended" || (this.audioContext.state as string) === "interrupted")) {
      try {
        await this.audioContext.resume();
      } catch (err) {
        console.warn("[AudioCapture] AudioContext resume failed:", err);
      }
    }
  }

  async start(stream?: MediaStream | null, _deviceId?: string): Promise<void> {
    if (this.isCapturing) return;

    try {
      if (stream && stream.getAudioTracks().length > 0) {
        this.mediaStream = stream;
        this.ownsMediaStream = false;
      } else {
        // Wait for active media stream from useAudioDevices instead of opening a competing stream
        return;
      }

      // Ensure audio track is enabled
      this.mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !this.isMuted;
      });

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        throw new Error("Web Audio API is not supported in this browser.");
      }

      // DO NOT pass { sampleRate: 16000 } to AudioContext constructor because Chromium
      // outputs complete silence when resampler fails on Windows hardware streams (44.1k/48k).
      // Always initialize AudioContext with default hardware native sample rate.
      this.audioContext = new AudioCtx();

      await this.resume();

      // Ensure user interactions resume audio context if suspended by browser
      const handleUserGesture = () => {
        this.resume();
      };
      window.addEventListener("click", handleUserGesture, { passive: true });
      window.addEventListener("keydown", handleUserGesture, { passive: true });
      window.addEventListener("touchstart", handleUserGesture, { passive: true });

      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;

      // ScriptProcessorNode for extracting PCM audio chunks
      this.processorNode = this.audioContext.createScriptProcessor(
        this.bufferSize,
        1, // mono input
        1  // mono output
      );

      const inputSampleRate = this.audioContext.sampleRate;
      console.log(`[AudioCapture] Capturing audio from stream at native rate ${inputSampleRate}Hz -> target ${this.targetSampleRate}Hz`);

      this.processorNode.onaudioprocess = (e: AudioProcessingEvent) => {
        if (!this.isCapturing || this.isMuted) return;

        const inputData = e.inputBuffer.getChannelData(0);

        // 1. Calculate live RMS level
        let sumSquares = 0;
        for (let i = 0; i < inputData.length; i++) {
          sumSquares += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sumSquares / inputData.length);
        const normalizedLevel = Math.min(1.0, rms * 5.0);
        this.onLevelChange?.(normalizedLevel);

        // 2. Downsample and encode to 16kHz 16-bit PCM Int16
        const pcmBuffer = this.downsampleAndEncodePcm(
          inputData,
          inputSampleRate,
          this.targetSampleRate
        );

        if (pcmBuffer.byteLength > 0) {
          this.onAudioChunk?.(pcmBuffer);
        }
      };

      this.sourceNode.connect(this.analyserNode);
      this.sourceNode.connect(this.processorNode);

      // Connect processor through a zero-gain node to destination to keep audio graph running
      this.muteGain = this.audioContext.createGain();
      this.muteGain.gain.value = 0;
      this.processorNode.connect(this.muteGain);
      this.muteGain.connect(this.audioContext.destination);

      this.isCapturing = true;
    } catch (err) {
      console.error("[AudioCapture] Failed to initialize audio capture:", err);
      throw err;
    }
  }

  updateStream(newStream: MediaStream | null): void {
    if (!newStream || newStream.getAudioTracks().length === 0) return;

    if (!this.isCapturing) {
      this.start(newStream);
      return;
    }

    this.mediaStream = newStream;
    this.ownsMediaStream = false;

    // Ensure audio track is enabled
    this.mediaStream.getAudioTracks().forEach((track) => {
      track.enabled = !this.isMuted;
    });

    if (this.audioContext && this.audioContext.state !== "closed" && this.isCapturing) {
      try {
        if (this.sourceNode) {
          this.sourceNode.disconnect();
        }
        this.sourceNode = this.audioContext.createMediaStreamSource(newStream);
        if (this.analyserNode) {
          this.sourceNode.connect(this.analyserNode);
        }
        if (this.processorNode) {
          this.sourceNode.connect(this.processorNode);
        }
        this.resume();
      } catch (err) {
        console.error("[AudioCapture] Failed to update media stream source:", err);
      }
    }
  }

  private downsampleAndEncodePcm(
    inputSamples: Float32Array,
    inputRate: number,
    targetRate: number
  ): ArrayBuffer {
    let samples: Float32Array;

    if (inputRate === targetRate) {
      samples = inputSamples;
    } else {
      const ratio = inputRate / targetRate;
      const targetLength = Math.floor(inputSamples.length / ratio);
      samples = new Float32Array(targetLength);

      for (let i = 0; i < targetLength; i++) {
        const pos = i * ratio;
        const index = Math.floor(pos);
        const frac = pos - index;
        const nextIndex = Math.min(index + 1, inputSamples.length - 1);
        samples[i] = inputSamples[index] * (1 - frac) + inputSamples[nextIndex] * frac;
      }
    }

    // Convert Float32 [-1.0, 1.0] to 16-bit Linear PCM Int16
    const pcm16 = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1.0, Math.min(1.0, samples[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    return pcm16.buffer.slice(pcm16.byteOffset, pcm16.byteOffset + pcm16.byteLength);
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
    if (muted) {
      this.onLevelChange?.(0);
    }
  }

  getIsMuted(): boolean {
    return this.isMuted;
  }

  getIsCapturing(): boolean {
    return this.isCapturing;
  }

  stop(): void {
    this.isCapturing = false;
    this.isMuted = false;

    if (this.ownsMediaStream && this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      this.mediaStream = null;
    }

    if (this.processorNode) {
      try {
        this.processorNode.disconnect();
      } catch {}
      this.processorNode = null;
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {}
      this.sourceNode = null;
    }

    if (this.analyserNode) {
      try {
        this.analyserNode.disconnect();
      } catch {}
      this.analyserNode = null;
    }

    if (this.muteGain) {
      try {
        this.muteGain.disconnect();
      } catch {}
      this.muteGain = null;
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }

    this.onLevelChange?.(0);
  }
}
