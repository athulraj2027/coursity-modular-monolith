import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Bot,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Code2,
  Brain,
  Video,
  Clock,
  Loader2,
  History,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { interviewApi } from "@/features/interview"
import { toast } from "@/lib/toast"
import { useProfile } from "../hooks/useProfile"
import { normalizeQualifications } from "../types/profile.types"

export const TeacherInterviewVettingPage: React.FC = () => {
  const navigate = useNavigate()
  const [isStartingInterview, setIsStartingInterview] = useState(false)
  const { data: profileData, isLoading } = useProfile()

  const teacherProfile = profileData?.teacherProfile
  const approvalStatus = teacherProfile?.approvalStatus || (teacherProfile?.isApproved ? "VERIFIED" : "PENDING")
  const isInterviewPassed = Boolean(teacherProfile?.isInterviewPassed)

  // Redirect if already passed or not yet verified
  useEffect(() => {
    if (isInterviewPassed) {
      navigate("/teachers/dashboard", { replace: true })
    } else if (approvalStatus === "IN_PROGRESS") {
      navigate("/teachers/onboarding/review", { replace: true })
    } else if (approvalStatus === "PENDING" || approvalStatus === "REDO") {
      navigate("/teachers/onboarding/profile", { replace: true })
    }
  }, [approvalStatus, isInterviewPassed, navigate])

  const qualList = normalizeQualifications(teacherProfile?.qualifications)
  const primaryDomain =
    teacherProfile?.expertise?.[0] ||
    qualList[0]?.title ||
    "Software Engineering & System Architecture"

  const handleStartAiInterview = async () => {
    try {
      setIsStartingInterview(true)
      const res = await interviewApi.createSession({
        type: "TEACHER_VETTING",
        domain: primaryDomain,
        difficulty: "INTERMEDIATE",
      })

      if (res.success && res.data) {
        toast.success("AI Vetting Interview initialized!")
        navigate(`/interview/${res.data.id}/setup`)
      } else {
        toast.error(res.message || "Failed to initialize interview")
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to start AI interview session")
    } finally {
      setIsStartingInterview(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#F42A18]" />
        <p className="text-xs font-medium text-neutral-500">Preparing your assessment dashboard...</p>
      </div>
    )
  }

  const interviewAttempts = teacherProfile?.interviewAttempts ?? 0
  const lastScore = teacherProfile?.interviewScore

  return (
    <div className="flex flex-1 flex-col items-center justify-center w-full max-w-5xl mx-auto space-y-8 py-6 text-left">
      {/* Hero Assessment Launch Card */}
      <div className="relative overflow-hidden w-full rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 p-8 sm:p-12 shadow-xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#F42A18]/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl"
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Credentials Verified by Admissions
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F42A18]/10 text-[#F42A18] border border-[#F42A18]/20">
                <Sparkles className="w-3.5 h-3.5" />
                Step 3 of 4: AI Vetting Assessment
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Complete Your AI Technical Vetting Assessment
            </h1>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              To guarantee high pedagogical quality on Coursity, all verified instructors complete an interactive, real-time AI technical vetting session. Once passed, your Creator Studio Hub and course publication tools will be unlocked instantly.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-neutral-500 pt-2">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-[#F42A18]" />
                Domain: <strong className="text-neutral-800 dark:text-neutral-200">{primaryDomain}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-neutral-400" />
                Duration: ~15-20 mins
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Pass Mark: ≥ 70%
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
            <Button
              onClick={handleStartAiInterview}
              disabled={isStartingInterview}
              className="gap-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-[#F42A18] to-rose-600 hover:from-[#d92212] hover:to-rose-700 text-white px-7 py-4 shadow-xl shadow-[#F42A18]/25 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isStartingInterview ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Bot className="w-5 h-5" />
              )}
              <span>{isStartingInterview ? "Initializing Studio..." : "Launch AI Vetting Assessment"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <span className="text-[11px] text-neutral-400">
              Camera & Microphone required in studio
            </span>
          </div>
        </div>
      </div>

      {/* Previous Attempt Feedback (if applicable) */}
      {interviewAttempts > 0 && lastScore !== null && lastScore !== undefined && (
        <div className="w-full rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-900 dark:text-amber-200">
              <History className="w-4 h-4 text-amber-500" />
              <span>Previous Assessment Score: {lastScore}% (Attempt {interviewAttempts})</span>
            </div>
            <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-600 dark:text-amber-400">
              Score Below 70%
            </Badge>
          </div>
          {teacherProfile?.interviewFeedback && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed bg-white/60 dark:bg-neutral-900/60 p-4 rounded-xl border border-amber-500/20">
              <strong>AI Evaluator Feedback:</strong> {teacherProfile.interviewFeedback}
            </p>
          )}
          <p className="text-[11px] text-neutral-500">
            You can retake the assessment at any time. Take your time to review the feedback and click Launch Assessment when ready.
          </p>
        </div>
      )}

      {/* What to Expect Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F42A18]/10 text-[#F42A18]">
            <Brain className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            1. Architecture & System Scenarios
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Discuss architectural trade-offs, concurrency models, and scalable systems in your domain with Coursity's AI interviewer.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            2. Live Coding & Problem Solving
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Write clean, idiomatic code in the browser IDE with instant execution, test suite validation, and AI feedback.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <Video className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            3. Instant Scoring & Access
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Receive automated real-time grading, performance dossiers, and instant unlock of the Creator Studio Dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TeacherInterviewVettingPage
