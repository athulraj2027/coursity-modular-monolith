import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { interviewApi } from "../api/interview.api";
import type { InterviewReportData, InterviewTranscript } from "../types/interview.types";
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
} from "lucide-react";

export const InterviewCompletedPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

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
      } catch (err: any) {
        setError(err.message || "Failed to load evaluation dossier");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#F42A18] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-neutral-400">Loading interview assessment dossier...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-neutral-900 border border-neutral-800 rounded-3xl text-center space-y-4 text-white">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold">Evaluation In Progress</h2>
        <p className="text-xs text-neutral-400">
          Your interview responses are currently being evaluated by the cognitive multi-agent engine. Please check back in a few moments.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-5 py-2.5 bg-[#F42A18] text-white text-xs font-semibold rounded-xl"
        >
          Return to Dashboard
        </button>
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
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8 pb-16">
      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <span className="text-xs font-mono text-neutral-500">Session ID: {sessionId?.slice(0, 8)}...</span>
      </div>

      {/* 2. Hero Assessment Banner */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F42A18]/20 text-[#F42A18] border border-[#F42A18]/30">
                <Sparkles className="w-3.5 h-3.5" /> Assessment Dossier
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-neutral-800 text-neutral-400 border border-neutral-700">
                {report.difficulty}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{report.domain || "Technical"} Evaluation</h1>
            <p className="text-xs md:text-sm text-neutral-400 flex items-center gap-4 pt-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-neutral-500" /> {durationMinutes} mins elapsed
              </span>
              <span>•</span>
              <span>Completed on {new Date(report.endedAt || Date.now()).toLocaleDateString()}</span>
            </p>
          </div>

          {/* Outcome & Score Card */}
          <div className="flex items-center gap-5 p-5 bg-neutral-900/80 border border-neutral-800 rounded-2xl">
            <div className="text-right space-y-1">
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
              <p className="text-[11px] text-neutral-400">Multi-Agent Cognitive Score</p>
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

      {/* 3. Tab Selectors */}
      <div className="flex border-b border-neutral-800 space-x-4">
        <button
          onClick={() => setActiveTab("dossier")}
          className={`pb-3 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === "dossier"
              ? "border-[#F42A18] text-[#F42A18]"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Award className="w-4 h-4" /> Evaluation & Coaching Dossier
        </button>
        <button
          onClick={() => setActiveTab("transcript")}
          className={`pb-3 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === "transcript"
              ? "border-[#F42A18] text-[#F42A18]"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Brain className="w-4 h-4" /> Full Interview Transcript ({transcripts.length})
        </button>
      </div>

      {/* 4. Tab 1: Dossier View */}
      {activeTab === "dossier" && (
        <div className="space-y-6">
          {/* Executive Summary */}
          {report.summaryFeedback && (
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2 text-neutral-200 shadow-sm">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F42A18]" /> Executive Summary
              </h3>
              <p className="text-xs md:text-sm text-neutral-300 leading-relaxed">{report.summaryFeedback}</p>
            </div>
          )}

          {/* Rubric Category Breakdown */}
          {report.criteriaScores && report.criteriaScores.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-[#F42A18]" /> Rubric Criteria Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.criteriaScores.map((c, i) => (
                  <div
                    key={i}
                    className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-white">{c.criterion}</span>
                      <span className="font-mono font-bold text-[#F42A18]">
                        {c.score} / {c.maxScore}
                      </span>
                    </div>
                    {/* Score Bar */}
                    <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#F42A18] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (c.score / c.maxScore) * 100)}%` }}
                      />
                    </div>
                    {c.feedback && <p className="text-[11px] text-neutral-400 pt-1">{c.feedback}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Growth Areas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
              <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Key Strengths Identified
              </h3>
              <ul className="space-y-2 text-xs text-neutral-300">
                {report.strengths && report.strengths.length > 0 ? (
                  report.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-neutral-500">Solid demonstration of domain concepts.</li>
                )}
              </ul>
            </div>

            {/* Growth Areas & Coaching Action Plan */}
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
              <h3 className="font-bold text-sm text-[#F42A18] flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Growth Areas & Coaching
              </h3>
              <ul className="space-y-2 text-xs text-neutral-300">
                {report.improvements && report.improvements.length > 0 ? (
                  report.improvements.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#F42A18] mt-0.5">•</span>
                      <span>{imp}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-neutral-500">Continue expanding advanced real-world scaling examples.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Audio Recording Player if present */}
          {report.recordingUrl && (
            <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-white">Full Session Audio Recording</h4>
                <p className="text-xs text-neutral-400">Stream or download the archived interview audio.</p>
              </div>
              <a
                href={report.recordingUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#F42A18] hover:bg-[#d82212] text-white text-xs font-semibold rounded-xl transition"
              >
                <Download className="w-4 h-4" /> Download Audio (WAV)
              </a>
            </div>
          )}
        </div>
      )}

      {/* 5. Tab 2: Full Searchable Transcript */}
      {activeTab === "transcript" && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search transcript by keywords, topics, or claims..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-[#F42A18]"
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
                        ? "bg-neutral-900 border-neutral-800"
                        : "bg-neutral-900/40 border-neutral-800/60"
                    } space-y-2`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isAI ? "bg-[#F42A18]/20 text-[#F42A18]" : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {isAI ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        </div>
                        <span className="font-bold text-white">{isAI ? "AI Interviewer" : "Candidate"}</span>
                      </div>
                      <span className="text-[11px] font-mono text-neutral-500">
                        {new Date(t.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-neutral-300 leading-relaxed pl-7">{t.content}</p>
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
