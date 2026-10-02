import React from "react";
import { CheckCircle2, Clock, RotateCcw, AlertCircle, CircleDashed } from "lucide-react";
import type { SubmissionStatus, HomeworkVerificationStatus } from "../types/homework.types";

interface HomeworkStatusBadgeProps {
  submissionStatus?: SubmissionStatus | null;
  verificationStatus?: HomeworkVerificationStatus | null;
  isLate?: boolean;
  size?: "sm" | "md";
}

export const HomeworkStatusBadge: React.FC<HomeworkStatusBadgeProps> = ({
  submissionStatus,
  verificationStatus,
  isLate,
  size = "sm",
}) => {
  const sizeClasses = size === "sm" ? "text-xs px-2.5 py-0.5" : "text-sm px-3 py-1";

  // If no submission yet
  if (!submissionStatus || submissionStatus === "NOT_DONE") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-slate-800 text-slate-400 border border-slate-700/60 ${sizeClasses}`}
      >
        <CircleDashed className="w-3.5 h-3.5" />
        Not Done
      </span>
    );
  }

  // Verified / Approved
  if (verificationStatus === "VERIFIED") {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Verified
        </span>
        {isLate && (
          <span
            className={`inline-flex items-center rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 ${sizeClasses}`}
          >
            Late
          </span>
        )}
      </div>
    );
  }

  // Redo Requested
  if (verificationStatus === "REDO") {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 ${sizeClasses}`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Redo Requested
        </span>
        {isLate && (
          <span
            className={`inline-flex items-center rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 ${sizeClasses}`}
          >
            Late
          </span>
        )}
      </div>
    );
  }

  // Submitted / Resubmitted & Pending Review
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 ${sizeClasses}`}
      >
        <Clock className="w-3.5 h-3.5" />
        {submissionStatus === "RESUBMITTED" ? "Resubmitted (Pending)" : "Submitted (Pending)"}
      </span>
      {isLate && (
        <span
          className={`inline-flex items-center rounded-full font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 ${sizeClasses}`}
        >
          Late
        </span>
      )}
    </div>
  );
};
