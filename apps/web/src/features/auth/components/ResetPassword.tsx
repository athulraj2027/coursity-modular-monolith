import React from "react"
import { Link } from "react-router-dom"
import {
  STUDENT_RESET_PASSWORD_CONFIG,
  TEACHER_RESET_PASSWORD_CONFIG,
  type AuthFormConfig,
} from "../constants"
import { Lock, ShieldCheck, AlertCircle, CheckCircle2, Loader2, RotateCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useResetPasswordForm } from "../hooks/useResetPassword"
import { cn } from "@/lib/utils"

export interface ResetPasswordProps {
  role?: "student" | "teacher"
  config?: AuthFormConfig
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({
  role = "student",
  config,
}) => {
  const {
    email,
    formData,
    errors,
    countdown,
    serverError,
    resendMessage,
    isPending,
    isResending,
    handleChange,
    handleSubmit,
    handleResend,
  } = useResetPasswordForm(role)

  const formConfig =
    config ||
    (role === "teacher"
      ? TEACHER_RESET_PASSWORD_CONFIG
      : STUDENT_RESET_PASSWORD_CONFIG)

  const forgotPasswordHref =
    role === "teacher" ? "/teachers/forgot-password" : "/forgot-password"

  return (
    <div className="space-y-6 w-full max-w-sm mx-auto">
      <div className="text-left space-y-1.5">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#F42A18]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#F42A18]">
            {formConfig.tagline}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {formConfig.title}
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {email ? (
            <>
              Enter the 6-digit recovery OTP and new password for{" "}
              <span className="font-semibold text-neutral-900 dark:text-white">{email}</span>.
            </>
          ) : (
            formConfig.subtitle
          )}
        </p>
      </div>

      {serverError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span>{serverError}</span>
            {!email && (
              <div>
                <Link to={forgotPasswordHref} className="underline font-semibold hover:text-red-700">
                  Request password reset
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {resendMessage && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{resendMessage}</span>
        </div>
      )}

      {/* Seamless form directly on page without background box */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* 6-Digit OTP */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="reset-otp"
              className="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            >
              {formConfig.otpLabel || "6-Digit Recovery OTP"}
            </Label>
            {errors.otp && (
              <span className="text-xs font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                {errors.otp}
              </span>
            )}
          </div>
          <Input
            id="reset-otp"
            type="text"
            maxLength={6}
            disabled={isPending}
            autoFocus
            className={cn(
              "h-11 text-base px-3.5 py-2 rounded-xl tracking-[0.35em] font-mono text-center transition-colors font-semibold",
              errors.otp && "border-[#F42A18] focus-visible:ring-[#F42A18]/25"
            )}
            placeholder={formConfig.otpPlaceholder || "••••••"}
            value={formData.otp}
            onChange={(e) => handleChange("otp", e.target.value)}
          />
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="reset-new-password"
              className="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            >
              {formConfig.newPasswordLabel || "New Password"}
            </Label>
            {errors.newPassword && (
              <span className="text-xs font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                {errors.newPassword}
              </span>
            )}
          </div>
          <Input
            id="reset-new-password"
            type="password"
            disabled={isPending}
            className={cn(
              "h-10 text-sm px-3.5 py-2 rounded-xl transition-colors",
              errors.newPassword && "border-[#F42A18] focus-visible:ring-[#F42A18]/25"
            )}
            placeholder={formConfig.newPasswordPlaceholder || "••••••••"}
            value={formData.newPassword}
            onChange={(e) => handleChange("newPassword", e.target.value)}
          />
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="reset-confirm-password"
              className="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            >
              {formConfig.confirmPasswordLabel || "Confirm New Password"}
            </Label>
            {errors.confirmPassword && (
              <span className="text-xs font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                {errors.confirmPassword}
              </span>
            )}
          </div>
          <Input
            id="reset-confirm-password"
            type="password"
            disabled={isPending}
            className={cn(
              "h-10 text-sm px-3.5 py-2 rounded-xl transition-colors",
              errors.confirmPassword && "border-[#F42A18] focus-visible:ring-[#F42A18]/25"
            )}
            placeholder={formConfig.confirmPasswordPlaceholder || "••••••••"}
            value={formData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isPending || formData.otp.length !== 6}
          className="w-full h-11 py-2.5 rounded-xl bg-[#F42A18] text-white text-sm font-semibold hover:bg-[#d92211] transition-all shadow-lg shadow-[#F42A18]/25 cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Resetting Password...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>{formConfig.buttonText}</span>
            </>
          )}
        </button>

        {/* Resend Option & Change Email */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || isResending || isPending}
            className={cn(
              "text-xs sm:text-sm inline-flex items-center gap-1.5 font-medium transition-colors cursor-pointer",
              countdown > 0 || isResending || isPending
                ? "text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
                : "text-neutral-600 dark:text-neutral-400 hover:text-[#F42A18]"
            )}
          >
            <RotateCw
              className={cn(
                "w-3.5 h-3.5",
                isResending && "animate-spin text-[#F42A18]"
              )}
            />
            {countdown > 0
              ? `Resend in ${countdown}s`
              : isResending
                ? "Sending code..."
                : "Resend Code"}
          </button>

          <Link
            to={forgotPasswordHref}
            className="text-xs sm:text-sm text-neutral-500 hover:text-[#F42A18] transition-colors"
          >
            Change email
          </Link>
        </div>

        {formConfig.signinPrompt && formConfig.signinHref && (
          <p className="text-center text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 pt-1">
            {formConfig.signinPrompt}{" "}
            <Link
              to={formConfig.signinHref}
              className="text-[#F42A18] font-semibold hover:underline"
            >
              {formConfig.signinLinkText}
            </Link>
          </p>
        )}
      </form>
    </div>
  )
}

export default ResetPassword
