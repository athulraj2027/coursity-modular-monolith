import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { interviewApi } from "../api/interview.api";
import type { InterviewReportData, InterviewTranscript } from "../types/interview.types";
import { useCurrentUser } from "@/features/auth";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowLeft,
  Search,
  Bot,
  User,
  ShieldCheck,
  TrendingUp,
  Brain,
  Download,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const InterviewCompletedPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const isTeacher = user?.role === "TEACHER" || user?.role === "teacher";
  const isAdmin = user?.role === "ADMIN" || user?.role === "admin";

  const [report, setReport] = useState<InterviewReportData | null>(null);
  const [transcripts, setTranscripts] = useState<InterviewTranscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"dossier" | "transcript">("dossier");

  useEffect(() => {
    const fetchData = async () => {
      if (!sessionId) return;
      try {
        setLoading(true);
        const [repRes, trRes] = await Promise.all([
          interviewApi.getReport(sessionId),
          interviewApi.getTranscripts(sessionId).catch(() => ({ success: true, data: [] })),
        ]);
        setReport(repRes.data);
        setTranscripts(trRes.data || []);
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        queryClient.invalidateQueries({ queryKey: ["my-vetting-interviews"] });
      } catch (err: any) {
        setError(err.message || "Failed to load evaluation dossier");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId, queryClient]);

  const handleBack = () => {
    if (isTeacher) {
      if (report?.overallScore && report.overallScore >= 70) {
        navigate("/teachers/onboarding/bank-details");
      } else {
        navigate("/teachers/onboarding/interview");
      }
    } else if (isAdmin) {
      navigate("/admin/interviews");
    } else {
      navigate("/students/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#F42A18] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Loading interview assessment dossier...
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          Evaluation In Progress
        </h2>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Your interview responses are currently being evaluated by the cognitive multi-agent engine. Please check back in a few moments.
        </p>
        <Button
          onClick={handleBack}
          className="bg-[#F42A18] hover:bg-[#d92212] text-white text-xs font-semibold rounded-xl px-5 py-2.5 cursor-pointer"
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const score = report.overallScore || 0;
  const isPassed = report.outcome === "PASSED";
  const durationMinutes = report.durationSeconds ? Math.round(report.durationSeconds / 60) : 0;

  const filteredTranscripts = transcripts.filter((t) =>
    t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-8 pb-12 text-left">
      {/* 1. Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-900">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs h-9 px-3 gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>
              {isTeacher
                ? isPassed
                  ? "Proceed to Payout Setup"
                  : "Back to AI Studio"
                : "Back to Dashboard"}
            </span>
          </Button>
          <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500 hidden sm:inline">
            ID: {sessionId?.slice(0, 8)}...
          </span>
        </div>

        {report.recordingUrl && (
          <a
            href={report.recordingUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:border-[#F42A18]/40 hover:text-[#F42A18] transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Audio Recording</span>
          </a>
        )}
      </div>

      {/* 2. Hero Assessment Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 p-6 sm:p-8 text-white shadow-xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#F42A18]/20 blur-3xl"
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F42A18]/20 text-[#F42A18] border border-[#F42A18]/30">
                <Sparkles className="w-3.5 h-3.5" /> AI Evaluation Dossier
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
                {report.difficulty}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-neutral-800 text-neutral-300 border border-neutral-700">
                {report.type?.replace(/_/g, " ") || "TEACHER VETTING"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {report.domain || "Technical"} Evaluation Dossier
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                {durationMinutes} mins elapsed
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                {new Date(report.endedAt || Date.now()).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Outcome & Score Badge */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md self-start md:self-auto">
            <div className="text-right space-y-0.5">
              <div className="flex items-center justify-end gap-1.5 font-bold text-sm">
                {isPassed ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Assessment Passed
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Evaluation Completed
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">Multi-Agent Score</p>
            </div>

            <div
              className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold text-xl border shadow-inner ${
                isPassed
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-[#F42A18]/15 text-[#F42A18] border-[#F42A18]/30"
              }`}
            >
              <span>{Math.round(score)}</span>
              <span className="text-[9px] font-normal text-neutral-400">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab("dossier")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            activeTab === "dossier"
              ? "border-[#F42A18] text-[#F42A18]"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Evaluation & Coaching Dossier</span>
        </button>
        <button
          onClick={() => setActiveTab("transcript")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            activeTab === "transcript"
              ? "border-[#F42A18] text-[#F42A18]"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Full Transcript Turns ({transcripts.length})</span>
        </button>
      </div>

      {/* 4. Tab 1: Dossier View */}
      {activeTab === "dossier" && (
        <div className="space-y-6">
          {/* Executive Summary */}
          {report.summaryFeedback && (
            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2 shadow-xs">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F42A18]" />
                Executive Board Summary
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {report.summaryFeedback}
              </p>
            </div>
          )}

          {/* Rubric Category Breakdown */}
          {report.criteriaScores && report.criteriaScores.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-[#F42A18]" />
                Rubric Criteria Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.criteriaScores.map((c, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2 shadow-xs"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-neutral-900 dark:text-white">{c.criterion}</span>
                      <span className="font-mono font-bold text-[#F42A18]">
                        {c.score} / {c.maxScore}
                      </span>
                    </div>
                    {/* Score Bar */}
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#F42A18] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (c.score / c.maxScore) * 100)}%` }}
                      />
                    </div>
                    {c.feedback && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 pt-0.5 leading-relaxed">
                        {c.feedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Growth Areas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3 shadow-xs">
              <h3 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Key Strengths Identified
              </h3>
              <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
                {report.strengths && report.strengths.length > 0 ? (
                  report.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-neutral-500">Solid demonstration of subject fundamentals.</li>
                )}
              </ul>
            </div>

            {/* Growth Areas & Coaching Action Plan */}
            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3 shadow-xs">
              <h3 className="font-bold text-sm text-[#F42A18] flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Growth Areas & Coaching Recommendations
              </h3>
              <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
                {report.improvements && report.improvements.length > 0 ? (
                  report.improvements.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#F42A18] mt-0.5">•</span>
                      <span>{imp}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-neutral-500">Continue expanding advanced real-world system design cases.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Full Searchable Transcript */}
      {activeTab === "transcript" && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search transcript turns by keywords, topics, or responses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs placeholder:text-neutral-400 focus:outline-none focus:border-[#F42A18]"
            />
          </div>

          {/* Turns List */}
          <div className="space-y-3">
            {filteredTranscripts.length === 0 ? (
              <p className="text-center p-8 text-xs text-neutral-500">No matching transcript turns found.</p>
            ) : (
              filteredTranscripts.map((t, idx) => {
                const isAI = t.role === "ASSISTANT";
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border ${
                      isAI
                        ? "bg-neutral-50/70 dark:bg-neutral-900/90 border-neutral-200/80 dark:border-neutral-800"
                        : "bg-white dark:bg-neutral-950/50 border-neutral-100 dark:border-neutral-850"
                    } space-y-2 shadow-2xs`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isAI ? "bg-[#F42A18]/15 text-[#F42A18]" : "bg-blue-500/15 text-blue-500"
                          }`}
                        >
                          {isAI ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        </div>
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {isAI ? "AI Evaluator Board" : "Candidate"}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                        {new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed pl-7">
                      {t.content}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewCompletedPage;
