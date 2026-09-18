import React, { useEffect, useRef, useState } from "react";
import type { InterviewTranscript } from "../types/interview.types";
import { MessageSquare, X, Bot, User, ArrowDown } from "lucide-react";

interface TranscriptPanelProps {
  transcripts: InterviewTranscript[];
  isOpen: boolean;
  onClose: () => void;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  transcripts,
  isOpen,
  onClose,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
      setIsUserScrolledUp(false);
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 60;
    setIsUserScrolledUp(isScrolledUp);
  };

  useEffect(() => {
    if (!isUserScrolledUp) {
      scrollToBottom();
    }
  }, [transcripts, isUserScrolledUp]);

  if (!isOpen) return null;

  return (
    <div className="w-full md:w-80 lg:w-96 flex flex-col bg-neutral-900/95 backdrop-blur-xl border-l border-neutral-800 h-full min-h-0 shadow-2xl transition-all duration-300 z-30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-800 flex-shrink-0">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <MessageSquare className="w-4 h-4 text-[#F42A18]" />
          <span>Live Transcript</span>
          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full">
            {transcripts.length} turns
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages List */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 p-4 space-y-4 overflow-y-auto interview-scrollbar relative text-xs"
      >
        {transcripts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500 space-y-2">
            <Bot className="w-8 h-8 text-neutral-600" />
            <p className="font-medium text-neutral-400">Interview Transcript</p>
            <p className="text-[11px]">Real-time conversation turns will appear here as you and the AI speak.</p>
          </div>
        ) : (
          transcripts.map((t, index) => {
            const isAI = t.role === "ASSISTANT";
            return (
              <div
                key={index}
                className={`flex gap-2.5 ${isAI ? "items-start" : "items-start flex-row-reverse"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[11px] font-bold ${
                    isAI ? "bg-[#F42A18]/20 text-[#F42A18] border border-[#F42A18]/30" : "bg-blue-600/30 text-blue-300 border border-blue-500/30"
                  }`}
                >
                  {isAI ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[82%] rounded-2xl p-3 space-y-1 ${
                    isAI
                      ? "bg-neutral-800/90 text-neutral-100 rounded-tl-sm border border-neutral-700/50"
                      : "bg-[#F42A18] text-white rounded-tr-sm shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-75">
                    <span className="font-semibold">{isAI ? "AI Interviewer" : "You"}</span>
                    <span>{new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="leading-relaxed text-[12px]">{t.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Scroll to bottom button if user scrolled up */}
      {isUserScrolledUp && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-16 right-6 p-2 bg-[#F42A18] text-white rounded-full shadow-lg hover:bg-[#d82212] transition animate-bounce z-40 flex items-center gap-1 text-[11px] font-semibold"
        >
          <ArrowDown className="w-3.5 h-3.5" /> New Messages
        </button>
      )}
    </div>
  );
};
