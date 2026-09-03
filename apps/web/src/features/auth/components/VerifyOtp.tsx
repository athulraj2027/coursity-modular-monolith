import React from "react"
import { Link } from "react-router-dom"
import {
  STUDENT_VERIFY_OTP_CONFIG,
  TEACHER_VERIFY_OTP_CONFIG,
  type AuthFormConfig,
} from "../constants"
import { KeyRound, RotateCw, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useVerifyOtpForm } from "../hooks/useVerifyOtp"
import { cn } from "@/lib/utils"

export interface VerifyOtpProps {
  role?: "student" | "teacher"
  config?: AuthFormConfig
}

export const VerifyOtp: React.FC<VerifyOtpProps> = ({
  role = "student",
  config,
}) => {
  const {
    email,
    otp,
    error,
    countdown,
    serverError,
    resendMessage,
    isVerifying,
    isResending,
    handleOtpChange,
    handleSubmit,
    handleResend,
  } = useVerifyOtpForm(role)

  const formConfig =
    config ||
    (role === "teacher"
      ? TEACHER_VERIFY_OTP_CONFIG
      : STUDENT_VERIFY_OTP_CONFIG)

  const signupHref = role === "teacher" ? "/teachers/signup" : "/signup"

  return (
    <div className="space-y-6 w-full max-w-sm mx-auto">
      <div className="text-left space-y-1.5">
        <div className="flex items-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-[#F42A18]" />
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
              Enter the 6-digit verification code sent to{" "}
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
                <Link to={signupHref} className="underline font-semibold hover:text-red-700">
                  Return to sign up
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
        {/* OTP Code */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="verify-otp"
              className="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            >
              {formConfig.otpLabel || "6-Digit OTP Code"}
            </Label>
            {error && (
              <span className="text-xs font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                {error}
              </span>
            )}
          </div>
          <Input
            id="verify-otp"
            type="text"
            maxLength={6}
            disabled={isVerifying}
            autoFocus
            className={cn(
              "h-11 text-base px-3.5 py-2 rounded-xl tracking-[0.35em] font-mono text-center transition-colors font-semibold",
              error && "border-[#F42A18] focus-visible:ring-[#F42A18]/25"
            )}
            placeholder={formConfig.otpPlaceholder || "••••••"}
            value={otp}
            onChange={(e) => handleOtpChange(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isVerifying || otp.length !== 6}
          className="w-full h-11 py-2.5 rounded-xl bg-[#F42A18] text-white text-sm font-semibold hover:bg-[#d92211] transition-all shadow-lg shadow-[#F42A18]/25 cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying & Signing in...</span>
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              <span>{formConfig.buttonText || "Verify Code"}</span>
            </>
          )}
        </button>

        {/* Resend Option & Change Email */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || isResending || isVerifying}
            className={cn(
              "text-xs sm:text-sm inline-flex items-center gap-1.5 font-medium transition-colors cursor-pointer",
              countdown > 0 || isResending || isVerifying
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
            to={signupHref}
            className="text-xs sm:text-sm text-neutral-500 hover:text-[#F42A18] transition-colors"
          >
            Change email
          </Link>
        </div>
      </form>
    </div>
  )
}

export default VerifyOtp
