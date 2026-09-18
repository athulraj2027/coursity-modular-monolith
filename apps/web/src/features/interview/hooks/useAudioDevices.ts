import { useState, useEffect, useCallback, useRef } from "react";
import { DeviceManager, type DevicePermissions } from "../services/DeviceManager";
import type { AudioDevice } from "../types/interview.types";

export function useAudioDevices() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissions, setPermissions] = useState<DevicePermissions>({
    microphone: false,
    camera: false,
  });
  const [microphones, setMicrophones] = useState<AudioDevice[]>([]);
  const [speakers, setSpeakers] = useState<AudioDevice[]>([]);
  const [cameras, setCameras] = useState<AudioDevice[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>("");
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>("");
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [micLevel, setMicLevel] = useState(0);
  const [isPlayingTestTone, setIsPlayingTestTone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const requestDevices = useCallback(async (withVideo: boolean = true) => {
    try {
      setError(null);
      const res = await DeviceManager.requestPermissions(withVideo);
      if (res.error) {
        setError(res.error);
      }

      setStream(res.stream);
      setPermissions(res.permissions);

      const deviceList = await DeviceManager.getDevices();
      setMicrophones(deviceList.microphones);
      setSpeakers(deviceList.speakers);
      setCameras(deviceList.cameras);

      if (deviceList.microphones.length > 0 && !selectedMicId) {
        setSelectedMicId(deviceList.microphones[0].deviceId);
      }
      if (deviceList.speakers.length > 0 && !selectedSpeakerId) {
        setSelectedSpeakerId(deviceList.speakers[0].deviceId);
      }
      if (deviceList.cameras.length > 0 && !selectedCameraId) {
        setSelectedCameraId(deviceList.cameras[0].deviceId);
      }

      // Start local mic level monitoring if audio track exists
      if (res.stream && res.stream.getAudioTracks().length > 0) {
        startMicMonitoring(res.stream);
      }
    } catch (err: any) {
      setError(err.message || "Failed to initialize devices");
    }
  }, [selectedMicId, selectedSpeakerId, selectedCameraId]);

  const startMicMonitoring = (mediaStream: MediaStream) => {
    try {
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(mediaStream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      source.connect(analyser);

      const dataArray = new Uint8Array(128);

      const updateMeter = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteTimeDomainData(dataArray);
          let sumSquares = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const norm = (dataArray[i] - 128) / 128.0;
            sumSquares += norm * norm;
          }
          const rms = Math.sqrt(sumSquares / dataArray.length);
          setMicLevel(Math.min(1.0, rms * 4.5));
        }
        animFrameRef.current = requestAnimationFrame(updateMeter);
      };

      animFrameRef.current = requestAnimationFrame(updateMeter);
    } catch (e) {
      console.error("[useAudioDevices] Error starting mic monitoring:", e);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      const nextState = !isCameraEnabled;
      videoTracks.forEach((t) => {
        t.enabled = nextState;
      });
      setIsCameraEnabled(nextState);
    }
  };

  const toggleMic = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      const nextState = !isMicEnabled;
      audioTracks.forEach((t) => {
        t.enabled = nextState;
      });
      setIsMicEnabled(nextState);
      if (!nextState) setMicLevel(0);
    }
  };

  const stopAllDevices = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {}
      });
      setStream(null);
    }
    setMicLevel(0);
  }, [stream]);

  const testSpeaker = async () => {
    setIsPlayingTestTone(true);
    await DeviceManager.playSpeakerTest(selectedSpeakerId);
    setTimeout(() => {
      setIsPlayingTestTone(false);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        try {
          audioContextRef.current.close();
        } catch {}
        audioContextRef.current = null;
      }
      if (stream) {
        stream.getTracks().forEach((t) => {
          try {
            t.stop();
          } catch {}
        });
      }
    };
  }, [stream]);

  return {
    stream,
    permissions,
    microphones,
    speakers,
    cameras,
    selectedMicId,
    selectedSpeakerId,
    selectedCameraId,
    setSelectedMicId,
    setSelectedSpeakerId,
    setSelectedCameraId,
    isCameraEnabled,
    isMicEnabled,
    micLevel,
    isPlayingTestTone,
    error,
    requestDevices,
    stopAllDevices,
    toggleCamera,
    toggleMic,
    testSpeaker,
  };
}
