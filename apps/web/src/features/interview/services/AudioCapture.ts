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
  private isCapturing: boolean = false;
  private isMuted: boolean = false;

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

  async start(stream?: MediaStream, deviceId?: string): Promise<void> {
    if (this.isCapturing) return;

    try {
      if (stream) {
        this.mediaStream = stream;
      } else {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
          },
          video: false,
        });
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();

      const resumeAudio = async () => {
        if (this.audioContext && this.audioContext.state === "suspended") {
          try {
            await this.audioContext.resume();
          } catch {}
        }
      };

      await resumeAudio();

      // Ensure click/touch resumes audio context if blocked by browser policy
      window.addEventListener("click", resumeAudio, { once: true });
      window.addEventListener("touchstart", resumeAudio, { once: true });

      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;

      // Use ScriptProcessorNode to extract raw PCM audio
      this.processorNode = this.audioContext.createScriptProcessor(
        this.bufferSize,
        1, // mono input
        1  // mono output
      );

      const inputSampleRate = this.audioContext.sampleRate;

      this.processorNode.onaudioprocess = (e: AudioProcessingEvent) => {
        if (!this.isCapturing || this.isMuted) return;

        const inputData = e.inputBuffer.getChannelData(0);

        // 1. Calculate live RMS level
        let sumSquares = 0;
        for (let i = 0; i < inputData.length; i++) {
          sumSquares += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sumSquares / inputData.length);
        const normalizedLevel = Math.min(1.0, rms * 5.0); // scale up for visual feedback
        this.onLevelChange?.(normalizedLevel);

        // 2. Downsample / convert to 16kHz 16-bit PCM Int16
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

      // Connect through a zero-gain node to prevent microphone audio loopback into speakers
      const muteGain = this.audioContext.createGain();
      muteGain.gain.value = 0;
      this.processorNode.connect(muteGain);
      muteGain.connect(this.audioContext.destination);

      this.isCapturing = true;
    } catch (err) {
      console.error("[AudioCapture] Failed to initialize audio capture:", err);
      throw err;
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
      const targetLength = Math.round(inputSamples.length / ratio);
      samples = new Float32Array(targetLength);

      for (let i = 0; i < targetLength; i++) {
        const index = Math.min(Math.round(i * ratio), inputSamples.length - 1);
        samples[i] = inputSamples[index];
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

    if (this.mediaStream) {
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

    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }

    this.onLevelChange?.(0);
  }
}
