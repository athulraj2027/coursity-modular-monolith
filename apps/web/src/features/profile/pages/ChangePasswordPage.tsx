import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertCircle,
  Mail,
  User,
  ArrowLeft,
  Loader2,
  Sparkles,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/lib/toast"
import { useChangePassword, useProfile } from "../hooks/useProfile"
import { useCurrentUser } from "@/features/auth"

export interface ChangePasswordPageProps {
  role?: "student" | "teacher" | "admin"
}

export const ChangePasswordPage: React.FC<ChangePasswordPageProps> = ({ role = "student" }) => {
  const navigate = useNavigate()
  const { data: authUser } = useCurrentUser()
  const { data: profileData } = useProfile()
  const changePasswordMutation = useChangePassword()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Real-time password requirement tests
  const hasMinLength = newPassword.length >= 8
  const hasUppercase = /[A-Z]/.test(newPassword)
  const hasLowercase = /[a-z]/.test(newPassword)
  const hasNumber = /\d/.test(newPassword)
  const isMatching = newPassword.length > 0 && newPassword === confirmPassword
  const isFormValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && isMatching

  const profileUrl =
    role === "teacher"
      ? "/teachers/profile"
      : role === "admin"
      ? "/admin/profile"
      : "/students/profile"

  const displayRole =
    role === "admin" ? "ADMIN" : role === "teacher" ? "TEACHER" : "STUDENT"

  const userEmail = profileData?.email || authUser?.email || "your registered email"
  const userName = profileData?.name || authUser?.name || "User"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsSuccess(false)

    if (!newPassword) {
      setErrorMsg("Please enter a new password.")
      return
    }

    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber) {
      setErrorMsg("New password does not satisfy the security requirements.")
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirmation password do not match.")
      return
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: currentPassword || undefined,
        newPassword,
        confirmPassword,
      })

      setIsSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Your password has been changed successfully! A confirmation email has been dispatched.")
    } catch (err: unknown) {
      const errorObj = err as { message?: string; data?: { message?: string } }
      const msg = errorObj?.data?.message || errorObj?.message || (err instanceof Error ? err.message : "Failed to update password. Please verify your current password.")
      setErrorMsg(msg)
    }
  }

  const handleReset = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setErrorMsg(null)
    setIsSuccess(false)
  }

  const isGoogleAccount =
    profileData?.authProvider === "GOOGLE" || authUser?.authProvider === "GOOGLE"

  if (isGoogleAccount) {
    return (
      <div className="flex flex-1 flex-col w-full text-left space-y-8 max-w-4xl mx-auto pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Link
              to={profileUrl}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Profile</span>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  Password & Security
                </h1>
                <Badge
                  variant="secondary"
                  className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-semibold uppercase text-[11px] px-2.5 py-0.5 flex items-center gap-1"
                >
                  Google Account
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Security and authentication settings for your Coursity account.
              </p>
            </div>
          </div>
        </div>

        {/* Google SSO Notification Card */}
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-8 text-center space-y-6 max-w-xl mx-auto shadow-xs">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Google Single Sign-On Account
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
              Your account is authenticated and protected through <strong>Google Single Sign-On ({userEmail})</strong>. You do not have or require a local password for this account.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 text-left space-y-1.5">
            <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F42A18]" />
              How to manage your credentials:
            </span>
            <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              To update your password, two-factor authentication, or security keys, please manage your credentials directly in your Google Account security center.
            </p>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => navigate(profileUrl)}
              className="gap-2 rounded-xl text-xs font-semibold bg-[#F42A18] hover:bg-[#d92212] text-white cursor-pointer px-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Profile
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col w-full text-left space-y-8 max-w-4xl mx-auto pb-12">
      {/* 1. Header Banner & Back Link */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Link
            to={profileUrl}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Profile</span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Password & Security
              </h1>
              <Badge
                variant="secondary"
                className="bg-[#F42A18]/10 text-[#F42A18] border-[#F42A18]/20 font-semibold uppercase text-[11px] px-2.5 py-0.5"
              >
                {displayRole}
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Manage your credentials, update your account password, and review security settings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={profileUrl}
              className="px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              View Profile
            </Link>
          </div>
        </div>

        {/* 2. Unified Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-neutral-200/80 dark:border-neutral-800 -mt-2">
          <Link
            to={profileUrl}
            className="flex items-center gap-2 pb-3 text-sm font-semibold transition-all border-b-2 border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            <User className="w-4 h-4" />
            Profile Details
          </Link>
          <div className="flex items-center gap-2 pb-3 text-sm font-semibold transition-all border-b-2 border-[#F42A18] text-[#F42A18]">
            <KeyRound className="w-4 h-4" />
            Password & Security
          </div>
        </div>
      </div>

      {/* 3. Security Info Callout */}
      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 p-4.5 sm:p-5 flex items-start gap-4">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-[#F42A18]/10 text-[#F42A18] flex items-center justify-center">
          <Mail className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
            <span>Automated Security Notification</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Whenever your password is updated, Coursity immediately dispatches a security alert to{" "}
            <span className="font-semibold text-neutral-900 dark:text-white underline decoration-neutral-300 dark:decoration-neutral-700">
              {userEmail}
            </span>{" "}
            confirming the change. If you didn't initiate this request, you can secure your account immediately.
          </p>
        </div>
      </div>

      {/* 4. Success State Feedback */}
      {isSuccess && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 sm:p-5 text-emerald-700 dark:text-emerald-400 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">Password Successfully Updated</h4>
            <p className="text-xs leading-relaxed">
              Your password has been changed securely. A confirmation email has been dispatched to <strong>{userEmail}</strong>. You can now use your new password next time you sign in.
            </p>
          </div>
        </div>
      )}

      {/* 5. Error State Feedback */}
      {errorMsg && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 sm:p-5 text-red-700 dark:text-red-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">Failed to Change Password</h4>
            <p className="text-xs leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* 6. Form Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-6 sm:p-8 space-y-6 shadow-xs"
      >
        <div className="space-y-1 pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#F42A18]" />
            Change Your Password
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Please enter your current password followed by your desired new password.
          </p>
        </div>

        {/* Current Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="currentPassword" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Current Password <span className="text-neutral-400 font-normal">(Leave blank if signing in via social SSO only)</span>
            </Label>
          </div>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="pr-10 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 text-xs"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password Field */}
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            New Password <span className="text-[#F42A18]">*</span>
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="Create a strong new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pr-10 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 text-xs"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Confirm New Password <span className="text-[#F42A18]">*</span>
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pr-10 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 text-xs"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Live Password Requirements Checklist */}
        <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/40 p-4 border border-neutral-200/60 dark:border-neutral-800 space-y-2.5">
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#F42A18]" />
            Password Requirements:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              {hasMinLength ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              )}
              <span className={hasMinLength ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-neutral-500"}>
                At least 8 characters
              </span>
            </div>

            <div className="flex items-center gap-2">
              {hasUppercase ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              )}
              <span className={hasUppercase ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-neutral-500"}>
                At least 1 uppercase letter (A-Z)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {hasLowercase ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              )}
              <span className={hasLowercase ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-neutral-500"}>
                At least 1 lowercase letter (a-z)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {hasNumber ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              )}
              <span className={hasNumber ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-neutral-500"}>
                At least 1 number (0-9)
              </span>
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
              {isMatching ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              )}
              <span className={isMatching ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-neutral-500"}>
                Passwords match
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={changePasswordMutation.isPending}
            className="w-full sm:w-auto rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 cursor-pointer"
          >
            Clear Form
          </Button>
          <Button
            type="submit"
            disabled={changePasswordMutation.isPending || !isFormValid}
            className="w-full sm:w-auto gap-2 rounded-xl text-xs font-semibold bg-[#F42A18] hover:bg-[#d92212] text-white cursor-pointer shadow-md shadow-[#F42A18]/20 disabled:opacity-50"
          >
            {changePasswordMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-3.5 h-3.5" />
                <span>Save New Password</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ChangePasswordPage
