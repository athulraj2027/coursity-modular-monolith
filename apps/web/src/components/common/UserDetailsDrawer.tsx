import React, { useEffect, useMemo } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BackendUser, UserRole } from "@/features/dashboard/types/user-management.types"

export interface UserDetailsDrawerProps {
  user: BackendUser | null
  isOpen?: boolean
  onClose: () => void
  titleFallback?: string
  initialsFallback?: string
  onBlock?: (userId: string) => void
  isBlocking?: boolean
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
  customFields,
  customActions,
}) => {
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="h-full w-full sm:max-w-lg lg:w-1/2 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300 ease-out"
      >
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/40 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#F42A18]/10 text-[#F42A18] font-bold text-base flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white truncate">
                {user.name || titleFallback}
              </h3>
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

        {/* Database Record Overview Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* User ID Block */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
            <div className="text-[10px] uppercase font-semibold text-neutral-400">Database User ID</div>
            <div className="font-mono text-neutral-900 dark:text-white text-xs select-all break-all">
              {user.id}
            </div>
          </div>

          {/* Role & Auth Provider Cards */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-1.5 bg-neutral-50/30 dark:bg-neutral-950/20">
              <div className="text-neutral-500 text-[10px] uppercase font-semibold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#F42A18]" />
                <span>Assigned Role</span>
              </div>
              <div className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                {getRoleIcon(user.role)}
                <span>{user.role}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-1.5 bg-neutral-50/30 dark:bg-neutral-950/20">
              <div className="text-neutral-500 text-[10px] uppercase font-semibold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>Auth Method</span>
              </div>
              <div className="text-base font-bold text-neutral-900 dark:text-white">
                {user.authProvider === "GOOGLE" ? "Google OAuth" : "Email & Password"}
              </div>
            </div>
          </div>

          {/* Core Metadata Rows */}
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
                  Active & Verified
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
          <div className="flex items-center gap-2">
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
