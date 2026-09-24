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
  const [selectedMicId, setSelectedMicIdState] = useState<string>(() => DeviceManager.getPreferredMic());
  const [selectedSpeakerId, setSelectedSpeakerIdState] = useState<string>(() => DeviceManager.getPreferredSpeaker());
  const [selectedCameraId, setSelectedCameraIdState] = useState<string>(() => DeviceManager.getPreferredCamera());
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [micLevel, setMicLevel] = useState(0);
  const [isPlayingTestTone, setIsPlayingTestTone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startMicMonitoring = useCallback((mediaStream: MediaStream) => {
    try {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        try {
          audioContextRef.current.close();
        } catch {}
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
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
  }, []);

  const requestDevices = useCallback(async (withVideo: boolean = true) => {
    try {
      setError(null);
      const currentMic = DeviceManager.getPreferredMic();
      const currentCam = DeviceManager.getPreferredCamera();

      const res = await DeviceManager.requestPermissions(withVideo, currentMic || undefined, currentCam || undefined);
      if (res.error) {
        setError(res.error);
      }

      setStream(res.stream);
      setPermissions(res.permissions);

      const deviceList = await DeviceManager.getDevices();
      setMicrophones(deviceList.microphones);
      setSpeakers(deviceList.speakers);
      setCameras(deviceList.cameras);

      // Keep user's chosen microphone or pick the first available
      const matchedMic = currentMic ? deviceList.microphones.find(m => m.deviceId === currentMic) : null;
      if (matchedMic) {
        setSelectedMicIdState(matchedMic.deviceId);
      } else if (deviceList.microphones.length > 0) {
        setSelectedMicIdState(deviceList.microphones[0].deviceId);
        DeviceManager.setPreferredMic(deviceList.microphones[0].deviceId);
      }

      // Keep user's chosen speaker or pick the first available
      const currentSpeaker = DeviceManager.getPreferredSpeaker();
      const matchedSpeaker = currentSpeaker ? deviceList.speakers.find(s => s.deviceId === currentSpeaker) : null;
      if (matchedSpeaker) {
        setSelectedSpeakerIdState(matchedSpeaker.deviceId);
      } else if (deviceList.speakers.length > 0) {
        setSelectedSpeakerIdState(deviceList.speakers[0].deviceId);
        DeviceManager.setPreferredSpeaker(deviceList.speakers[0].deviceId);
      }

      // Keep user's chosen camera or pick the first available
      const matchedCam = currentCam ? deviceList.cameras.find(c => c.deviceId === currentCam) : null;
      if (matchedCam) {
        setSelectedCameraIdState(matchedCam.deviceId);
      } else if (deviceList.cameras.length > 0) {
        setSelectedCameraIdState(deviceList.cameras[0].deviceId);
        DeviceManager.setPreferredCamera(deviceList.cameras[0].deviceId);
      }

      // Start local mic level monitoring if audio track exists
      if (res.stream && res.stream.getAudioTracks().length > 0) {
        startMicMonitoring(res.stream);
      }
    } catch (err: any) {
      setError(err.message || "Failed to initialize devices");
    }
  }, [startMicMonitoring]);

  const switchMicrophone = useCallback(async (deviceId: string) => {
    setSelectedMicIdState(deviceId);
    DeviceManager.setPreferredMic(deviceId);
    if (!deviceId) return;
    try {
      let newAudioStream: MediaStream;
      try {
        newAudioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: { exact: deviceId },
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch {
        newAudioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: { ideal: deviceId },
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      }
      const newAudioTrack = newAudioStream.getAudioTracks()[0];
      if (!newAudioTrack) return;

      if (stream) {
        stream.getAudioTracks().forEach((t) => {
          try {
            t.stop();
          } catch {}
          stream.removeTrack(t);
        });
        stream.addTrack(newAudioTrack);
        newAudioTrack.enabled = isMicEnabled;
        const updatedStream = new MediaStream(stream.getTracks());
        setStream(updatedStream);
        startMicMonitoring(updatedStream);
      } else {
        newAudioTrack.enabled = isMicEnabled;
        setStream(newAudioStream);
        startMicMonitoring(newAudioStream);
      }
    } catch (err: any) {
      console.error("[useAudioDevices] Failed to switch microphone:", err);
      setError(err.message || "Failed to switch microphone");
    }
  }, [stream, isMicEnabled, startMicMonitoring]);

  const switchCamera = useCallback(async (deviceId: string) => {
    setSelectedCameraIdState(deviceId);
    DeviceManager.setPreferredCamera(deviceId);
    if (!deviceId) return;
    try {
      let newVideoStream: MediaStream;
      try {
        newVideoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch {
        newVideoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { ideal: deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      }
      const newVideoTrack = newVideoStream.getVideoTracks()[0];
      if (!newVideoTrack) return;

      if (stream) {
        stream.getVideoTracks().forEach((t) => {
          try {
            t.stop();
          } catch {}
          stream.removeTrack(t);
        });
        stream.addTrack(newVideoTrack);
        newVideoTrack.enabled = isCameraEnabled;
        const updatedStream = new MediaStream(stream.getTracks());
        setStream(updatedStream);
      } else {
        newVideoTrack.enabled = isCameraEnabled;
        setStream(newVideoStream);
      }
    } catch (err: any) {
      console.error("[useAudioDevices] Failed to switch camera:", err);
      setError(err.message || "Failed to switch camera");
    }
  }, [stream, isCameraEnabled]);

  const setSelectedSpeaker = useCallback((deviceId: string) => {
    setSelectedSpeakerIdState(deviceId);
    DeviceManager.setPreferredSpeaker(deviceId);
  }, []);

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

  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    setStream(null);
    setMicLevel(0);
  }, []);

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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => {
          try {
            t.stop();
          } catch {}
        });
        streamRef.current = null;
      }
    };
  }, []);

  return {
    stream,
    permissions,
    microphones,
    speakers,
    cameras,
    selectedMicId,
    selectedSpeakerId,
    selectedCameraId,
    setSelectedMicId: switchMicrophone,
    setSelectedSpeakerId: setSelectedSpeaker,
    setSelectedCameraId: switchCamera,
    switchMicrophone,
    switchCamera,
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
