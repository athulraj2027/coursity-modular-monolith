import React from "react";
import { Badge } from "@/components/ui/badge";
import { Radio, Calendar, CheckCircle2, XCircle } from "lucide-react";
import type { LiveClassStatus } from "../types/lecture.types";

interface LectureStatusBadgeProps {
  status: LiveClassStatus;
  isLiveNow?: boolean;
  className?: string;
}

export const LectureStatusBadge: React.FC<LectureStatusBadgeProps> = ({
  status,
  isLiveNow,
  className = "",
}) => {
  if (status === "LIVE_NOW" || isLiveNow) {
    return (
      <Badge
        variant="outline"
        className={`bg-red-500/15 text-red-500 border-red-500/30 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 px-2.5 py-0.5 animate-pulse ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
        <Radio className="w-3 h-3" />
        <span>Live Now</span>
      </Badge>
    );
  }

  if (status === "COMPLETED") {
    return (
      <Badge
        variant="outline"
        className={`bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-semibold flex items-center gap-1 px-2.5 py-0.5 ${className}`}
      >
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        <span>Completed</span>
      </Badge>
    );
  }

  if (status === "CANCELLED") {
    return (
      <Badge
        variant="outline"
        className={`bg-neutral-500/10 text-neutral-500 border-neutral-500/20 text-[11px] font-semibold flex items-center gap-1 px-2.5 py-0.5 ${className}`}
      >
        <XCircle className="w-3 h-3" />
        <span>Cancelled</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={`bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[11px] font-semibold flex items-center gap-1 px-2.5 py-0.5 ${className}`}
    >
      <Calendar className="w-3 h-3 text-blue-500" />
      <span>Scheduled</span>
    </Badge>
  );
};
