import React from "react";
import { Clock } from "lucide-react";
import { useInterviewTimer } from "../hooks/useInterviewTimer";

interface InterviewTimerProps {
  startedAt?: string | null;
  isRunning?: boolean;
}

export const InterviewTimer: React.FC<InterviewTimerProps> = ({
  startedAt,
  isRunning = true,
}) => {
  const { formattedTime } = useInterviewTimer(startedAt, isRunning);

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-full text-xs font-mono text-neutral-300 shadow-sm">
      <Clock className="w-3.5 h-3.5 text-[#F42A18]" />
      <span>{formattedTime}</span>
    </div>
  );
};
