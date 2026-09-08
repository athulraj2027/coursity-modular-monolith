import React, { useMemo, useState, useEffect } from "react"
import {
  ShieldCheck,
  AlertCircle,
  Clock,
  RotateCcw,
  UserX,
  Mail,
  Award,
  Briefcase,
  MessageSquare,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BackendUser, ApprovalStatus } from "@/features/dashboard/types/user-management.types"
import { verifyTeacherSchema } from "@/features/profile"

export interface VerifyTeacherModalProps {
  user: BackendUser | null
  /**
   * Initial target verification status to set.
   * Can be boolean (true = VERIFIED, false = REVOKED) or explicit ApprovalStatus.
   */
  targetStatus?: ApprovalStatus | boolean
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: {
    approvalStatus: ApprovalStatus
    isApproved: boolean
    rejectionReason?: string | null
  }) => Promise<void> | void
  isLoading?: boolean
}

export const ALLOWED_APPROVAL_TRANSITIONS: Record<ApprovalStatus, ApprovalStatus[]> = {
  PENDING: [],
  IN_PROGRESS: ["VERIFIED", "REDO"],
  VERIFIED: ["REVOKED"],
  REVOKED: ["PENDING"],
  REDO: [],
}

export const VerifyTeacherModal: React.FC<VerifyTeacherModalProps> = ({
  user,
  targetStatus = "VERIFIED",
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [avatarError, setAvatarError] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<ApprovalStatus>("VERIFIED")
  const [feedback, setFeedback] = useState<string>("")
  const [feedbackTouched, setFeedbackTouched] = useState<boolean>(false)

  const profile = user?.profile
  const teacherProfile = profile?.teacherProfile
  const currentStatus: ApprovalStatus =
    teacherProfile?.approvalStatus ||
    (teacherProfile?.isApproved ? "VERIFIED" : "PENDING")

  const allowedNextStatuses = useMemo(() => {
    return ALLOWED_APPROVAL_TRANSITIONS[currentStatus] || []
  }, [currentStatus])

  // Derive initial status whenever modal opens or user/targetStatus changes
  useEffect(() => {
    if (!isOpen || !user) return

    setAvatarError(false)
    setFeedbackTouched(false)

    const allowed = ALLOWED_APPROVAL_TRANSITIONS[currentStatus] || []

    let preferred: ApprovalStatus | null = null
    if (typeof targetStatus === "boolean") {
      preferred = targetStatus ? "VERIFIED" : "REVOKED"
    } else if (targetStatus && targetStatus !== currentStatus) {
      preferred = targetStatus
    }

    // Pick preferred if allowed, otherwise pick first allowed transition
    if (preferred && allowed.includes(preferred)) {
      setSelectedStatus(preferred)
    } else if (allowed.length > 0) {
      setSelectedStatus(allowed[0])
    } else {
      setSelectedStatus(currentStatus)
    }

    setFeedback(user.profile?.teacherProfile?.rejectionReason || "")
  }, [isOpen, user, targetStatus, currentStatus])

  const initials = useMemo(() => {
    if (!user?.name) return "IN"
    return user.name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }, [user?.name])

  if (!isOpen || !user) return null

  const requiresFeedback = selectedStatus === "REVOKED" || selectedStatus === "REDO"
  const validationResult = verifyTeacherSchema.safeParse({
    approvalStatus: selectedStatus,
    isApproved: selectedStatus === "VERIFIED",
    rejectionReason: feedback.trim(),
  })
  const isFeedbackValid = validationResult.success

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedbackTouched(true)

    const result = verifyTeacherSchema.safeParse({
      approvalStatus: selectedStatus,
      isApproved: selectedStatus === "VERIFIED",
      rejectionReason: feedback.trim(),
    })

    if (!result.success) {
      return
    }

    await onConfirm({
      approvalStatus: selectedStatus,
      isApproved: selectedStatus === "VERIFIED",
      rejectionReason: requiresFeedback ? feedback.trim() : (feedback.trim() ? feedback.trim() : null),
    })
  }

  const getStatusDetails = (status: ApprovalStatus) => {
    switch (status) {
      case "VERIFIED":
        return {
          title: "Verify & Approve Instructor",
          badgeLabel: "Verified",
          icon: ShieldCheck,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/30",
          btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
          btnLabel: "Approve & Verify Instructor",
          bannerBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300",
          bannerDesc:
            "This instructor will receive a verified badge across all course listings and public search directories, and will have permission to publish live courses.",
        }
      case "IN_PROGRESS":
        return {
          title: "Mark Application In Progress",
          badgeLabel: "In Progress",
          icon: Clock,
          color: "text-blue-500",
          bg: "bg-blue-500/10",
          border: "border-blue-500/30",
          btnColor: "bg-blue-600 hover:bg-blue-700 text-white",
          btnLabel: "Move to In Progress",
          bannerBg: "bg-blue-500/10 border-blue-500/20 text-blue-800 dark:text-blue-300",
          bannerDesc:
            "Instructor application is marked as actively under evaluation by administrators. Social media links are locked during evaluation.",
        }
      case "REDO":
        return {
          title: "Request Revisions (Redo Application)",
          badgeLabel: "Needs Revision",
          icon: RotateCcw,
          color: "text-orange-500",
          bg: "bg-orange-500/10",
          border: "border-orange-500/30",
          btnColor: "bg-orange-600 hover:bg-orange-700 text-white",
          btnLabel: "Request Revisions with Feedback",
          bannerBg: "bg-orange-500/10 border-orange-500/20 text-orange-800 dark:text-orange-300",
          bannerDesc:
            "Instruct the applicant to update their portfolio, experience, or domain credentials before re-evaluating. Actionable feedback is required.",
        }
      case "REVOKED":
        return {
          title: "Revoke Instructor Verification",
          badgeLabel: "Revoked",
          icon: UserX,
          color: "text-rose-500",
          bg: "bg-rose-500/10",
          border: "border-rose-500/30",
          btnColor: "bg-rose-600 hover:bg-rose-700 text-white",
          btnLabel: "Revoke Verification with Feedback",
          bannerBg: "bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300",
          bannerDesc:
            "Removes verified badge and retracts course publication privileges. Explanatory feedback is required for the instructor.",
        }
      case "PENDING":
      default:
        return {
          title: "Reset Status to Pending",
          badgeLabel: "Pending",
          icon: AlertCircle,
          color: "text-amber-500",
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          btnColor: "bg-neutral-800 hover:bg-neutral-900 text-white dark:bg-neutral-700 dark:hover:bg-neutral-600",
          btnLabel: "Reset Status to Pending",
          bannerBg: "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300",
          bannerDesc:
            "Resets the instructor application to pending evaluation in the unreviewed queue.",
        }
    }
  }

  const activeMeta = getStatusDetails(selectedStatus)
  const CurrentIcon = activeMeta.icon

  const allStatusConfigs = [
    { key: "VERIFIED" as ApprovalStatus, label: "Verified & Approved", icon: ShieldCheck, color: "hover:border-emerald-500", active: "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold" },
    { key: "IN_PROGRESS" as ApprovalStatus, label: "In Progress (Evaluation)", icon: Clock, color: "hover:border-blue-500", active: "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold" },
    { key: "REDO" as ApprovalStatus, label: "Needs Revision (Redo)", icon: RotateCcw, color: "hover:border-orange-500", active: "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold" },
    { key: "REVOKED" as ApprovalStatus, label: "Revoke Verification", icon: UserX, color: "hover:border-rose-500", active: "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold" },
    { key: "PENDING" as ApprovalStatus, label: "Reset to Pending", icon: AlertCircle, color: "hover:border-amber-500", active: "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold" },
  ]

  const selectableOptions = allStatusConfigs.filter((cfg) => allowedNextStatuses.includes(cfg.key))

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${activeMeta.bg} border ${activeMeta.border}`}>
              <CurrentIcon className={`w-5 h-5 ${activeMeta.color}`} />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Instructor Approval & Status
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Manage instructor verification lifecycle and provide feedback.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-4 text-xs">
          {/* Instructor Summary Card */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
            <div className="flex items-center gap-3">
              {profile?.avatar && !avatarError ? (
                <img
                  src={profile.avatar}
                  alt={user.name}
                  onError={() => setAvatarError(true)}
                  className="w-11 h-11 rounded-xl object-cover border border-neutral-200 dark:border-neutral-800 shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-[#F42A18]/10 text-[#F42A18] font-bold text-sm flex items-center justify-center shrink-0 border border-[#F42A18]/20">
                  {initials}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-900 dark:text-white text-sm truncate">
                    {user.name}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1 shrink-0 ${
                      currentStatus === "VERIFIED"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : currentStatus === "IN_PROGRESS"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                        : currentStatus === "REDO"
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                        : currentStatus === "REVOKED"
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    }`}
                  >
                    Current: {currentStatus.replace("_", " ")}
                  </span>
                </div>

                <div className="text-xs text-neutral-500 truncate flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>

            {/* Quick credentials */}
            {(teacherProfile?.qualifications || teacherProfile?.experienceYears != null) && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/80 text-[11px] text-neutral-600 dark:text-neutral-300">
                {teacherProfile?.qualifications && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Award className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="truncate">{teacherProfile.qualifications}</span>
                  </div>
                )}
                {teacherProfile?.experienceYears != null && (
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3 h-3 text-blue-500 shrink-0" />
                    <span>{teacherProfile.experienceYears} Years Exp.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lifecycle Status Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase tracking-wider font-bold text-neutral-600 dark:text-neutral-300 block">
                Allowed Next State:
              </label>
              <span className="text-[10px] text-neutral-400">
                {selectableOptions.length === 0
                  ? "0 actions available"
                  : selectableOptions.length === 1
                  ? "1 action available"
                  : `${selectableOptions.length} actions available`}
              </span>
            </div>

            {selectableOptions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectableOptions.map((opt) => {
                  const OptIcon = opt.icon
                  const isSelected = selectedStatus === opt.key
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSelectedStatus(opt.key)}
                      className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 cursor-pointer transition-all ${
                        isSelected
                          ? opt.active + " shadow-xs ring-1 ring-current"
                          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 " +
                            opt.color
                      }`}
                    >
                      <OptIcon className="w-4 h-4 shrink-0" />
                      <span className="font-semibold">{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <p className="font-semibold">
                    {currentStatus === "PENDING"
                      ? "Awaiting Instructor Submission"
                      : currentStatus === "REDO"
                      ? "Awaiting Instructor Re-submission"
                      : "No Actions Available"}
                  </p>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {currentStatus === "PENDING"
                      ? "This profile is in draft status. The instructor must click 'Submit for Verification' before administrative evaluation can occur."
                      : currentStatus === "REDO"
                      ? "This instructor was asked to revise their credentials. Administrative evaluation will unlock once the instructor re-submits their application."
                      : "No administrative transitions are available from the current status."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Status Effect Banner */}
          {selectableOptions.length > 0 && (
            <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${activeMeta.bannerBg}`}>
              <CurrentIcon className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-xs">{activeMeta.title}</p>
                <p className="text-[11px] leading-relaxed opacity-90">{activeMeta.bannerDesc}</p>
              </div>
            </div>
          )}

          {/* Suggestions & Feedback (Required for REVOKED & REDO) */}
          {selectableOptions.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="rejectionReason"
                  className="text-[11px] uppercase tracking-wider font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#F42A18]" />
                  <span>Suggestions / Feedback for Instructor</span>
                  {requiresFeedback && <span className="text-red-500 text-sm">*</span>}
                </label>
                <span
                  className={`text-[10px] ${
                    feedback.length > 1000
                      ? "text-red-500 font-bold"
                      : feedback.length >= 5 && requiresFeedback
                      ? "text-emerald-500 font-semibold"
                      : "text-neutral-400"
                  }`}
                >
                  {feedback.length} / 1000 chars
                </span>
              </div>

              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {requiresFeedback
                  ? "Please explain what the instructor should improve or provide (minimum 5 characters). This note will be visible to the instructor."
                  : "Optional administrative notes or suggestions for the instructor."}
              </p>

              <textarea
                id="rejectionReason"
                rows={3}
                value={feedback}
                onChange={(e) => {
                  setFeedback(e.target.value)
                  setFeedbackTouched(true)
                }}
                placeholder={
                  selectedStatus === "REDO"
                    ? "e.g., Please add at least 2 more years of verified industry experience in your bio and attach a valid LinkedIn profile URL..."
                    : selectedStatus === "REVOKED"
                    ? "e.g., Verification revoked due to invalid domain credentials. Please re-submit with accredited certificates..."
                    : "Add any feedback or notes for this instructor..."
                }
                className={`w-full p-3 rounded-xl border bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder:text-neutral-400 text-xs focus:outline-none focus:ring-2 transition-all ${
                  requiresFeedback && feedbackTouched && !isFeedbackValid
                    ? "border-red-500 focus:ring-red-500/20"
                    : "border-neutral-200 dark:border-neutral-800 focus:border-[#F42A18] focus:ring-[#F42A18]/10"
                }`}
              />

              {requiresFeedback && feedbackTouched && feedback.trim().length < 5 && (
                <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Feedback must be at least 5 characters long explaining what to improve.
                </p>
              )}
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || selectableOptions.length === 0 || (requiresFeedback && !isFeedbackValid)}
              className={`text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs ${activeMeta.btnColor}`}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isLoading ? "Updating Status..." : activeMeta.btnLabel}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VerifyTeacherModal
