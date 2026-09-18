import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInterviewSession } from "../hooks/useInterviewSession";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Video,
  Mic,
  Brain,
  AlertCircle,
} from "lucide-react";

export const InterviewLandingPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { session, loading, error } = useInterviewSession(sessionId);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#F42A18] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-neutral-500">Preparing your interview studio...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-neutral-900 border border-neutral-800 rounded-3xl text-center space-y-4 text-white">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold">Interview Not Found</h2>
        <p className="text-xs text-neutral-400">{error || "This interview session does not exist or has expired."}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-5 py-2.5 bg-[#F42A18] text-white text-xs font-semibold rounded-xl"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const template = session.template;
  const isAlreadyCompleted = session.status === "COMPLETED" || session.status === "EVALUATED";

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#F42A18]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F42A18]/20 text-[#F42A18] border border-[#F42A18]/30">
              <Sparkles className="w-3.5 h-3.5" /> AI Real-Time Interview
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
              {session.type.replace(/_/g, " ")}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {session.difficulty}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {template?.title || `${session.domain || "Technical"} Assessment`}
          </h1>

          <p className="text-sm md:text-base text-neutral-400 max-w-2xl leading-relaxed">
            {template?.description ||
              "Welcome to your AI-guided real-time assessment. You will have a natural voice conversation covering domain fundamentals, real-world problem solving, and technical depth."}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-neutral-300 font-medium">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F42A18]" />
              <span>Duration: ~{template?.maxDurationMinutes || 15} mins</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#F42A18]" />
              <span>Questions: {template?.totalQuestions || 5} Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Real-time voice evaluation</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. What to Expect Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-200 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#F42A18]/15 text-[#F42A18] flex items-center justify-center font-bold">
            <Mic className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white">Voice-First Conversation</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Speak naturally through your microphone. The AI interviewer analyzes your answers in real time and asks contextual follow-ups.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-200 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
            <Video className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white">Google Meet Style Studio</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Enjoy a clean, distraction-free meeting studio with live captions, waveform visualizers, and a collapsible transcript drawer.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-200 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white">Immediate Assessment Dossier</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Upon finishing, receive an in-depth scorecard with rubric radar breakdown, coaching recommendations, and full transcript.
          </p>
        </div>
      </div>

      {/* 3. Privacy & Instructions Card */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-neutral-300 space-y-3">
        <div className="flex items-center gap-2 font-semibold text-sm text-white">
          <HelpCircle className="w-4 h-4 text-neutral-400" />
          <span>Important Instructions & Privacy Notice</span>
        </div>
        <ul className="text-xs space-y-2 text-neutral-400 list-disc list-inside leading-relaxed">
          <li>Ensure you are in a quiet room with minimal background noise.</li>
          <li>Wear headphones if available to prevent microphone echo.</li>
          <li>You can interrupt the AI at any time by speaking or clicking the "Interrupt" button.</li>
          <li>Your conversation audio and transcript are recorded securely for evaluation and feedback purposes.</li>
        </ul>
      </div>

      {/* 4. Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-800">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-xs font-semibold text-neutral-400 hover:text-white transition order-2 sm:order-1"
        >
          Cancel & Return to Dashboard
        </button>

        {isAlreadyCompleted ? (
          <button
            onClick={() => navigate(`/interview/${sessionId}/completed`)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition order-1 sm:order-2"
          >
            <span>View Assessment Results</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => navigate(`/interview/${sessionId}/setup`)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#F42A18] hover:bg-[#d82212] text-white font-bold text-sm shadow-xl hover:shadow-red-500/20 flex items-center justify-center gap-2 transition order-1 sm:order-2"
          >
            <span>Check Hardware & Setup</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default InterviewLandingPage;
