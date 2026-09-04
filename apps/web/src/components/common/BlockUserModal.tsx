import React, { useMemo } from "react"
import { Ban, ShieldCheck, Mail, Shield, AlertTriangle } from "lucide-react"
import { ConfirmationModal } from "./ConfirmationModal"
import type { BackendUser } from "@/features/dashboard/types/user-management.types"

export interface BlockUserModalProps {
  user: BackendUser | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  isLoading?: boolean
  roleLabel?: string
}

export const BlockUserModal: React.FC<BlockUserModalProps> = ({
  user,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  roleLabel,
}) => {
  const isCurrentlyBlocked = Boolean(user?.isBlocked)
  const effectiveRoleLabel = roleLabel || (user?.role === "TEACHER" ? "Instructor" : user?.role === "STUDENT" ? "Student" : "User")

  const initials = useMemo(() => {
    if (!user?.name) return "US"
    return user.name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }, [user?.name])

  if (!user) return null

  const title = isCurrentlyBlocked
    ? `Unblock ${effectiveRoleLabel} Account`
    : `Block ${effectiveRoleLabel} Account`

  const description = isCurrentlyBlocked
    ? `Restore system and course access for ${user.name || "this user"}.`
    : `Restrict system and platform access for ${user.name || "this user"}.`

  const confirmText = isCurrentlyBlocked ? "Unblock Account" : "Block Account"
  const variant = isCurrentlyBlocked ? "success" : "danger"

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
        isCurrentlyBlocked ? (
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
        ) : (
          <Ban className="w-5 h-5 text-red-500" />
        )
      }
    >
      <div className="space-y-4">
        {/* User preview card */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800 flex items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl font-bold text-sm flex items-center justify-center shrink-0 ${
              isCurrentlyBlocked
                ? "bg-red-500/10 text-red-500"
                : "bg-[#F42A18]/10 text-[#F42A18]"
            }`}
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-900 dark:text-white text-sm truncate">
                {user.name}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                  isCurrentlyBlocked
                    ? "bg-red-500/10 text-red-500 border-red-500/20"
                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                }`}
              >
                {isCurrentlyBlocked ? "Blocked" : "Active"}
              </span>
            </div>

            <div className="text-xs text-neutral-500 truncate flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3 h-3 text-neutral-400" />
              <span>{user.email}</span>
            </div>
          </div>
        </div>

        {/* Warning / Informative Banner */}
        {isCurrentlyBlocked ? (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Access will be immediately restored</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                This account will be permitted to sign in again and resume all active learning and platform activities.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-800 dark:text-red-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Account access will be suspended</p>
              <p className="text-[11px] text-red-700 dark:text-red-400 leading-relaxed">
                The user will be immediately logged out and will not be able to sign in or access course content until unblocked by an administrator.
              </p>
            </div>
          </div>
        )}
      </div>
    </ConfirmationModal>
  )
}

export default BlockUserModal
