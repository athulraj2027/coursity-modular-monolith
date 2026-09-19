import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  Bot,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Edit3,
  AlertTriangle,
  Send,
} from "lucide-react"
import { useProfile } from "@/features/profile"
import { normalizeQualifications } from "@/features/profile/types/profile.types"
import { cn } from "@/lib/utils"

export interface TeacherVerificationMenuProps {
  isCollapsed?: boolean
}

export const TeacherVerificationMenu: React.FC<TeacherVerificationMenuProps> = ({
  isCollapsed = false,
}) => {
  const navigate = useNavigate()
  const { data: profileData } = useProfile()
  const [isOpen, setIsOpen] = useState(true)

  const teacherProfile = profileData?.teacherProfile
  const userProfile = profileData?.profile

  // If the interview is already passed, remove this menu from the sidebar
  if (teacherProfile?.isInterviewPassed) {
    return null
  }

  // Calculate profile completion and status flags
  const hasBioOrQual = Boolean(
    userProfile?.bio?.trim() || normalizeQualifications(teacherProfile?.qualifications).length > 0
  )
  const hasExpertise = Boolean(
    teacherProfile?.expertise && teacherProfile.expertise.length > 0
  )
  const isProfileComplete = hasBioOrQual && hasExpertise

  const approvalStatus =
    teacherProfile?.approvalStatus ||
    (teacherProfile?.isApproved ? "VERIFIED" : "PENDING")

  const isRedo = approvalStatus === "REDO"
  const isInProgress = approvalStatus === "IN_PROGRESS"
  const isVerified = approvalStatus === "VERIFIED" || Boolean(teacherProfile?.isApproved)
  const isInterviewPassed = Boolean(teacherProfile?.isInterviewPassed)

  // Status Badge in Header
  let statusBadgeText = "Action Needed"
  let statusBadgeColor =
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"

  if (isRedo) {
    statusBadgeText = "Revisions Needed"
    statusBadgeColor =
      "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
  } else if (isInProgress) {
    statusBadgeText = "Under Review"
    statusBadgeColor =
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
  } else if (isVerified) {
    statusBadgeText = "Interview Pending"
    statusBadgeColor =
      "bg-red-500/10 text-[#F42A18] border-red-500/20"
  }

  if (isCollapsed) {
    return (
      <div className="px-2 py-2 flex justify-center">
        <button
          type="button"
          onClick={() => navigate(isVerified ? "/teachers/onboarding/interview" : "/teachers/onboarding/profile")}
          title={`Verification Status: ${statusBadgeText}`}
          className="relative w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center hover:bg-amber-500/20 transition-colors cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#F42A18] animate-pulse" />
        </button>
      </div>
    )
  }

  return (
    <div className="mx-2 my-2 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 shadow-xs overflow-hidden transition-all text-left">
      {/* 1. Clickable Header Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#F42A18]/10 text-[#F42A18] flex items-center justify-center shrink-0">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                Verification Status
              </span>
            </div>
            <span
              className={cn(
                "inline-block text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider mt-0.5",
                statusBadgeColor
              )}
            >
              {statusBadgeText}
            </span>
          </div>
        </div>

        <ChevronDown
          className={cn(
            "w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* 2. Collapsible Dropdown Checklist Body */}
      {isOpen && (
        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-neutral-100 dark:border-neutral-800/80">
          {/* Step 1: Complete Profile */}
          <div
            onClick={() => navigate("/teachers/profile")}
            className="p-2 rounded-xl border border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/70 dark:bg-neutral-950/40 hover:border-[#F42A18]/30 transition-all cursor-pointer flex items-start gap-2.5 group"
          >
            <div className="mt-0.5 shrink-0">
              {isProfileComplete ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Edit3 className="w-4 h-4 text-amber-500 group-hover:text-[#F42A18] transition-colors" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-[#F42A18] transition-colors">
                  1. Complete Profile
                </span>
                <ChevronRight className="w-3 h-3 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight mt-0.5">
                {isProfileComplete
                  ? "Qualifications & bio provided"
                  : "Add bio, degrees & domain specializations"}
              </p>
            </div>
          </div>

          {/* Step 2: Profile Review / Issues */}
          <div
            onClick={() => navigate("/teachers/profile")}
            className={cn(
              "p-2 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 group",
              isRedo
                ? "border-orange-500/40 bg-orange-500/10 ring-1 ring-orange-500/20"
                : isInProgress
                ? "border-blue-500/30 bg-blue-500/5"
                : isVerified
                ? "border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/70 dark:bg-neutral-950/40"
                : "border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/70 dark:bg-neutral-950/40 opacity-70"
            )}
          >
            <div className="mt-0.5 shrink-0">
              {isRedo ? (
                <AlertTriangle className="w-4 h-4 text-orange-500 animate-bounce" />
              ) : isInProgress ? (
                <Clock className="w-4 h-4 text-blue-500" />
              ) : isVerified ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Send className="w-4 h-4 text-neutral-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-semibold group-hover:text-[#F42A18] transition-colors",
                    isRedo
                      ? "text-orange-600 dark:text-orange-400 font-bold"
                      : "text-neutral-900 dark:text-neutral-100"
                  )}
                >
                  {isRedo ? "2. Correct Profile Issues" : "2. Admin Verification"}
                </span>
                <ChevronRight className="w-3 h-3 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight mt-0.5">
                {isRedo
                  ? teacherProfile?.rejectionReason
                    ? `Admin: "${teacherProfile.rejectionReason.slice(0, 45)}..."`
                    : "Revisions requested by administrator"
                  : isInProgress
                  ? "Application submitted for admin review"
                  : isVerified
                  ? "Profile approved by administrator"
                  : "Submit profile once completed"}
              </p>
            </div>
          </div>

          {/* Step 3: Complete AI Interview */}
          <div
            onClick={() => navigate("/teachers/onboarding/interview")}
            className={cn(
              "p-2 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 group",
              !isInterviewPassed && (isVerified || isProfileComplete)
                ? "border-[#F42A18]/40 bg-[#F42A18]/5 ring-1 ring-[#F42A18]/20"
                : "border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/70 dark:bg-neutral-950/40"
            )}
          >
            <div className="mt-0.5 shrink-0">
              {isInterviewPassed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Bot className="w-4 h-4 text-[#F42A18] animate-pulse" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-[#F42A18] transition-colors">
                  3. Complete AI Interview
                </span>
                <ChevronRight className="w-3 h-3 text-[#F42A18] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight mt-0.5">
                15-min real-time voice vetting (Score ≥ 70% to unlock studio)
              </p>
            </div>
          </div>

          {/* Footer CTA */}
          <button
            type="button"
            onClick={() =>
              navigate(isVerified ? "/teachers/onboarding/interview" : "/teachers/onboarding/profile")
            }
            className="w-full mt-1 py-1.5 px-2 rounded-lg bg-[#F42A18] hover:bg-[#d92212] text-white text-[10px] font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>{isVerified ? "Go to AI Vetting Studio" : "Open Verification Profile"}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}

export default TeacherVerificationMenu
