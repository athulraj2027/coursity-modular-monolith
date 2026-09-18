import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Bot,
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  XCircle,
  FileText,
  Mic,
  Brain,
  ShieldCheck,
  ChevronRight,
  GraduationCap,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { interviewApi } from "../api/interview.api";
import { StartInterviewModal } from "../components/StartInterviewModal";
import { useProfile } from "@/features/profile";
import { useCurrentUser } from "@/features/auth";
import type { InterviewSession, InterviewOutcome } from "../types/interview.types";

export const CandidateInterviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { data: profileData } = useProfile();
  const teacherProfile = profileData?.teacherProfile;
  const isTeacher = user?.role === "TEACHER" || user?.role === "teacher" || Boolean(teacherProfile);

  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "PASSED" | "REVIEW" | "IN_PROGRESS">("ALL");

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
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

  // Filter sessions by active tab
  const filteredSessions = useMemo(() => {
    switch (activeTab) {
      case "PASSED":
        return sessions.filter((s) => s.outcome === "PASSED");
      case "REVIEW":
        return sessions.filter((s) => s.outcome === "NEEDS_HUMAN_REVIEW");
      case "IN_PROGRESS":
        return sessions.filter((s) => s.status === "IN_PROGRESS" || s.status === "INITIALIZING");
      case "ALL":
      default:
        return sessions;
    }
  }, [sessions, activeTab]);

  const passedSession = sessions.find((s) => s.outcome === "PASSED");
  const isPassed = Boolean(teacherProfile?.isInterviewPassed || passedSession);
  const highestScore = useMemo(() => {
    const scores = sessions
      .map((s) => (s.overallScore !== null && s.overallScore !== undefined ? Number(s.overallScore) : null))
      .filter((s): s is number => s !== null);
    return scores.length > 0 ? Math.max(...scores) : teacherProfile?.interviewScore ?? null;
  }, [sessions, teacherProfile]);

  // Format duration helper
  const formatDuration = (seconds?: number | null) => {
    if (!seconds || seconds <= 0) return "--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#F42A18] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Loading AI interview vetting dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* 1. Top Header Banner with Dynamic Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-900">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F42A18] uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>{isTeacher ? "Instructor Vetting & Verification" : "AI Technical Assessments"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            AI Interview Studio
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
            Complete real-time conversational voice interviews with our AI Evaluation Board to certify your technical expertise and instructional depth.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInterviews}
            className="border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs h-10 px-3"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>

          <Button
            onClick={() => setIsStartOpen(true)}
            className="gap-2 rounded-xl text-xs font-semibold bg-[#F42A18] hover:bg-[#F42A18]/90 text-white shadow-md shadow-[#F42A18]/25 h-10 px-5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Start New AI Interview</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Structured 4-Step Teacher Vetting Journey Flow */}
      {isTeacher && (
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-7 shadow-xs">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#F42A18]/10 blur-3xl"
          />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#F42A18]">
                  Vetting Qualification Flow
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
                  Instructor Certification Roadmap
                </h2>
              </div>

              {isPassed ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 self-start sm:self-auto">
                  <CheckCircle2 className="w-4 h-4" />
                  AI Vetting Completed ({highestScore ? `${highestScore.toFixed(0)}%` : "Passed"})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F42A18]/10 text-[#F42A18] border border-[#F42A18]/20 self-start sm:self-auto">
                  <AlertCircle className="w-4 h-4" />
                  Score $\ge 70\%$ Required to Publish
                </span>
              )}
            </div>

            {/* Step-by-Step Flow Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-[#F42A18]">STEP 01</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Profile & Experience
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Resume, expertise domain, and educational background provided.
                </p>
              </div>

              {/* Step 2 */}
              <div className={`rounded-xl border p-4 relative ${
                isPassed
                  ? "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50"
                  : "border-[#F42A18]/40 bg-[#F42A18]/5 ring-1 ring-[#F42A18]/20"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-[#F42A18]">STEP 02</span>
                  {isPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Mic className="w-4 h-4 text-[#F42A18] animate-pulse" />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Real-Time AI Interview
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  15-minute voice assessment testing fundamentals, pedagogy & system design.
                </p>
              </div>

              {/* Step 3 */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-[#F42A18]">STEP 03</span>
                  {isPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Brain className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Rubric & Anomaly Audit
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Multi-agent examination board evaluates subject accuracy & delivery.
                </p>
              </div>

              {/* Step 4 */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-[#F42A18]">STEP 04</span>
                  {isPassed ? (
                    <Award className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Creator Verification
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Instant unlock of course publishing, cohort scheduling, and student billing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Session Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "ALL"
                ? "bg-[#F42A18] text-white shadow-sm shadow-[#F42A18]/25"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            All Sessions ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab("PASSED")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "PASSED"
                ? "bg-[#F42A18] text-white shadow-sm shadow-[#F42A18]/25"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            Passed ({sessions.filter((s) => s.outcome === "PASSED").length})
          </button>
          <button
            onClick={() => setActiveTab("REVIEW")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "REVIEW"
                ? "bg-[#F42A18] text-white shadow-sm shadow-[#F42A18]/25"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            Under Review ({sessions.filter((s) => s.outcome === "NEEDS_HUMAN_REVIEW").length})
          </button>
          <button
            onClick={() => setActiveTab("IN_PROGRESS")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "IN_PROGRESS"
                ? "bg-[#F42A18] text-white shadow-sm shadow-[#F42A18]/25"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            In Progress ({sessions.filter((s) => s.status === "IN_PROGRESS" || s.status === "INITIALIZING").length})
          </button>
        </div>

        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          Showing {filteredSessions.length} sessions
        </span>
      </div>

      {/* 4. Session Cards Grid */}
      {filteredSessions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 space-y-4">
          <Bot className="w-12 h-12 text-neutral-400 dark:text-neutral-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
              No Interview Sessions Found
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              Launch your real-time AI interview session to verify your subject mastery and pedagogical skills.
            </p>
          </div>
          <Button
            onClick={() => setIsStartOpen(true)}
            className="gap-2 rounded-xl text-xs font-semibold bg-[#F42A18] hover:bg-[#F42A18]/90 text-white cursor-pointer px-5"
          >
            <Bot className="w-4 h-4" />
            <span>Launch AI Interview</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSessions.map((sess) => {
            const isCompleted = sess.status === "COMPLETED" || sess.status === "EVALUATED";
            const isPassedSession = sess.outcome === "PASSED";
            const isReviewSession = sess.outcome === "NEEDS_HUMAN_REVIEW";
            const isFailedSession = sess.outcome === "FAILED";

            const score = sess.overallScore !== null && sess.overallScore !== undefined ? Number(sess.overallScore) : null;

            return (
              <div
                key={sess.id}
                className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:border-[#F42A18]/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F42A18] bg-[#F42A18]/10 px-2.5 py-0.5 rounded-lg border border-[#F42A18]/20">
                      {sess.type.replace(/_/g, " ")}
                    </span>

                    {isPassedSession && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        PASSED
                      </span>
                    )}
                    {isReviewSession && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <AlertCircle className="w-3 h-3" />
                        REVIEW
                      </span>
                    )}
                    {isFailedSession && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                        <XCircle className="w-3 h-3" />
                        FAILED
                      </span>
                    )}
                    {!isPassedSession && !isReviewSession && !isFailedSession && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        <Clock className="w-3 h-3" />
                        {sess.status}
                      </span>
                    )}
                  </div>

                  {/* Title & Domain */}
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                      {sess.template?.title || sess.domain || "Technical Evaluation"}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(sess.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span>•</span>
                      <span className="uppercase">{sess.difficulty}</span>
                      <span>•</span>
                      <span>{formatDuration(sess.durationSeconds)}</span>
                    </div>
                  </div>

                  {/* Summary Snippet */}
                  {sess.summaryFeedback && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed bg-neutral-50 dark:bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800">
                      "{sess.summaryFeedback}"
                    </p>
                  )}
                </div>

                {/* Footer Score & CTA */}
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  {score !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-neutral-500">Score:</span>
                      <span className="text-base font-bold font-mono text-[#F42A18]">
                        {score.toFixed(1)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-400">Ready to start</span>
                  )}

                  <Button
                    size="sm"
                    onClick={() =>
                      navigate(isCompleted ? `/interview/${sess.id}/completed` : `/interview/${sess.id}`)
                    }
                    className="h-8 px-3 text-xs bg-[#F42A18] hover:bg-[#F42A18]/90 text-white font-medium shadow-sm shadow-[#F42A18]/20"
                  >
                    <span>{isCompleted ? "View Dossier" : "Enter Setup"}</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. What to Expect in AI Vetting Cards */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
          <Bot className="w-4 h-4 text-[#F42A18]" />
          What to Expect in Your AI Voice Vetting Assessment
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="space-y-1 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <h4 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-[#F42A18]" />
              Natural Conversational Voice
            </h4>
            <p className="leading-relaxed">
              Speak naturally through your microphone or respond via text. The AI listens, pauses for your thoughts, and supports barge-in interruptions.
            </p>
          </div>

          <div className="space-y-1 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <h4 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-[#F42A18]" />
              Adaptive Reasoning & Probing
            </h4>
            <p className="leading-relaxed">
              Questions adapt based on your seniority level and answers to test instructional clarity, real-world edge cases, and architecture.
            </p>
          </div>

          <div className="space-y-1 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <h4 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F42A18]" />
              Instant Scorecard Dossier
            </h4>
            <p className="leading-relaxed">
              Immediately receive your criteria breakdown (Subject Expertise, Pedagogy, Communication), audio replay, and verification status.
            </p>
          </div>
        </div>
      </div>

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
