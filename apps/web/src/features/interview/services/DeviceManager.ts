import type { AudioDevice } from "../types/interview.types";

export interface DevicePermissions {
  microphone: boolean;
  camera: boolean;
}

export const DEVICE_STORAGE_KEYS = {
  MIC: "coursity_preferred_mic_id",
  CAMERA: "coursity_preferred_cam_id",
  SPEAKER: "coursity_preferred_speaker_id",
};

export class DeviceManager {
  static getPreferredMic(): string {
    try {
      return localStorage.getItem(DEVICE_STORAGE_KEYS.MIC) || "";
    } catch {
      return "";
    }
  }

  static setPreferredMic(deviceId: string): void {
    try {
      if (deviceId) {
        localStorage.setItem(DEVICE_STORAGE_KEYS.MIC, deviceId);
      }
    } catch {}
  }

  static getPreferredCamera(): string {
    try {
      return localStorage.getItem(DEVICE_STORAGE_KEYS.CAMERA) || "";
    } catch {
      return "";
    }
  }

  static setPreferredCamera(deviceId: string): void {
    try {
      if (deviceId) {
        localStorage.setItem(DEVICE_STORAGE_KEYS.CAMERA, deviceId);
      }
    } catch {}
  }

  static getPreferredSpeaker(): string {
    try {
      return localStorage.getItem(DEVICE_STORAGE_KEYS.SPEAKER) || "";
    } catch {
      return "";
    }
  }

  static setPreferredSpeaker(deviceId: string): void {
    try {
      if (deviceId) {
        localStorage.setItem(DEVICE_STORAGE_KEYS.SPEAKER, deviceId);
      }
    } catch {}
  }

  static async requestPermissions(
    withVideo: boolean = true,
    micDeviceId?: string,
    cameraDeviceId?: string
  ): Promise<{
    stream: MediaStream | null;
    permissions: DevicePermissions;
    error?: string;
  }> {
    const targetMic = micDeviceId || this.getPreferredMic();
    const targetCam = cameraDeviceId || this.getPreferredCamera();

    // 1. Try exact device constraints first to respect user's explicit selection
    try {
      const audioConstraints: MediaTrackConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        ...(targetMic ? { deviceId: { exact: targetMic } } : {}),
      };

      const videoConstraints: MediaTrackConstraints | boolean = withVideo
        ? {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            ...(targetCam ? { deviceId: { exact: targetCam } } : {}),
          }
        : false;

      const constraints: MediaStreamConstraints = {
        audio: audioConstraints,
        video: videoConstraints,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return {
        stream,
        permissions: {
          microphone: stream.getAudioTracks().length > 0,
          camera: stream.getVideoTracks().length > 0,
        },
      };
    } catch {
      // 2. If exact device constraint is unavailable, fallback to ideal constraint
      try {
        const fallbackAudioConstraints: MediaTrackConstraints = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          ...(targetMic ? { deviceId: { ideal: targetMic } } : {}),
        };

        const fallbackVideoConstraints: MediaTrackConstraints | boolean = withVideo
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              ...(targetCam ? { deviceId: { ideal: targetCam } } : {}),
            }
          : false;

        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          audio: fallbackAudioConstraints,
          video: fallbackVideoConstraints,
        });

        return {
          stream: fallbackStream,
          permissions: {
            microphone: fallbackStream.getAudioTracks().length > 0,
            camera: fallbackStream.getVideoTracks().length > 0,
          },
        };
      } catch (err: any) {
        // 3. If combined request fails, fallback to audio-only
        if (withVideo) {
          try {
            const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                ...(targetMic ? { deviceId: { ideal: targetMic } } : {}),
              },
              video: false,
            });
            return {
              stream: audioOnlyStream,
              permissions: {
                microphone: true,
                camera: false,
              },
            };
          } catch (audioErr: any) {
            return {
              stream: null,
              permissions: { microphone: false, camera: false },
              error: audioErr.message || "Microphone access denied",
            };
          }
        }

        return {
          stream: null,
          permissions: { microphone: false, camera: false },
          error: err.message || "Device permissions denied",
        };
      }
    }
  }

  static async getAudioStream(micDeviceId?: string): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        ...(micDeviceId ? { deviceId: { exact: micDeviceId } } : {}),
      },
      video: false,
    });
  }

  static async getDevices(): Promise<{
    microphones: AudioDevice[];
    speakers: AudioDevice[];
    cameras: AudioDevice[];
  }> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const microphones: AudioDevice[] = [];
      const speakers: AudioDevice[] = [];
      const cameras: AudioDevice[] = [];

      devices.forEach((d) => {
        const item: AudioDevice = {
          deviceId: d.deviceId,
          label: d.label || `${d.kind} (${d.deviceId.slice(0, 5)}...)`,
          kind: d.kind,
        };

        if (d.kind === "audioinput") {
          microphones.push(item);
        } else if (d.kind === "audiooutput") {
          speakers.push(item);
        } else if (d.kind === "videoinput") {
          cameras.push(item);
        }
      });

      return { microphones, speakers, cameras };
    } catch {
      return { microphones: [], speakers: [], cameras: [] };
    }
  }

  static async playSpeakerTest(outputDeviceId?: string): Promise<void> {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();

      if (outputDeviceId && typeof (ctx as any).setSinkId === "function") {
        try {
          await (ctx as any).setSinkId(outputDeviceId);
        } catch {
          // ignore if setSinkId not supported
        }
      }

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      const now = ctx.currentTime;
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.15); // E5
      osc1.frequency.setValueAtTime(783.99, now + 0.3); // G5
      osc1.frequency.setValueAtTime(1046.5, now + 0.45); // C6

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(261.63, now); // C4

      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.85);
      osc2.stop(now + 0.85);

      setTimeout(() => {
        try {
          ctx.close();
        } catch {
          // ignore
        }
      }, 1000);
    } catch (e) {
      console.error("[DeviceManager] Error playing test audio:", e);
    }
  }
}
