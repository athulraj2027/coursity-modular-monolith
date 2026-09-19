import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Clock,
  RefreshCw,
  FileText,
  ShieldCheck,
  Award,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/lib/toast"
import { useProfile } from "../hooks/useProfile"
import { normalizeQualifications } from "../types/profile.types"

export const TeacherApplicationReviewPage: React.FC = () => {
  const navigate = useNavigate()
  const { data: profileData, refetch, isFetching } = useProfile()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const teacherProfile = profileData?.teacherProfile
  const approvalStatus = teacherProfile?.approvalStatus || (teacherProfile?.isApproved ? "VERIFIED" : "PENDING")
  const isInterviewPassed = Boolean(teacherProfile?.isInterviewPassed)

  // Redirect if status changes (e.g., approved by admin -> go to interview step; redo -> go back to edit)
  useEffect(() => {
    if (approvalStatus === "VERIFIED" && !isInterviewPassed) {
      toast.success("Congratulations! Your credentials have been verified.")
      navigate("/teachers/onboarding/interview", { replace: true })
    } else if (approvalStatus === "VERIFIED" && isInterviewPassed) {
      navigate("/teachers/dashboard", { replace: true })
    } else if (approvalStatus === "PENDING" || approvalStatus === "REDO") {
      navigate("/teachers/onboarding/profile", { replace: true })
    }
  }, [approvalStatus, isInterviewPassed, navigate])

  const handleRefresh = async () => {
    try {
      const res = await refetch()
      const newStatus = res.data?.teacherProfile?.approvalStatus
      if (newStatus === "VERIFIED") {
        toast.success("Application approved! You can now proceed to your AI Vetting assessment.")
      } else {
        toast.info("Status refreshed. Application is still under review.")
      }
    } catch {
      toast.error("Failed to refresh status")
    }
  }

  const qualList = normalizeQualifications(teacherProfile?.qualifications)
  const submissionCount = teacherProfile?.submissionCount ?? 1

  return (
    <div className="flex flex-1 flex-col items-center justify-center w-full max-w-4xl mx-auto space-y-8 py-6 text-left">
      {/* Main Review Card */}
      <div className="relative overflow-hidden w-full rounded-3xl border border-amber-500/30 dark:border-amber-500/20 bg-white dark:bg-neutral-900/80 p-8 sm:p-12 shadow-xl shadow-amber-500/5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-[#F42A18]/5 blur-3xl"
        />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          {/* Animated Status Pulse Badge */}
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 dark:bg-amber-500/15 flex items-center justify-center ring-8 ring-amber-500/5 animate-pulse">
              <Clock className="w-10 h-10 text-amber-500" />
            </div>
            <span className="absolute -bottom-1 right-2 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500" />
            </span>
          </div>

          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Submission {submissionCount} of 5 • Status: Under Review</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Your Application is Under Admissions Review
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Thank you for submitting your instructor credentials. Our admissions team is currently reviewing your government identity document, academic degrees, and expertise.
            </p>
          </div>

          {/* Review Info Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-4 text-left">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Review Window
              </span>
              <div className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                24 – 48 Hours
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Admissions committee reviews applications daily.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Submitted Documents
              </span>
              <div className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                ID, Resume & Credentials
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Encrypted & securely queued for verification.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Next Stage
              </span>
              <div className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#F42A18]" />
                AI Vetting Assessment
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Once approved, you will be invited to take your AI interview.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button
              onClick={handleRefresh}
              disabled={isFetching}
              className="gap-2 rounded-xl text-xs font-bold bg-[#F42A18] hover:bg-[#d92212] text-white shadow-md shadow-[#F42A18]/25 cursor-pointer px-6 py-2.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              <span>{isFetching ? "Checking Status..." : "Refresh Verification Status"}</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              className="gap-2 rounded-xl text-xs font-semibold border-neutral-300 dark:border-neutral-700 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isPreviewOpen ? "Hide Submitted Details" : "View Submitted Details"}</span>
              {isPreviewOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Submitted Details Preview Drawer */}
      {isPreviewOpen && (
        <div className="w-full rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6 sm:p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#F42A18]" />
              Submitted Application Summary
            </h3>
            <Badge variant="outline" className="text-xs text-neutral-500">
              Read-Only
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px]">
                Profile Information
              </span>
              <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-400">Full Name</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{profileData?.name}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-400">Email Address</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{profileData?.email}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-400">Country</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{profileData?.profile?.country || "—"}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-400">Phone</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{profileData?.profile?.phone || "—"}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-400">Experience</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{teacherProfile?.experienceYears ?? 0} years</span>
                </div>
              </div>
            </div>

            {/* Documents Verification Status */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px]">
                Attached Documents
              </span>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                    <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
                    Government ID / PAN Card
                  </span>
                  {teacherProfile?.identityCard ? (
                    <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5">
                      Attached
                    </Badge>
                  ) : (
                    <span className="text-[11px] text-neutral-400">Missing</span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                    <Award className="w-3.5 h-3.5 text-neutral-400" />
                    Degree & Certificate Files
                  </span>
                  <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5">
                    {teacherProfile?.credentials?.length || 0} Files
                  </Badge>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                    <FileText className="w-3.5 h-3.5 text-neutral-400" />
                    Curriculum Vitae / Resume
                  </span>
                  {teacherProfile?.resume ? (
                    <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5">
                      Attached
                    </Badge>
                  ) : (
                    <span className="text-[11px] text-neutral-400">Missing</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Qualifications & Degrees */}
          {qualList.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px]">
                Qualifications ({qualList.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {qualList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-1 text-xs"
                  >
                    <div className="font-bold text-neutral-900 dark:text-white flex items-center justify-between">
                      <span>{item.title}</span>
                      <span className="text-[11px] text-neutral-400 font-medium">{item.year}</span>
                    </div>
                    {item.institution && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {item.institution}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Domain Expertise */}
          {teacherProfile?.expertise && teacherProfile.expertise.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px]">
                Domain Expertise
              </span>
              <div className="flex flex-wrap gap-2">
                {teacherProfile.expertise.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-[#F42A18]/10 text-[#F42A18] border-[#F42A18]/20 text-xs px-2.5 py-0.5"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TeacherApplicationReviewPage
