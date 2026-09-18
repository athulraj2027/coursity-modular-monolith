import React, { useEffect, useRef, useMemo } from "react";
import { Volume2 } from "lucide-react";

interface LiveCaptionsProps {
  speaker: "AI" | "CANDIDATE" | "NONE";
  captionText: string;
  isVisible?: boolean;
  isAiSpeaking?: boolean;
  speechProgress?: number; // 0.0 to 1.0
}

export const LiveCaptions: React.FC<LiveCaptionsProps> = ({
  speaker,
  captionText,
  isVisible = true,
  isAiSpeaking = false,
  speechProgress = 0,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const activeWordRef = useRef<HTMLSpanElement | null>(null);

  // Split text into words for progressive speaking highlight
  const words = useMemo(() => {
    if (!captionText) return [];
    return captionText.trim().split(/\s+/);
  }, [captionText]);

  // Current active word index based on audio playback progress
  const activeWordIndex = useMemo(() => {
    if (!words.length || !isAiSpeaking) return -1;
    const clampedProgress = Math.min(1.0, Math.max(0, speechProgress));
    return Math.min(Math.floor(clampedProgress * words.length), words.length - 1);
  }, [words.length, speechProgress, isAiSpeaking]);

  // Auto-scroll inside the captions container to keep active word in view without moving the page
  useEffect(() => {
    if (activeWordRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const element = activeWordRef.current;

      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const elementTop = element.offsetTop;
      const elementBottom = elementTop + element.clientHeight;

      if (elementTop < containerTop || elementBottom > containerBottom) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [activeWordIndex]);

  // Only display captions when AI is actively speaking
  if (!isVisible || !captionText || speaker !== "AI" || !isAiSpeaking) {
    return null;
  }

  const progressPercent = Math.min(100, Math.max(0, Math.round(speechProgress * 100)));

  return (
    <div className="w-full max-w-2xl px-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
      <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-700/80 rounded-2xl p-4 shadow-2xl space-y-3 relative overflow-hidden">
        {/* Top Header & Progress Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-neutral-800/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#F42A18] uppercase tracking-wider bg-[#F42A18]/10 border border-[#F42A18]/25 px-2.5 py-0.5 rounded-full">
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              AI Interviewer Speaking
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-neutral-400">
              {progressPercent}%
            </span>
            <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#F42A18] to-amber-500 transition-all duration-150 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Transcript Text with Active Spoken Word Marker */}
        <div
          ref={scrollRef}
          className="max-h-[110px] md:max-h-[140px] overflow-y-auto pr-1 interview-scrollbar text-left text-sm md:text-base leading-relaxed"
        >
          <p className="flex flex-wrap gap-x-1.5 gap-y-1">
            {words.map((word, idx) => {
              const isSpoken = idx < activeWordIndex;
              const isCurrent = idx === activeWordIndex;

              if (isCurrent) {
                return (
                  <span
                    key={idx}
                    ref={activeWordRef}
                    className="relative inline-flex items-center text-white font-bold bg-[#F42A18]/30 px-1.5 py-0.5 rounded border border-[#F42A18]/50 shadow-[0_0_10px_rgba(244,42,24,0.5)] transition-all duration-100"
                  >
                    <span>{word}</span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#F42A18] animate-ping ml-1" />
                  </span>
                );
              }

              if (isSpoken) {
                return (
                  <span
                    key={idx}
                    className="text-neutral-100 font-medium transition-colors duration-150"
                  >
                    {word}
                  </span>
                );
              }

              return (
                <span
                  key={idx}
                  className="text-neutral-500 font-normal transition-colors duration-150"
                >
                  {word}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    </div>
  );
};
