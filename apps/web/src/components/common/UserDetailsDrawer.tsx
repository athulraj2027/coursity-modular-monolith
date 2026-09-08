import React, { useEffect, useMemo, useState } from "react"
import {
  X,
  Shield,
  ShieldCheck,
  GraduationCap,
  Globe,
  Mail,
  Calendar,
  Clock,
  Ban,
  Phone,
  Briefcase,
  Award,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  UserX,
  RotateCcw,
  MessageSquare,
  SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BackendUser, UserRole, ApprovalStatus } from "@/features/dashboard/types/user-management.types"

export interface UserDetailsDrawerProps {
  user: BackendUser | null
  isOpen?: boolean
  onClose: () => void
  titleFallback?: string
  initialsFallback?: string
  onBlock?: (userId: string) => void
  isBlocking?: boolean
  onApprove?: (userId: string, status?: ApprovalStatus | boolean) => void
  isApproving?: boolean
  customFields?: (user: BackendUser) => React.ReactNode
  customActions?: (user: BackendUser) => React.ReactNode
}

export const UserDetailsDrawer: React.FC<UserDetailsDrawerProps> = ({
  user,
  isOpen = !!user,
  onClose,
  titleFallback = "User Record",
  initialsFallback,
  onBlock,
  isBlocking = false,
  onApprove,
  isApproving = false,
  customFields,
  customActions,
}) => {
  const [avatarError, setAvatarError] = useState(false)

  // Reset avatar error on user change
  useEffect(() => {
    setAvatarError(false)
  }, [user?.id, user?.profile?.avatar])

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  const initials = useMemo(() => {
    if (!user) return initialsFallback || "UR"
    if (user.name && user.name.trim()) {
      return user.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    }
    return initialsFallback || (user.role ? user.role.substring(0, 2) : "UR")
  }, [user, initialsFallback])

  if (!isOpen || !user) return null

  const profile = user.profile
  const teacherProfile = profile?.teacherProfile
  const isTeacher = user.role === "TEACHER"
  const approvalStatus: ApprovalStatus =
    teacherProfile?.approvalStatus ||
    (teacherProfile?.isApproved ? "VERIFIED" : "PENDING")

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "STUDENT":
        return <GraduationCap className="w-4 h-4 text-blue-500" />
      case "TEACHER":
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />
      case "ADMIN":
        return <Shield className="w-4 h-4 text-purple-500" />
      default:
        return <Shield className="w-4 h-4 text-neutral-400" />
    }
  }

  const renderApprovalStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </span>
        )
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
            <Clock className="w-3 h-3" />
            In Progress
          </span>
        )
      case "REDO":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 shrink-0">
            <RotateCcw className="w-3 h-3" />
            Needs Revision
          </span>
        )
      case "REVOKED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
            <UserX className="w-3 h-3" />
            Revoked
          </span>
        )
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <AlertCircle className="w-3 h-3" />
            Pending Verification
          </span>
        )
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="h-full w-full sm:max-w-xl lg:w-[580px] bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300 ease-out"
      >
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/40 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            {profile?.avatar && !avatarError ? (
              <img
                src={profile.avatar}
                alt={user.name}
                onError={() => setAvatarError(true)}
                className="w-13 h-13 rounded-2xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0 shadow-xs"
              />
            ) : (
              <div className="w-13 h-13 rounded-2xl bg-[#F42A18]/10 text-[#F42A18] font-bold text-base flex items-center justify-center shrink-0 border border-[#F42A18]/20">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white truncate">
                  {user.name || titleFallback}
                </h3>
                {isTeacher && renderApprovalStatusBadge(approvalStatus)}
              </div>
              <p className="text-xs text-neutral-500 truncate">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Close panel"
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Details Overview Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Account ID Block */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
            <div className="text-[10px] uppercase font-semibold text-neutral-400">Account ID</div>
            <div className="font-mono text-neutral-900 dark:text-white text-xs select-all break-all">
              {user.id}
            </div>
          </div>

          {/* Role & Sign-in Method Cards */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-1.5 bg-neutral-50/30 dark:bg-neutral-950/20">
              <div className="text-neutral-500 text-[10px] uppercase font-semibold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#F42A18]" />
                <span>Account Role</span>
              </div>
              <div className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                {getRoleIcon(user.role)}
                <span>{user.role === "TEACHER" ? "Instructor" : user.role === "STUDENT" ? "Student" : "Admin"}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-1.5 bg-neutral-50/30 dark:bg-neutral-950/20">
              <div className="text-neutral-500 text-[10px] uppercase font-semibold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>Sign-in Method</span>
              </div>
              <div className="text-sm font-bold text-neutral-900 dark:text-white">
                {user.authProvider === "GOOGLE" ? "Google Account" : "Email & Password"}
              </div>
            </div>
          </div>

          {/* Personal Profile Section (Students & Teachers) */}
          <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-3 bg-neutral-50/30 dark:bg-neutral-950/20">
            <div className="text-[11px] uppercase tracking-wider font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 border-b border-neutral-200/60 dark:border-neutral-800/80 pb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#F42A18]" />
              <span>Personal Details</span>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-neutral-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                <span>Phone Number:</span>
              </span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                {profile?.phone || "Not provided"}
              </span>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-neutral-200/60 dark:border-neutral-800/80">
              <span className="text-neutral-500 text-[11px] block">Biography:</span>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 italic bg-white/70 dark:bg-neutral-900/70 p-3 rounded-lg border border-neutral-200/60 dark:border-neutral-800">
                {profile?.bio ? profile.bio : "No biography provided yet."}
              </p>
            </div>
          </div>

          {/* Teacher Credentials & Verification Section */}
          {isTeacher && (
            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-3.5 bg-neutral-50/30 dark:bg-neutral-950/20">
              <div className="flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800/80 pb-2">
                <div className="text-[11px] uppercase tracking-wider font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Instructor Credentials & Lifecycle</span>
                </div>
                {renderApprovalStatusBadge(approvalStatus)}
              </div>

              {/* Actionable Feedback / Rejection Reason Callout if present */}
              {teacherProfile?.rejectionReason && (
                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 space-y-1.5 text-left">
                  <div className="flex items-center gap-1.5 text-orange-700 dark:text-orange-300 font-bold text-xs">
                    <MessageSquare className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span>Admin Feedback & Improvement Suggestions:</span>
                  </div>
                  <p className="text-xs text-neutral-800 dark:text-neutral-200 bg-white/80 dark:bg-neutral-900/80 p-2.5 rounded-lg border border-orange-500/20 italic">
                    "{teacherProfile.rejectionReason}"
                  </p>
                </div>
              )}

              {/* Qualifications & Experience */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white/70 dark:bg-neutral-900/70 border border-neutral-200/60 dark:border-neutral-800 space-y-1">
                  <div className="text-neutral-500 text-[10px] uppercase font-semibold flex items-center gap-1">
                    <Award className="w-3 h-3 text-emerald-500" />
                    <span>Qualifications</span>
                  </div>
                  <div className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                    {teacherProfile?.qualifications || "Not specified"}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white/70 dark:bg-neutral-900/70 border border-neutral-200/60 dark:border-neutral-800 space-y-1">
                  <div className="text-neutral-500 text-[10px] uppercase font-semibold flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-blue-500" />
                    <span>Experience</span>
                  </div>
                  <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {teacherProfile?.experienceYears !== undefined && teacherProfile?.experienceYears !== null
                      ? `${teacherProfile.experienceYears} Years`
                      : "Not specified"}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white/70 dark:bg-neutral-900/70 border border-neutral-200/60 dark:border-neutral-800 space-y-1 col-span-2 sm:col-span-1">
                  <div className="text-neutral-500 text-[10px] uppercase font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-purple-500" />
                    <span>Submissions</span>
                  </div>
                  <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {teacherProfile?.submissionCount ?? 0} / 5 attempts
                  </div>
                </div>
              </div>

              {/* Domains of Expertise */}
              <div className="space-y-1.5">
                <div className="text-neutral-500 text-[10px] uppercase font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Domains of Expertise</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {teacherProfile?.expertise && teacherProfile.expertise.length > 0 ? (
                    teacherProfile.expertise.map((exp, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
                      >
                        {exp}
                      </span>
                    ))
                  ) : (
                    <span className="text-neutral-400 italic text-xs">No expertise domains listed.</span>
                  )}
                </div>
              </div>

              {/* Social & Web Profiles */}
              <div className="space-y-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/80">
                <div className="text-neutral-500 text-[10px] uppercase font-semibold">Social & Web Links</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {teacherProfile?.linkedinUrl ? (
                    <a
                      href={teacherProfile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors flex items-center gap-1.5 truncate font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">LinkedIn</span>
                    </a>
                  ) : (
                    <div className="p-2 rounded-lg bg-neutral-100/60 dark:bg-neutral-800/40 text-neutral-400 border border-neutral-200/40 dark:border-neutral-800 flex items-center gap-1.5 opacity-60">
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span>No LinkedIn</span>
                    </div>
                  )}

                  {teacherProfile?.twitterUrl ? (
                    <a
                      href={teacherProfile.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-colors flex items-center gap-1.5 truncate font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Twitter / X</span>
                    </a>
                  ) : (
                    <div className="p-2 rounded-lg bg-neutral-100/60 dark:bg-neutral-800/40 text-neutral-400 border border-neutral-200/40 dark:border-neutral-800 flex items-center gap-1.5 opacity-60">
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span>No Twitter</span>
                    </div>
                  )}

                  {teacherProfile?.websiteUrl ? (
                    <a
                      href={teacherProfile.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors flex items-center gap-1.5 truncate font-medium"
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Website</span>
                    </a>
                  ) : (
                    <div className="p-2 rounded-lg bg-neutral-100/60 dark:bg-neutral-800/40 text-neutral-400 border border-neutral-200/40 dark:border-neutral-800 flex items-center gap-1.5 opacity-60">
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span>No Website</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Account Timestamps & Status */}
          <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-3 bg-neutral-50/30 dark:bg-neutral-950/20">
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-neutral-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                <span>Account Status:</span>
              </span>
              {user.isBlocked ? (
                <span className="font-semibold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[11px] border border-red-500/20 flex items-center gap-1">
                  <Ban className="w-3 h-3" />
                  Blocked
                </span>
              ) : (
                <span className="font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] border border-emerald-500/20">
                  Active
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-t border-neutral-200/60 dark:border-neutral-800/80">
              <span className="text-neutral-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>Account Created:</span>
              </span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                {new Date(user.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-t border-neutral-200/60 dark:border-neutral-800/80">
              <span className="text-neutral-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Last Updated:</span>
              </span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                {new Date(user.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Custom Fields Slot if provided */}
          {customFields && customFields(user)}
        </div>

        {/* Drawer Actions (Sticky Footer) */}
        <div className="p-5 sm:p-6 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center flex-wrap gap-2">
            {/* Manage Verification & Approval Lifecycle for Teachers */}
            {isTeacher && onApprove && (
              <Button
                type="button"
                onClick={() => onApprove(user.id, approvalStatus)}
                disabled={isApproving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{isApproving ? "Updating..." : "Manage Approval Status"}</span>
              </Button>
            )}

            {onBlock && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onBlock(user.id)}
                disabled={isBlocking}
                className={
                  user.isBlocked
                    ? "text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                    : "text-red-500 border-red-500/30 hover:bg-red-500/10 text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                }
              >
                <Ban className="w-3.5 h-3.5" />
                <span>{user.isBlocked ? "Unblock User" : "Block User"}</span>
              </Button>
            )}

            {/* Custom Actions Slot */}
            {customActions && customActions(user)}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default UserDetailsDrawer
