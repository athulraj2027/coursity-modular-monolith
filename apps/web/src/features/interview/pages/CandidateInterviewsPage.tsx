import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { interviewApi } from "../api/interview.api";
import type { InterviewSession } from "../types/interview.types";
import {
  Sparkles,
  ArrowRight,
  Bot,
  Calendar,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StartInterviewModal } from "../components/StartInterviewModal";

export const CandidateInterviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStartOpen, setIsStartOpen] = useState(false);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await interviewApi.getMyInterviews({ limit: 50 });
      setSessions(res.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#F42A18] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-neutral-400">Loading your interviews...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#F42A18]" /> My AI Interviews
          </h1>
          <p className="text-xs text-neutral-500">
            View your upcoming real-time AI assessments, active sessions, and completed scorecard dossiers.
          </p>
        </div>

        <Button
          onClick={() => setIsStartOpen(true)}
          className="gap-2 rounded-xl text-xs font-semibold bg-[#F42A18] hover:bg-[#d92212] text-white cursor-pointer shadow-sm shadow-[#F42A18]/20 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Start New Interview</span>
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs">
          {error}
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/50 space-y-4">
          <Bot className="w-12 h-12 text-neutral-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-white">No Interview Sessions Yet</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              You haven't conducted any real-time AI interview sessions yet. Launch your first voice assessment now.
            </p>
          </div>
          <Button
            onClick={() => setIsStartOpen(true)}
            className="gap-2 rounded-xl text-xs font-semibold bg-[#F42A18] hover:bg-[#d92212] text-white cursor-pointer px-5"
          >
            <Bot className="w-4 h-4" />
            <span>Launch First AI Interview</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((sess) => {
            const isCompleted = sess.status === "COMPLETED" || sess.status === "EVALUATED";
            const isPassed = sess.outcome === "PASSED";

            return (
              <div
                key={sess.id}
                className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:border-[#F42A18]/50 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#F42A18] bg-[#F42A18]/10 px-2.5 py-0.5 rounded-full">
                      {sess.type.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? isPassed
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {sess.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                    {sess.template?.title || `${sess.domain || "Technical"} Assessment`}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-neutral-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(sess.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="uppercase">{sess.difficulty}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  {isCompleted && sess.overallScore !== null ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      <span>Score:</span>
                      <span className="text-[#F42A18] font-mono">{Math.round(sess.overallScore || 0)}/100</span>
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-400">Ready to start</span>
                  )}

                  <button
                    onClick={() =>
                      navigate(isCompleted ? `/interview/${sess.id}/completed` : `/interview/${sess.id}`)
                    }
                    className="flex items-center gap-1 text-xs font-bold text-[#F42A18] hover:underline"
                  >
                    <span>{isCompleted ? "View Dossier" : "Enter Setup"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Start Interview Modal */}
      <StartInterviewModal
        isOpen={isStartOpen}
        onClose={() => {
          setIsStartOpen(false);
          fetchInterviews();
        }}
        defaultType="TEACHER_VETTING"
      />
    </div>
  );
};

export default CandidateInterviewsPage;
