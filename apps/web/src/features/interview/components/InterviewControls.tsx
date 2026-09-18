import React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  MessageSquare,
  Subtitles,
  PhoneOff,
  Hand,
} from "lucide-react";

interface InterviewControlsProps {
  isMicMuted: boolean;
  isCameraOn: boolean;
  isSpeakerMuted: boolean;
  isTranscriptOpen: boolean;
  areCaptionsVisible: boolean;
  isAiSpeaking: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleSpeaker: () => void;
  onToggleTranscript: () => void;
  onToggleCaptions: () => void;
  onInterrupt: () => void;
  onEndInterview: () => void;
}

export const InterviewControls: React.FC<InterviewControlsProps> = ({
  isMicMuted,
  isCameraOn,
  isSpeakerMuted,
  isTranscriptOpen,
  areCaptionsVisible,
  isAiSpeaking,
  onToggleMic,
  onToggleCamera,
  onToggleSpeaker,
  onToggleTranscript,
  onToggleCaptions,
  onInterrupt,
  onEndInterview,
}) => {
  return (
    <div className="flex items-center justify-center gap-2.5 sm:gap-4 p-3 bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-full shadow-2xl">
      {/* 1. Microphone Toggle */}
      <button
        onClick={onToggleMic}
        aria-label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
        className={`p-3.5 rounded-full transition-all duration-200 flex items-center justify-center ${
          isMicMuted
            ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
            : "bg-neutral-800 text-neutral-200 border border-neutral-700 hover:bg-neutral-700 hover:text-white"
        }`}
      >
        {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      {/* 2. Camera Toggle */}
      <button
        onClick={onToggleCamera}
        aria-label={isCameraOn ? "Turn off camera" : "Turn on camera"}
        className={`p-3.5 rounded-full transition-all duration-200 flex items-center justify-center ${
          !isCameraOn
            ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
            : "bg-neutral-800 text-neutral-200 border border-neutral-700 hover:bg-neutral-700 hover:text-white"
        }`}
      >
        {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
      </button>

      {/* 3. Speaker / Volume Toggle */}
      <button
        onClick={onToggleSpeaker}
        aria-label={isSpeakerMuted ? "Unmute AI audio" : "Mute AI audio"}
        className={`p-3.5 rounded-full transition-all duration-200 flex items-center justify-center ${
          isSpeakerMuted
            ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
            : "bg-neutral-800 text-neutral-200 border border-neutral-700 hover:bg-neutral-700 hover:text-white"
        }`}
      >
        {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      {/* 4. Barge-in / Interrupt Button (Visible when AI is speaking) */}
      {isAiSpeaking && (
        <button
          onClick={onInterrupt}
          title="Interrupt AI to speak now"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition text-xs font-semibold animate-pulse"
        >
          <Hand className="w-4 h-4" />
          <span className="hidden sm:inline">Interrupt</span>
        </button>
      )}

      {/* Divider */}
      <div className="h-6 w-px bg-neutral-800 hidden sm:block" />

      {/* 5. Captions Toggle */}
      <button
        onClick={onToggleCaptions}
        aria-label="Toggle Live Captions"
        className={`p-3.5 rounded-full transition-all duration-200 flex items-center justify-center ${
          areCaptionsVisible
            ? "bg-[#F42A18]/20 text-[#F42A18] border border-[#F42A18]/40"
            : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700 hover:text-white"
        }`}
      >
        <Subtitles className="w-5 h-5" />
      </button>

      {/* 6. Transcript Panel Toggle */}
      <button
        onClick={onToggleTranscript}
        aria-label="Toggle Live Transcript"
        className={`p-3.5 rounded-full transition-all duration-200 flex items-center justify-center ${
          isTranscriptOpen
            ? "bg-[#F42A18]/20 text-[#F42A18] border border-[#F42A18]/40"
            : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700 hover:text-white"
        }`}
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {/* 7. End Interview Button */}
      <button
        onClick={onEndInterview}
        aria-label="End Interview"
        className="px-5 py-3 rounded-full bg-[#F42A18] hover:bg-[#d82212] text-white font-semibold text-xs flex items-center gap-2 shadow-lg hover:shadow-red-500/20 transition-all duration-200"
      >
        <PhoneOff className="w-4 h-4" />
        <span className="hidden sm:inline">End Interview</span>
      </button>
    </div>
  );
};
