import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  Bot,
  ArrowRight,
  ShieldCheck,
  Code2,
  Brain,
  Clock,
  Loader2,
  History,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { interviewApi } from "@/features/interview"
import { toast } from "@/lib/toast"
import { useProfile } from "../hooks/useProfile"
import { normalizeQualifications } from "../types/profile.types"
import type { InterviewSession } from "@/features/interview/types/interview.types"

export const TeacherInterviewVettingPage: React.FC = () => {
  const navigate = useNavigate()
  const [isStartingInterview, setIsStartingInterview] = useState(false)
  const { data: profileData, isLoading: isProfileLoading } = useProfile()

  const teacherProfile = profileData?.teacherProfile
  const approvalStatus = teacherProfile?.approvalStatus || (teacherProfile?.isApproved ? "VERIFIED" : "PENDING")

  // Fetch past candidate interview sessions
  const {
    data: myInterviewsData,
    isLoading: isInterviewsLoading,
  } = useQuery({
    queryKey: ["my-vetting-interviews"],
    queryFn: async () => {
      const res = await interviewApi.getMyInterviews({ limit: 50 })
      return res.data || []
    },
  })


  const allSessions: InterviewSession[] = myInterviewsData || []
  const vettingSessions = allSessions.filter((s) => s.type === "TEACHER_VETTING")
  const passedSession = vettingSessions.find((s) => s.outcome === "PASSED")
  const isInterviewPassed = Boolean(teacherProfile?.isInterviewPassed || passedSession)

  const maxAttempts = 3
  const totalAttempts = Math.max(teacherProfile?.interviewAttempts ?? 0, vettingSessions.length)
  const remainingAttempts = Math.max(0, maxAttempts - totalAttempts)
  const canRetry = !isInterviewPassed && totalAttempts < maxAttempts

  // Redirect if not verified yet or application is in progress
  useEffect(() => {
    if (approvalStatus === "IN_PROGRESS") {
      navigate("/teachers/onboarding/review", { replace: true })
    } else if (approvalStatus === "PENDING" || approvalStatus === "REDO") {
      navigate("/teachers/onboarding/profile", { replace: true })
    }
  }, [approvalStatus, navigate])

  const qualList = normalizeQualifications(teacherProfile?.qualifications)
  const primaryDomain =
    teacherProfile?.expertise?.[0] ||
    qualList[0]?.title ||
    "Software Engineering & System Architecture"

  const handleStartAiInterview = async () => {
    if (!canRetry) {
      if (isInterviewPassed) {
        navigate("/teachers/dashboard")
        return
      }
      toast.error("Maximum assessment attempts (3 of 3) reached. Please contact admissions support.")
      return
    }

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

  if (isProfileLoading || isInterviewsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#F42A18]" />
        <p className="text-xs font-medium text-neutral-500">Preparing your assessment overview...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-3xl mx-auto px-4 py-4 my-auto space-y-6">
      {/* Status Icon */}
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 flex items-center justify-center text-neutral-800 dark:text-neutral-200 shadow-sm">
          {isInterviewPassed ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          ) : totalAttempts >= maxAttempts ? (
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          ) : (
            <Bot className="w-8 h-8 text-[#F42A18]" />
          )}
        </div>
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isInterviewPassed ? "bg-emerald-500" : totalAttempts >= maxAttempts ? "bg-amber-500" : "bg-[#F42A18]"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
              isInterviewPassed ? "bg-emerald-500" : totalAttempts >= maxAttempts ? "bg-amber-500" : "bg-[#F42A18]"
            }`}
          />
        </span>
      </div>

      {/* Verified Status & Attempt Counter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Credentials Verified by Admissions
        </span>

        {isInterviewPassed ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Assessment Passed • Creator Studio Unlocked
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
            <Bot className="w-3.5 h-3.5 text-[#F42A18]" />
            Attempt {Math.min(totalAttempts + 1, maxAttempts)} of {maxAttempts} ({remainingAttempts} remaining)
          </span>
        )}
      </div>

      {/* Heading & Subtitle */}
      <div className="space-y-2.5 max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          {isInterviewPassed
            ? "AI Technical Vetting Assessment Passed"
            : totalAttempts >= maxAttempts
            ? "Assessment Limit Reached (3 of 3 Attempts)"
            : "Complete Your AI Technical Vetting Assessment"}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {isInterviewPassed
            ? "Congratulations! You have satisfied all instructor vetting criteria with Coursity's AI technical evaluator. Your Creator Studio Dashboard and course authoring tools are unlocked."
            : totalAttempts >= maxAttempts
            ? "You have completed all 3 permitted attempts for the AI technical vetting assessment. Your application is now queued for manual review by our admissions board."
            : "To ensure high instructional quality on Coursity, all verified instructors complete an interactive, real-time AI technical vetting session. You have up to 3 attempts to achieve a passing score (≥ 70%)."}
        </p>
      </div>

      {/* Highlights / Assessment Specs - Direct on page */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
        <span className="flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5 text-[#F42A18]" />
          <span>Domain: <strong className="text-neutral-800 dark:text-neutral-200 font-medium">{primaryDomain}</strong></span>
        </span>
        <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">•</span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
          <span>Duration: <strong className="text-neutral-800 dark:text-neutral-200 font-medium">~15–20 Mins</strong></span>
        </span>
        <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">•</span>
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span>Pass Mark: <strong className="text-neutral-800 dark:text-neutral-200 font-medium">≥ 70%</strong></span>
        </span>
        <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">•</span>
        <span className="flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
          <span>Attempts: <strong className="text-neutral-800 dark:text-neutral-200 font-medium">{totalAttempts} of {maxAttempts}</strong></span>
        </span>
      </div>

      {/* Past Assessment Attempts History (if any attempts were made) */}
      {vettingSessions.length > 0 && (
        <div className="w-full max-w-xl space-y-3 pt-2 text-left">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
            <span className="text-[11px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-neutral-500" />
              Past Assessment Attempts ({vettingSessions.length} of {maxAttempts})
            </span>
            <span className="text-[11px] text-neutral-500">
              {remainingAttempts > 0 ? `${remainingAttempts} ${remainingAttempts === 1 ? "retry" : "retries"} remaining` : "No retries remaining"}
            </span>
          </div>

          <div className="space-y-2.5">
            {vettingSessions.map((session, idx) => {
              const attemptNum = idx + 1
              const score = session.overallScore !== null && session.overallScore !== undefined ? Math.round(Number(session.overallScore)) : null
              const isPassed = session.outcome === "PASSED"
              const isFailed = session.outcome === "FAILED"
              const dateStr = new Date(session.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })

              return (
                <div
                  key={session.id}
                  className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 dark:text-white">
                        Attempt #{attemptNum}
                      </span>
                      <span className="text-neutral-400">•</span>
                      <span className="text-[11px] text-neutral-500">{dateStr}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPassed ? (
                        <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10">
                          Passed ({score}%)
                        </Badge>
                      ) : isFailed ? (
                        <Badge variant="outline" className="text-[10px] font-bold text-rose-600 dark:text-rose-400 border-rose-500/20 bg-rose-500/10">
                          Score: {score ?? 0}% (Below 70%)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] font-medium text-blue-600 dark:text-blue-400 border-blue-500/20 bg-blue-500/10">
                          {session.status}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {session.summaryFeedback && (
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-200/60 dark:border-neutral-800/80 leading-relaxed">
                      <strong className="text-neutral-800 dark:text-neutral-200">Feedback:</strong> {session.summaryFeedback}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Max Attempts Reached Alert Notice (if exhausted and not passed) */}
      {!isInterviewPassed && totalAttempts >= maxAttempts && (
        <div className="w-full max-w-xl rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2 text-left text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Maximum Retry Limit (3 of 3) Reached</span>
          </div>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
            You have completed all 3 permitted attempts. You cannot start a new interview session at this time. Our admissions committee is conducting a manual review of your assessment dossiers. If you have questions, please reach out to support.
          </p>
        </div>
      )}

      {/* Assessment Steps Breakdown (Direct minimal items) */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
        <span className="flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-neutral-400" />
          <span>1. Architecture & Scenarios</span>
        </span>
        <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">•</span>
        <span className="flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5 text-neutral-400" />
          <span>2. Live Interactive Coding</span>
        </span>
        <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">•</span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
          <span>3. Automated Real-time Scoring</span>
        </span>
      </div>

      {/* Action CTA */}
      <div className="flex flex-col items-center gap-2 pt-2">
        {isInterviewPassed ? (
          <Button
            onClick={() => navigate("/teachers/dashboard")}
            className="gap-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 cursor-pointer px-7 py-3 transition-all active:scale-95"
          >
            <span>Enter Creator Studio Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : canRetry ? (
          <Button
            onClick={handleStartAiInterview}
            disabled={isStartingInterview}
            className="gap-2.5 rounded-xl text-xs font-bold bg-[#F42A18] hover:bg-[#d92212] text-white shadow-lg shadow-[#F42A18]/25 cursor-pointer px-7 py-3 transition-all active:scale-95"
          >
            {isStartingInterview ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : totalAttempts > 0 ? (
              <RotateCcw className="w-4 h-4" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
            <span>
              {isStartingInterview
                ? "Initializing Studio..."
                : totalAttempts > 0
                ? `Retry AI Assessment (${remainingAttempts} left)`
                : "Launch AI Assessment"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            disabled
            className="gap-2.5 rounded-xl text-xs font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed px-7 py-3"
          >
            <span>Maximum Attempts Reached (3/3)</span>
          </Button>
        )}

        <span className="text-[11px] text-neutral-400">
          {!isInterviewPassed && totalAttempts < maxAttempts && "Camera & microphone access will be requested upon entering the studio"}
        </span>
      </div>
    </div>
  )
}

export default TeacherInterviewVettingPage
