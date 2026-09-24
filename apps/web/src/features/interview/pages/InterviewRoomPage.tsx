import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/features/auth";
import { useInterviewSession } from "../hooks/useInterviewSession";
import { useAudioDevices } from "../hooks/useAudioDevices";
import { useInterviewSocket } from "../hooks/useInterviewSocket";
import { AIInterviewerOrb } from "../components/AIInterviewerOrb";
import { CameraPreview } from "../components/CameraPreview";
import { LiveCaptions } from "../components/LiveCaptions";
import { TranscriptPanel } from "../components/TranscriptPanel";
import { InterviewControls } from "../components/InterviewControls";
import { InterviewTimer } from "../components/InterviewTimer";
import { NetworkIndicator } from "../components/NetworkIndicator";
import { EndInterviewDialog } from "../components/EndInterviewDialog";
import { Loader2, AlertCircle, Send, MessageSquareText } from "lucide-react";

export const InterviewRoomPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  const { session, realtimeToken, loading: sessionLoading, error: sessionError, completeSession } =
    useInterviewSession(sessionId);

  const isTeacher = user?.role?.toUpperCase() === "TEACHER" || session?.type === "TEACHER_VETTING";

  const handleFinishRedirect = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    queryClient.invalidateQueries({ queryKey: ["current-user"] });
    queryClient.invalidateQueries({ queryKey: ["my-vetting-interviews"] });
    if (sessionId) {
      queryClient.invalidateQueries({ queryKey: ["interview-session", sessionId] });
    }

    if (isTeacher) {
      navigate("/teachers/onboarding/interview", { replace: true });
    } else {
      navigate("/students/dashboard", { replace: true });
    }
  }, [isTeacher, navigate, queryClient, sessionId]);

  // If user navigates back to an already completed/evaluated session, redirect immediately
  useEffect(() => {
    if (
      session &&
      (session.status === "COMPLETED" ||
        session.status === "EVALUATED" ||
        session.status === "EVALUATING" ||
        session.status === "CANCELLED" ||
        session.status === "ABANDONED")
    ) {
      handleFinishRedirect();
    }
  }, [session, handleFinishRedirect]);

  const {
    stream,
    isCameraEnabled,
    toggleCamera,
    requestDevices,
    stopAllDevices,
    selectedMicId,
  } = useAudioDevices();

  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [areCaptionsVisible, setAreCaptionsVisible] = useState(true);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isTextChatOpen, setIsTextChatOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Initialize Audio & Devices on Room enter
  useEffect(() => {
    requestDevices(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hook into Realtime AI Interview WebSocket
  const {
    connectionState,
    networkQuality,
    orbState,
    currentSpeaker,
    currentPhase,
    transcripts,
    currentCaption,
    micLevel,
    aiAudioLevel,
    aiSpeechProgress,
    isMicMuted,
    isSpeakerMuted,
    toggleMic,
    toggleSpeaker,
    interrupt,
    sendTextInput,
    stopAudio,
    endInterview,
  } = useInterviewSocket({
    token: realtimeToken?.token || null,
    sessionId: sessionId || "",
    stream,
    micDeviceId: selectedMicId,
    autoConnect: true,
    onSessionComplete: () => {
      stopAllDevices();
      stopAudio();
      handleFinishRedirect();
    },
  });

  // Ensure camera and microphone hardware tracks are stopped on unmount
  useEffect(() => {
    return () => {
      stopAllDevices();
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim()) return;
    sendTextInput(textInput.trim());
    setTextInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleConfirmEnd = async () => {
    try {
      setIsEnding(true);
      endInterview();
      stopAllDevices();
      stopAudio();
      await completeSession();
    } catch (err) {
      console.error("Error ending interview:", err);
      stopAllDevices();
      stopAudio();
    } finally {
      setIsEnding(false);
      setShowEndDialog(false);
      handleFinishRedirect();
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center space-y-4 text-white">
        <div className="w-12 h-12 border-4 border-[#F42A18] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-neutral-400">Connecting to AI Interview Room...</p>
      </div>
    );
  }

  if (sessionError || !session) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full p-8 bg-neutral-900 border border-neutral-800 rounded-3xl text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold">Unable to Join Session</h2>
          <p className="text-xs text-neutral-400">{sessionError || "Session expired or invalid token."}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2.5 bg-[#F42A18] text-white text-xs font-semibold rounded-xl"
          >
            Exit to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const candidateName = session.user?.name || "Candidate";

  return (
    <div className="h-screen max-h-screen w-full bg-neutral-950 text-white flex flex-col justify-between relative overflow-hidden select-none">
      {/* 1. Top Bar */}
      <header className="h-16 flex-shrink-0 px-4 md:px-6 flex items-center justify-between border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#F42A18] flex items-center justify-center font-bold text-white shadow-lg shadow-red-500/20">
            C
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white truncate max-w-[200px] md:max-w-md">
                {session.template?.title || `${session.domain || "AI"} Interview`}
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-400 border border-neutral-700">
                {session.difficulty}
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 font-medium">
              Phase: {currentPhase.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NetworkIndicator quality={networkQuality} connectionState={connectionState} />
          <InterviewTimer startedAt={session.startedAt} isRunning={true} />
        </div>
      </header>

      {/* 2. Main Stage Area */}
      <main className="flex-1 min-h-0 relative overflow-hidden flex">
        {/* Center Stage: AI Orb + Captions */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-3 relative z-10 overflow-hidden">
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className={`w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-700 ${
                orbState === "SPEAKING"
                  ? "bg-[#F42A18]"
                  : orbState === "LISTENING"
                  ? "bg-blue-600"
                  : orbState === "THINKING"
                  ? "bg-purple-600"
                  : "bg-neutral-700"
              }`}
            />
          </div>

          {/* AI Voice Orb & Dynamic Spoken Captions */}
          <div className="my-auto flex flex-col items-center justify-center space-y-4 w-full max-w-2xl px-2">
            <AIInterviewerOrb
              state={orbState}
              audioLevel={orbState === "SPEAKING" ? aiAudioLevel : micLevel}
              size={220}
            />

            {/* Live Subtitles / Captions (Appears only when AI is speaking with live progress highlight) */}
            <LiveCaptions
              speaker={currentSpeaker}
              captionText={currentCaption}
              isVisible={areCaptionsVisible}
              isAiSpeaking={orbState === "SPEAKING"}
              speechProgress={aiSpeechProgress}
            />
          </div>

          {/* Floating Candidate Video Tile (Bottom Right on desktop, top on mobile) */}
          <div className="absolute bottom-3 right-4 w-40 md:w-52 aspect-video z-20 transition-all duration-300">
            <CameraPreview
              stream={stream}
              candidateName={candidateName}
              isCameraOn={isCameraEnabled}
              isMicMuted={isMicMuted}
              micLevel={micLevel}
              className="w-full h-full border border-neutral-700/80 shadow-2xl"
            />
          </div>
        </div>

        {/* Collapsible Transcript Drawer */}
        <TranscriptPanel
          transcripts={transcripts}
          isOpen={isTranscriptOpen}
          onClose={() => setIsTranscriptOpen(false)}
        />
      </main>

      {/* 3. Bottom Controls & Text Response Toolbar */}
      <footer className="flex-shrink-0 p-3 pb-5 flex flex-col items-center justify-center gap-2.5 max-w-3xl mx-auto w-full z-20">
        {/* Optional Text Reply Input Bar (ChatGPT / WhatsApp Style Multiline) */}
        {isTextChatOpen ? (
          <form
            onSubmit={handleSendText}
            className="w-full max-w-xl flex flex-col bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/80 rounded-2xl p-2.5 shadow-2xl transition-all"
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={textInput}
                rows={1}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendText();
                  }
                }}
                placeholder="Type your response here... (Press Enter ↵ to send, Shift+Enter for newline)"
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none resize-none max-h-[120px] overflow-y-auto interview-scrollbar leading-relaxed"
                autoFocus
              />
              <button
                type="submit"
                disabled={!textInput.trim() || orbState === "SPEAKING"}
                className="px-3.5 py-2 bg-[#F42A18] hover:bg-[#d82212] disabled:opacity-40 disabled:hover:bg-[#F42A18] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow flex-shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between px-3 pt-1 text-[10px] text-neutral-500 select-none">
              <span>Press ↵ Enter to send • Shift+Enter for new line</span>
              <span>{textInput.length} chars</span>
            </div>
          </form>
        ) : null}

        <div className="flex items-center gap-2">
          <InterviewControls
            isMicMuted={isMicMuted}
            isCameraOn={isCameraEnabled}
            isSpeakerMuted={isSpeakerMuted}
            isTranscriptOpen={isTranscriptOpen}
            areCaptionsVisible={areCaptionsVisible}
            isAiSpeaking={orbState === "SPEAKING"}
            onToggleMic={toggleMic}
            onToggleCamera={toggleCamera}
            onToggleSpeaker={toggleSpeaker}
            onToggleTranscript={() => setIsTranscriptOpen((prev) => !prev)}
            onToggleCaptions={() => setAreCaptionsVisible((prev) => !prev)}
            onInterrupt={interrupt}
            onEndInterview={() => setShowEndDialog(true)}
          />

          {/* Quick Toggle for Keyboard / Text Reply */}
          <button
            onClick={() => setIsTextChatOpen((prev) => !prev)}
            title={isTextChatOpen ? "Hide Text Input" : "Type Response with Keyboard"}
            className={`p-3.5 rounded-full transition-all duration-200 flex items-center justify-center ${
              isTextChatOpen
                ? "bg-[#F42A18]/20 text-[#F42A18] border border-[#F42A18]/40"
                : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:bg-neutral-800 hover:text-white"
            }`}
          >
            <MessageSquareText className="w-5 h-5" />
          </button>
        </div>
      </footer>

      {/* 4. End Interview Confirmation Dialog */}
      <EndInterviewDialog
        isOpen={showEndDialog}
        onCancel={() => setShowEndDialog(false)}
        onConfirm={handleConfirmEnd}
        isSubmitting={isEnding}
      />

      {/* 5. Evaluating Transition Overlay */}
      {orbState === "COMPLETING" && (
        <div className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex flex-col items-center justify-center space-y-4 text-white">
          <Loader2 className="w-12 h-12 text-[#F42A18] animate-spin" />
          <h2 className="text-xl font-bold">Finalizing Assessment Dossier...</h2>
          <p className="text-xs text-neutral-400">
            Evaluating multi-agent rubric scores, coaching strengths, and transcript analysis.
          </p>
        </div>
      )}
    </div>
  );
};

export default InterviewRoomPage;
