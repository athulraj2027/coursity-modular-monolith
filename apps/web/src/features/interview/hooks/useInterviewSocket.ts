import { useState, useEffect, useRef, useCallback } from "react";
import { InterviewSocket } from "../services/InterviewSocket";
import { AudioCapture } from "../services/AudioCapture";
import { AudioPlayback } from "../services/AudioPlayback";
import type {
  ConnectionState,
  NetworkQuality,
  OrbState,
  InterviewTranscript,
  InboundTranscriptMessage,
  InboundEvaluationReportMessage,
} from "../types/interview.types";

export interface UseInterviewSocketOptions {
  token: string | null;
  sessionId: string;
  autoConnect?: boolean;
  onSessionComplete?: (report: InboundEvaluationReportMessage["report"]) => void;
}

export function useInterviewSocket({
  token,
  sessionId,
  autoConnect = true,
  onSessionComplete,
}: UseInterviewSocketOptions) {
  const [connectionState, setConnectionState] = useState<ConnectionState>("DISCONNECTED");
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality>("EXCELLENT");
  const [orbState, setOrbState] = useState<OrbState>("IDLE");
  const [currentSpeaker, setCurrentSpeaker] = useState<"AI" | "CANDIDATE" | "NONE">("NONE");
  const [transcripts, setTranscripts] = useState<InterviewTranscript[]>([]);
  const [currentCaption, setCurrentCaption] = useState<string>("");
  const [currentPhase, setCurrentPhase] = useState<string>("INITIALIZING");
  const [evaluationReport, setEvaluationReport] = useState<InboundEvaluationReportMessage["report"] | null>(null);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [aiAudioLevel, setAiAudioLevel] = useState<number>(0);
  const [aiSpeechProgress, setAiSpeechProgress] = useState<number>(0);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const socketRef = useRef<InterviewSocket | null>(null);
  const audioCaptureRef = useRef<AudioCapture | null>(null);
  const audioPlaybackRef = useRef<AudioPlayback | null>(null);
  const onSessionCompleteRef = useRef(onSessionComplete);

  useEffect(() => {
    onSessionCompleteRef.current = onSessionComplete;
  }, [onSessionComplete]);

  // Initialize Audio Services (Stable, zero volatile state dependencies)
  const initAudio = useCallback(async (existingStream?: MediaStream | null, micDeviceId?: string) => {
    try {
      // 1. Audio Playback
      if (!audioPlaybackRef.current) {
        audioPlaybackRef.current = new AudioPlayback({
          onLevelChange: (lvl) => setAiAudioLevel(lvl),
          onProgressChange: (prog) => setAiSpeechProgress(prog),
          onPlaybackStateChange: (isPlaying) => {
            if (isPlaying) {
              setOrbState("SPEAKING");
              setCurrentSpeaker("AI");
            } else {
              setOrbState("LISTENING");
              setCurrentSpeaker("CANDIDATE");
              setAiSpeechProgress(1.0);
            }
          },
        });
      }

      // 2. Audio Capture
      if (!audioCaptureRef.current) {
        audioCaptureRef.current = new AudioCapture({
          sampleRate: 16000,
          onAudioChunk: (pcmChunk) => {
            if (socketRef.current) {
              socketRef.current.sendAudioChunk(pcmChunk);
            }
          },
          onLevelChange: (lvl) => {
            setMicLevel(lvl);
            if (lvl > 0.08) {
              setCurrentSpeaker((prev) => {
                if (prev !== "AI") {
                  setOrbState("LISTENING");
                  return "CANDIDATE";
                }
                return prev;
              });
            }
          },
        });
        await audioCaptureRef.current.start(existingStream || undefined, micDeviceId);
      }
    } catch (err: any) {
      console.error("[useInterviewSocket] Failed to init audio capture/playback:", err);
      setErrorMessage("Microphone access is required for real-time AI interview.");
    }
  }, []);

  // Connect WebSocket
  const connect = useCallback(async (existingStream?: MediaStream | null, micDeviceId?: string) => {
    if (!token || !sessionId) return;

    await initAudio(existingStream, micDeviceId);

    if (socketRef.current) {
      socketRef.current.close();
    }

    const socket = new InterviewSocket(token, sessionId, {
      onConnectionStateChange: (st) => setConnectionState(st),
      onNetworkQualityChange: (q) => setNetworkQuality(q),
      onAuthSuccess: () => {
        setConnectionState("CONNECTED");
        setOrbState("IDLE");
      },
      onTranscript: (msg: InboundTranscriptMessage) => {
        setTranscripts((prev) => [
          ...prev,
          {
            sessionId,
            role: msg.role,
            content: msg.content,
            sequenceOrder: msg.sequenceOrder,
            phase: msg.phase,
            createdAt: new Date().toISOString(),
          },
        ]);
        setCurrentCaption(msg.content);
        if (msg.role === "CANDIDATE") {
          setOrbState("THINKING");
          setCurrentSpeaker("NONE");
        }
      },
      onSpeakingStart: (content) => {
        setOrbState("SPEAKING");
        setCurrentSpeaker("AI");
        setAiSpeechProgress(0);
        if (content) setCurrentCaption(content);
        audioPlaybackRef.current?.resume();
      },
      onSpeakingEnd: () => {
        setOrbState("LISTENING");
        setCurrentSpeaker("CANDIDATE");
        setAiSpeechProgress(1.0);
      },
      onAudioChunk: (base64Pcm) => {
        audioPlaybackRef.current?.enqueuePcmChunk(base64Pcm);
      },
      onAnswerAnalysis: () => {
        // Optional turn analysis signal
      },
      onInterruptionAck: () => {
        audioPlaybackRef.current?.interrupt();
        setOrbState("LISTENING");
        setCurrentSpeaker("CANDIDATE");
        setAiSpeechProgress(0);
      },
      onSessionState: (phase) => {
        setCurrentPhase(phase);
        if (phase === "EVALUATING" || phase === "COMPLETED") {
          setOrbState("COMPLETING");
        }
      },
      onEvaluationReport: (report) => {
        setEvaluationReport(report);
        setOrbState("COMPLETING");
        onSessionCompleteRef.current?.(report);
      },
      onError: (err) => {
        setErrorMessage(err);
      },
    });

    socketRef.current = socket;
    socket.connect();
  }, [token, sessionId, initAudio]);

  // Handle Mute / Unmute
  const toggleMic = useCallback(() => {
    setIsMicMuted((prev) => {
      const nextState = !prev;
      audioCaptureRef.current?.setMuted(nextState);
      if (nextState) setMicLevel(0);
      return nextState;
    });
  }, []);

  const toggleSpeaker = useCallback(() => {
    setIsSpeakerMuted((prev) => {
      const nextState = !prev;
      audioPlaybackRef.current?.setMuted(nextState);
      return nextState;
    });
  }, []);

  // Barge-in / Interrupt
  const interrupt = useCallback(() => {
    audioPlaybackRef.current?.interrupt();
    socketRef.current?.sendInterrupt();
    setOrbState("LISTENING");
    setCurrentSpeaker("CANDIDATE");
    setAiSpeechProgress(0);
  }, []);

  // Text Answer fallback
  const sendTextInput = useCallback((text: string) => {
    socketRef.current?.sendTextInput(text);
    setOrbState("THINKING");
    setCurrentSpeaker("NONE");
  }, []);

  // Complete Interview
  const endInterview = useCallback(() => {
    socketRef.current?.sendCompleteSession();
    setOrbState("COMPLETING");
  }, []);

  // Stop audio capture & playback explicitly
  const stopAudio = useCallback(() => {
    audioCaptureRef.current?.stop();
    audioPlaybackRef.current?.stop();
  }, []);

  // Auto-connect on mount if token is ready
  useEffect(() => {
    if (autoConnect && token && sessionId) {
      connect();
    }

    return () => {
      socketRef.current?.close();
      audioCaptureRef.current?.stop();
      audioPlaybackRef.current?.stop();
    };
  }, [autoConnect, token, sessionId, connect]);

  return {
    connectionState,
    networkQuality,
    orbState,
    currentSpeaker,
    currentPhase,
    transcripts,
    currentCaption,
    evaluationReport,
    micLevel,
    aiAudioLevel,
    aiSpeechProgress,
    isMicMuted,
    isSpeakerMuted,
    errorMessage,
    connect,
    stopAudio,
    toggleMic,
    toggleSpeaker,
    interrupt,
    sendTextInput,
    endInterview,
  };
}
