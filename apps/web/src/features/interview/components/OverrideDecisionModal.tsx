import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  FileEdit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InterviewSession, InterviewOutcome } from "../types/interview.types";

export interface OverrideDecisionModalProps {
  session: InterviewSession | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    outcome: InterviewOutcome;
    overallScore?: number;
    adminNote?: string;
  }) => Promise<void> | void;
  isLoading?: boolean;
}

export const OverrideDecisionModal: React.FC<OverrideDecisionModalProps> = ({
  session,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [selectedOutcome, setSelectedOutcome] = useState<InterviewOutcome>("PASSED");
  const [scoreInput, setScoreInput] = useState<string>("");
  const [adminNote, setAdminNote] = useState<string>("");

  useEffect(() => {
    if (session) {
      setSelectedOutcome(
        session.outcome === "PENDING" || session.outcome === "NEEDS_HUMAN_REVIEW"
          ? "PASSED"
          : session.outcome
      );
      setScoreInput(
        session.overallScore !== null && session.overallScore !== undefined
          ? String(session.overallScore)
          : ""
      );
      setAdminNote("");
    }
  }, [session, isOpen]);

  if (!isOpen || !session) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const scoreNum = scoreInput.trim() ? parseFloat(scoreInput) : undefined;
    await onConfirm({
      outcome: selectedOutcome,
      overallScore: scoreNum !== undefined && !isNaN(scoreNum) ? scoreNum : undefined,
      adminNote: adminNote.trim() || undefined,
    });
  };

  const outcomeOptions: {
    value: InterviewOutcome;
    label: string;
    description: string;
    icon: any;
    color: string;
    bg: string;
    border: string;
  }[] = [
    {
      value: "PASSED",
      label: "Pass Interview",
      description: "Marks candidate as passed, updating teacher profile vetting status.",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
    },
    {
      value: "NEEDS_HUMAN_REVIEW",
      label: "Flag for Review",
      description: "Keeps session flagged for human secondary review or panel audit.",
      icon: AlertCircle,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
    },
    {
      value: "FAILED",
      label: "Fail Interview",
      description: "Candidate did not meet required competency thresholds.",
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-2xl text-neutral-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F42A18]/10 border border-[#F42A18]/20 text-[#F42A18]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
                Override Interview Decision
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Candidate: <span className="text-[#F42A18] font-medium">{session.user?.name || "Candidate"}</span> ({session.domain || "AI Interview"})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Decision Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Target Outcome
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {outcomeOptions.map((opt) => {
                const isSelected = selectedOutcome === opt.value;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedOutcome(opt.value)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? `${opt.bg} ${opt.border} ring-1 ring-neutral-400 dark:ring-neutral-600`
                        : "bg-neutral-50 dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${opt.color}`} />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center justify-between">
                        {opt.label}
                        {isSelected && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 font-mono text-[#F42A18]">
                            Active Choice
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Adjusted Score */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
              <span>Overall Score Override (0 - 100)</span>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-normal">Optional</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={scoreInput}
              onChange={(e) => setScoreInput(e.target.value)}
              placeholder={`Current: ${session.overallScore ?? "Not set"}`}
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/40 focus:border-[#F42A18] transition font-mono"
            />
          </div>

          {/* Admin Justification Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
              <span>Admin Audit Note / Reason</span>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-normal">Recorded in audit log</span>
            </label>
            <textarea
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Provide reason for override (e.g. Reviewed audio recording; candidate demonstrated strong depth in architecture despite nervousness...)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/40 focus:border-[#F42A18] transition resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#F42A18] hover:bg-[#F42A18]/90 text-white font-medium shadow-sm shadow-[#F42A18]/25 px-5"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Applying Override...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FileEdit className="h-4 w-4" />
                  <span>Confirm Decision</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default OverrideDecisionModal;
