import React, { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  STUDENT_VERIFY_OTP_CONFIG,
  TEACHER_VERIFY_OTP_CONFIG,
  type AuthFormConfig,
} from "../constants"
import {
  verifyOtpSchema,
  type VerifyOtpFormData,
} from "../schemas/auth.schema"
import type { AuthFormErrors } from "../types"
import { CheckCircle2, KeyRound, RotateCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface VerifyOtpProps {
  role?: "student" | "teacher"
  config?: AuthFormConfig
}

export const VerifyOtp: React.FC<VerifyOtpProps> = ({
  role = "student",
  config,
}) => {
  const [searchParams] = useSearchParams()
  const defaultEmail = searchParams.get("email") || ""

  const [submitted, setSubmitted] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [formData, setFormData] = useState<VerifyOtpFormData>({
    email: defaultEmail,
    otp: "",
  })
  const [errors, setErrors] = useState<AuthFormErrors<VerifyOtpFormData>>({})

  const formConfig =
    config ||
    (role === "teacher"
      ? TEACHER_VERIFY_OTP_CONFIG
      : STUDENT_VERIFY_OTP_CONFIG)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const result = verifyOtpSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: AuthFormErrors<VerifyOtpFormData> = {}
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof VerifyOtpFormData
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setSubmitted(true)
  }

  const handleResend = () => {
    if (countdown > 0 || resending) return
    setResending(true)
    setTimeout(() => {
      setResending(false)
      setCountdown(60)
    }, 800)
  }

  if (submitted) {
    return (
      <div className="text-center py-12 space-y-4 w-full max-w-sm mx-auto">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-[#F42A18]/10 text-[#F42A18]">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
          {formConfig.successTitle}
        </h3>
        <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
          {formConfig.successSubtitle}
        </p>
        <Link
          to={
            role === "teacher"
              ? "/teachers/dashboard"
              : "/students/dashboard"
          }
          className="inline-block px-7 py-3 rounded-xl bg-[#F42A18] text-white text-sm font-semibold hover:bg-[#d92211] transition-colors shadow-lg shadow-[#F42A18]/25"
        >
          {formConfig.successButtonText}
        </Link>
      </div>
    )
  }

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
          {formConfig.subtitle}
        </p>
      </div>

      {/* Seamless form directly on page without background box */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="verify-email"
              className="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            >
              {formConfig.emailLabel || "Email Address"}
            </Label>
            {errors.email && (
              <span className="text-xs font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                {errors.email}
              </span>
            )}
          </div>
          <Input
            id="verify-email"
            type="email"
            className={cn(
              "h-10 text-sm px-3.5 py-2 rounded-xl transition-colors",
              errors.email && "border-[#F42A18] focus-visible:ring-[#F42A18]/25"
            )}
            placeholder={formConfig.emailPlaceholder || "alex@example.com"}
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value })
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: undefined }))
              }
            }}
          />
        </div>

        {/* OTP Code */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="verify-otp"
              className="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            >
              {formConfig.otpLabel || "6-Digit OTP Code"}
            </Label>
            {errors.otp && (
              <span className="text-xs font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                {errors.otp}
              </span>
            )}
          </div>
          <Input
            id="verify-otp"
            type="text"
            maxLength={6}
            className={cn(
              "h-10 text-sm px-3.5 py-2 rounded-xl tracking-widest font-mono text-center transition-colors",
              errors.otp && "border-[#F42A18] focus-visible:ring-[#F42A18]/25"
            )}
            placeholder={formConfig.otpPlaceholder || "123456"}
            value={formData.otp}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "")
              setFormData({ ...formData, otp: val })
              if (errors.otp) {
                setErrors((prev) => ({ ...prev, otp: undefined }))
              }
            }}
          />
        </div>

        <button
          type="submit"
          className="w-full h-11 py-2.5 rounded-xl bg-[#F42A18] text-white text-sm font-semibold hover:bg-[#d92211] transition-all shadow-lg shadow-[#F42A18]/25 cursor-pointer flex items-center justify-center gap-2 mt-2"
        >
          <KeyRound className="w-4 h-4" />
          {formConfig.buttonText}
        </button>

        {/* Resend Option */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || resending}
            className={cn(
              "text-xs sm:text-sm inline-flex items-center gap-1.5 font-medium transition-colors cursor-pointer",
              countdown > 0 || resending
                ? "text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
                : "text-neutral-600 dark:text-neutral-400 hover:text-[#F42A18]"
            )}
          >
            <RotateCw
              className={cn(
                "w-3.5 h-3.5",
                resending && "animate-spin text-[#F42A18]"
              )}
            />
            {countdown > 0
              ? `Resend code in ${countdown}s`
              : resending
              ? "Sending code..."
              : "Resend Code"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default VerifyOtp
