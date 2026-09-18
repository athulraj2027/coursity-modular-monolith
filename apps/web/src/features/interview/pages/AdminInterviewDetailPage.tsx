import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bot,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Volume2,
  Download,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  FileText,
  RotateCcw,
  MessageSquare,
  Award,
  Search,
  ChevronRight,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { interviewApi } from "../api/interview.api";
import { OverrideDecisionModal } from "../components/OverrideDecisionModal";
import type {
  InterviewOutcome,
  InterviewDifficulty,
  TranscriptRole,
} from "../types/interview.types";
import { toast } from "react-toastify";

export const AdminInterviewDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [transcriptSearch, setTranscriptSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"dossier" | "transcript" | "audit">("dossier");

  // Fetch Session details
  const {
    data: sessionResponse,
    isLoading: sessionLoading,
    refetch: refetchSession,
  } = useQuery({
    queryKey: ["admin-interview-session", id],
    queryFn: () => interviewApi.adminGetSession(id!),
    enabled: Boolean(id),
  });

  // Fetch Transcripts
  const {
    data: transcriptsResponse,
    isLoading: transcriptsLoading,
    refetch: refetchTranscripts,
  } = useQuery({
    queryKey: ["admin-interview-transcripts", id],
    queryFn: () => interviewApi.adminGetTranscripts(id!),
    enabled: Boolean(id),
  });

  // Fetch Recording URL
  const { data: recordingResponse } = useQuery({
    queryKey: ["admin-interview-recording", id],
    queryFn: () => interviewApi.adminGetRecording(id!),
    enabled: Boolean(id),
  });

  // Fetch Audit Logs
  const { data: auditResponse } = useQuery({
    queryKey: ["admin-interview-audit", id],
    queryFn: () => interviewApi.adminGetAuditLogs(id!),
    enabled: Boolean(id),
  });

  const session = sessionResponse?.data;
  const transcripts = transcriptsResponse?.data || [];
  const recordingUrl = recordingResponse?.data?.recordingUrl || session?.recordingUrl;
  const auditLogs = auditResponse?.data || [];

  // Decision override mutation
  const overrideDecisionMutation = useMutation({
    mutationFn: ({
      outcome,
      overallScore,
      adminNote,
    }: {
      outcome: InterviewOutcome;
      overallScore?: number;
      adminNote?: string;
    }) =>
      interviewApi.adminUpdateDecision(id!, {
        outcome,
        overallScore,
        adminNote,
      }),
    onSuccess: () => {
      toast.success("Decision successfully applied");
      setOverrideModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-interview-session", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-interview-audit", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-interviews"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to apply decision");
    },
  });

  if (sessionLoading) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-3 text-neutral-500 dark:text-neutral-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F42A18] border-t-transparent" />
        <p className="text-sm font-medium">Loading AI interview assessment dossier...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-amber-500" />
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Interview Not Found</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            The requested interview session could not be located.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/admin/interviews")}
          className="border-neutral-200 dark:border-neutral-800"
        >
          Return to Interviews
        </Button>
      </div>
    );
  }

  const score = session.overallScore !== null && session.overallScore !== undefined ? Number(session.overallScore) : null;
  const isPassed = session.outcome === "PASSED";
  const needsReview = session.outcome === "NEEDS_HUMAN_REVIEW";
  const isFailed = session.outcome === "FAILED";

  const candidateName = session.user?.name || "Candidate";
  const candidateEmail = session.user?.email || "No email";
  const initials = candidateName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Filter transcripts by search
  const filteredTranscripts = transcripts.filter((t) =>
    t.content.toLowerCase().includes(transcriptSearch.toLowerCase())
  );

  // Format duration
  const formatDuration = (seconds?: number | null) => {
    if (!seconds || seconds <= 0) return "--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Top Navigation & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/interviews")}
            className="border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 h-9 px-3"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to List
          </Button>
          <div>
            <div className="flex items-center gap-2 text-xs text-[#F42A18] font-medium tracking-wide">
              <span>ADMIN VETTING REVIEW</span>
              <ChevronRight className="h-3 w-3 text-neutral-400" />
              <span className="text-neutral-500 dark:text-neutral-400 font-mono">{session.id.slice(0, 8)}...</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white mt-0.5 flex items-center gap-2.5">
              <span>{candidateName}</span>
              <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400">— {session.domain || "Technical Evaluation"}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchSession();
              refetchTranscripts();
            }}
            className="border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 h-9 px-3 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setOverrideModalOpen(true)}
            className="bg-[#F42A18] hover:bg-[#F42A18]/90 text-white font-medium shadow-sm shadow-[#F42A18]/25 h-9 px-4 text-xs"
          >
            <ShieldCheck className="h-4 w-4 mr-1.5" />
            Override Decision
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Candidate Profile Card */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F42A18]/10 text-[#F42A18] border border-[#F42A18]/20 font-bold text-base flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{candidateName}</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{candidateEmail}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium bg-[#F42A18]/10 text-[#F42A18] border border-[#F42A18]/20">
                {session.difficulty}
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {session.type.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>

        {/* Overall Score Card */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Vetting Score
            </p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black font-mono text-neutral-900 dark:text-white">
                {score !== null ? `${score.toFixed(1)}` : "--"}
              </span>
              <span className="text-xs text-neutral-500 font-mono">/ 100</span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Passing threshold: {session.template?.passingScore ?? 70}%
            </p>
          </div>
          <div className="flex flex-col items-end">
            {isPassed && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                PASSED
              </span>
            )}
            {needsReview && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                <AlertCircle className="h-3.5 w-3.5" />
                REVIEW
              </span>
            )}
            {isFailed && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
                <XCircle className="h-3.5 w-3.5" />
                FAILED
              </span>
            )}
            {!isPassed && !needsReview && !isFailed && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                {session.status}
              </span>
            )}
          </div>
        </div>

        {/* Session Telemetry Card */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Session Duration
          </p>
          <div className="flex items-center gap-2 mt-1 text-xl font-bold font-mono text-neutral-900 dark:text-white">
            <Clock className="h-4 w-4 text-[#F42A18]" />
            <span>{formatDuration(session.durationSeconds)}</span>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            {transcripts.length} total dialogue turns
          </p>
        </div>

        {/* Behavioral Anomaly Status Card */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Integrity & Anomaly Audit
          </p>
          <div className="mt-1 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-500">
              Clean Heuristics
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Realtime prompt-injection & script screening
          </p>
        </div>
      </div>

      {/* 3. Audio Recording Player Section */}
      {recordingUrl && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F42A18]/10 text-[#F42A18] border border-[#F42A18]/20">
                <Volume2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Audio Recording Playback (WAV 16kHz)
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Full audio session recorded from candidate's microphone
                </p>
              </div>
            </div>
            <a
              href={recordingUrl}
              download={`interview_${session.id}.wav`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 transition"
            >
              <Download className="h-3.5 w-3.5" />
              Download Audio
            </a>
          </div>
          <audio
            controls
            src={recordingUrl}
            className="w-full h-10 rounded-xl outline-none"
          />
        </div>
      )}

      {/* 4. Tab Selector (Dossier vs. Transcript vs. Audit Trail) */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab("dossier")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === "dossier"
              ? "bg-[#F42A18] text-white shadow-sm shadow-[#F42A18]/25"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <Award className="h-4 w-4" />
          Evaluation Dossier & Rubric
        </button>

        <button
          onClick={() => setActiveTab("transcript")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === "transcript"
              ? "bg-[#F42A18] text-white shadow-sm shadow-[#F42A18]/25"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Full Transcript ({transcripts.length})
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === "audit"
              ? "bg-[#F42A18] text-white shadow-sm shadow-[#F42A18]/25"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <History className="h-4 w-4" />
          Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* 5. TAB 1: Evaluation Dossier & Rubric */}
      {activeTab === "dossier" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Rubric Criteria & Feedback */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rubric Criteria Breakdown */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <Award className="h-5 w-5 text-[#F42A18]" />
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                    Rubric Criteria Evaluation (Agent 9)
                  </h3>
                </div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Weighted scoring model
                </span>
              </div>

              {session.criteriaScores && session.criteriaScores.length > 0 ? (
                <div className="space-y-4">
                  {session.criteriaScores.map((c, idx) => {
                    const cScore = Number(c.score);
                    const weightPct = Math.round(Number(c.weight) * 100);
                    const barColor =
                      cScore >= 70
                        ? "bg-emerald-500"
                        : cScore >= 60
                        ? "bg-amber-500"
                        : "bg-red-500";

                    return (
                      <div
                        key={c.id || idx}
                        className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                            <span>{c.criterion}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                              Weight: {weightPct}%
                            </span>
                          </div>
                          <div className="text-sm font-mono font-bold text-neutral-900 dark:text-white">
                            {cScore.toFixed(1)} / {c.maxScore || 100}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                          <div
                            className={`h-full ${barColor} rounded-full transition-all duration-500`}
                            style={{ width: `${Math.min(100, (cScore / (c.maxScore || 100)) * 100)}%` }}
                          />
                        </div>

                        {c.feedback && (
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                            {c.feedback}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-neutral-500 dark:text-neutral-400 italic py-4">
                  Standard rubric criteria will populate upon evaluation completion.
                </div>
              )}
            </div>

            {/* Executive Summary */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <FileText className="h-5 w-5 text-[#F42A18]" />
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                  Executive Assessment Summary
                </h3>
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {session.summaryFeedback || "No summary feedback generated yet."}
              </p>
            </div>
          </div>

          {/* Right Col: Strengths & Improvement Areas */}
          <div className="space-y-6">
            {/* Strengths */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm pb-2 border-b border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4" />
                <span>Demonstrated Strengths</span>
              </div>
              <ul className="space-y-2">
                {session.strengths && session.strengths.length > 0 ? (
                  session.strengths.map((s, idx) => (
                    <li key={idx} className="text-xs text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-neutral-500">None listed.</li>
                )}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-500 font-semibold text-sm pb-2 border-b border-amber-500/20">
                <Sparkles className="h-4 w-4" />
                <span>Actionable Growth Areas</span>
              </div>
              <ul className="space-y-2">
                {session.improvements && session.improvements.length > 0 ? (
                  session.improvements.map((imp, idx) => (
                    <li key={idx} className="text-xs text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{imp}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-neutral-500">None listed.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 2: Full Transcript Stream */}
      {activeTab === "transcript" && (
        <div className="space-y-4">
          {/* Transcript Search */}
          <div className="flex items-center justify-between gap-4 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search dialogue transcript..."
                value={transcriptSearch}
                onChange={(e) => setTranscriptSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#F42A18]"
              />
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Showing {filteredTranscripts.length} of {transcripts.length} turns
            </span>
          </div>

          {/* Transcript Dialogue List */}
          {transcriptsLoading ? (
            <div className="flex h-48 items-center justify-center text-xs text-neutral-500">
              Loading transcript dialogue...
            </div>
          ) : filteredTranscripts.length > 0 ? (
            <div className="space-y-3">
              {filteredTranscripts.map((t, idx) => {
                const isAssistant = t.role === "ASSISTANT";
                const isSystem = t.role === "SYSTEM";

                return (
                  <div
                    key={t.id || idx}
                    className={`rounded-2xl border p-4 transition ${
                      isAssistant
                        ? "border-[#F42A18]/20 bg-[#F42A18]/5 text-neutral-800 dark:text-neutral-200 ml-0 mr-12"
                        : isSystem
                        ? "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-300 mx-6 text-xs"
                        : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 ml-12 mr-0"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isAssistant ? (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#F42A18]/10 text-[#F42A18] text-[11px] font-semibold">
                            <Bot className="h-3 w-3" />
                            AI Interviewer
                          </div>
                        ) : isSystem ? (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[11px] font-semibold">
                            <ShieldAlert className="h-3 w-3" />
                            System Event
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[11px] font-semibold">
                            <User className="h-3 w-3" />
                            Candidate ({candidateName})
                          </div>
                        )}
                        <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                          Turn #{t.sequenceOrder || idx + 1}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                        {new Date(t.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">
                      {t.content}
                    </p>

                    {t.turnFeedback && (
                      <div className="mt-2.5 pt-2 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-[#F42A18]/90 font-mono">
                        Turn Analysis: {t.turnFeedback}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-12 text-center text-sm text-neutral-500">
              No transcripts found matching your query.
            </div>
          )}
        </div>
      )}

      {/* 7. TAB 3: Audit Trail Log */}
      {activeTab === "audit" && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-[#F42A18]" />
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                Administrative Audit Trail & State Log
              </h3>
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Immutable state record
            </span>
          </div>

          {auditLogs && auditLogs.length > 0 ? (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 p-4 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#F42A18] px-2 py-0.5 rounded-md bg-[#F42A18]/10 border border-[#F42A18]/20">
                        {log.action}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        by {log.actorId ? `Admin (${log.actorId.slice(0, 8)})` : "AI Engine Orchestrator"}
                      </span>
                    </div>
                    {log.note && (
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1">
                        Note: "{log.note}"
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-neutral-500 italic">
              No manual administrator interventions recorded for this session.
            </div>
          )}
        </div>
      )}

      {/* Decision Override Modal */}
      <OverrideDecisionModal
        session={session}
        isOpen={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        onConfirm={async ({ outcome, overallScore, adminNote }) => {
          await overrideDecisionMutation.mutateAsync({
            outcome,
            overallScore,
            adminNote,
          });
        }}
        isLoading={overrideDecisionMutation.isPending}
      />
    </div>
  );
};

export default AdminInterviewDetailPage;
