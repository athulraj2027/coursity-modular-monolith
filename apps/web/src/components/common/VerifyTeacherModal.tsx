import React, { useMemo, useState, useEffect } from "react"
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Mail,
  Award,
  Briefcase,
  UserCheck,
  UserX,
} from "lucide-react"
import { ConfirmationModal } from "./ConfirmationModal"
import type { BackendUser } from "@/features/dashboard/types/user-management.types"

export interface VerifyTeacherModalProps {
  user: BackendUser | null
  /**
   * Target verification status to set.
   * true = Approve/Verify teacher
   * false = Revoke verification
   */
  targetStatus?: boolean
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  isLoading?: boolean
}

export const VerifyTeacherModal: React.FC<VerifyTeacherModalProps> = ({
  user,
  targetStatus = true,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [avatarError, setAvatarError] = useState(false)

  useEffect(() => {
    setAvatarError(false)
  }, [user?.id, user?.profile?.avatar])

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

  if (!user) return null

  const profile = user.profile
  const teacherProfile = profile?.teacherProfile
  const currentlyApproved = Boolean(teacherProfile?.isApproved)

  const isVerifying = targetStatus

  const title = isVerifying
    ? "Verify Instructor Account"
    : "Revoke Instructor Verification"

  const description = isVerifying
    ? `Approve instructor credentials and grant verified teacher privileges to ${user.name || "this user"}.`
    : `Remove verified instructor credentials and badge for ${user.name || "this user"}.`

  const confirmText = isVerifying ? "Verify Instructor" : "Revoke Verification"
  const variant = isVerifying ? "success" : "warning"

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmText={confirmText}
      cancelText="Cancel"
      variant={variant}
      isLoading={isLoading}
      icon={
        isVerifying ? (
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
        ) : (
          <UserX className="w-5 h-5 text-amber-500" />
        )
      }
    >
      <div className="space-y-4">
        {/* Instructor Summary Card */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <div className="flex items-center gap-3.5">
            {profile?.avatar && !avatarError ? (
              <img
                src={profile.avatar}
                alt={user.name}
                onError={() => setAvatarError(true)}
                className="w-12 h-12 rounded-xl object-cover border border-neutral-200 dark:border-neutral-800 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#F42A18]/10 text-[#F42A18] font-bold text-sm flex items-center justify-center shrink-0 border border-[#F42A18]/20">
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-900 dark:text-white text-sm truncate">
                  {user.name}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 shrink-0 ${
                    currentlyApproved
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  }`}
                >
                  {currentlyApproved ? (
                    <>
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Currently Verified
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-2.5 h-2.5" />
                      Pending Verification
                    </>
                  )}
                </span>
              </div>

              <div className="text-xs text-neutral-500 truncate flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          {/* Credentials quick overview */}
          {(teacherProfile?.qualifications ||
            teacherProfile?.experienceYears !== undefined ||
            (teacherProfile?.expertise && teacherProfile.expertise.length > 0)) && (
            <div className="pt-2.5 border-t border-neutral-200/60 dark:border-neutral-800/80 space-y-2 text-left">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {teacherProfile?.qualifications && (
                  <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300 truncate">
                    <Award className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{teacherProfile.qualifications}</span>
                  </div>
                )}
                {teacherProfile?.experienceYears !== undefined && teacherProfile?.experienceYears !== null && (
                  <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                    <Briefcase className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{teacherProfile.experienceYears} Years Exp.</span>
                  </div>
                )}
              </div>

              {teacherProfile?.expertise && teacherProfile.expertise.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {teacherProfile.expertise.slice(0, 4).map((exp, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700"
                    >
                      {exp}
                    </span>
                  ))}
                  {teacherProfile.expertise.length > 4 && (
                    <span className="text-[10px] text-neutral-400 self-center">
                      +{teacherProfile.expertise.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Informative / Consequence Banner */}
        {isVerifying ? (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5 text-left">
            <UserCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Verification badge will be activated</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                This instructor will receive a verified badge across all course listings and public search directories, and will be permitted to publish live courses.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5 text-left">
            <UserX className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Verification status will be removed</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                The instructor profile will return to pending verification. The verified badge will be removed from public listings until re-approved.
              </p>
            </div>
          </div>
        )}
      </div>
    </ConfirmationModal>
  )
}

export default VerifyTeacherModal
