import React from "react"
import { Link } from "react-router-dom"
import {
  STUDENT_FORGOT_PASSWORD_CONFIG,
  TEACHER_FORGOT_PASSWORD_CONFIG,
  type AuthFormConfig,
} from "../constants"
import { Mail, Send, AlertCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForgotPasswordForm } from "../hooks/useForgotPassword"
import { cn } from "@/lib/utils"

export interface ForgotPasswordProps {
  role?: "student" | "teacher"
  config?: AuthFormConfig
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  role = "student",
  config,
}) => {
  const { formData, errors, serverError, isPending, handleChange, handleSubmit } =
    useForgotPasswordForm(role)

  const formConfig =
    config ||
    (role === "teacher"
      ? TEACHER_FORGOT_PASSWORD_CONFIG
      : STUDENT_FORGOT_PASSWORD_CONFIG)

  return (
    <div className="space-y-6 w-full max-w-sm mx-auto">
      <div className="text-left space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-[#F42A18]" />
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

      {serverError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Seamless form directly on page without background box */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="forgot-email"
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
            id="forgot-email"
            type="email"
            disabled={isPending}
            className={cn(
              "h-10 text-sm px-3.5 py-2 rounded-xl transition-colors",
              errors.email && "border-[#F42A18] focus-visible:ring-[#F42A18]/25"
            )}
            placeholder={formConfig.emailPlaceholder || "alex@example.com"}
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-11 py-2.5 rounded-xl bg-[#F42A18] text-white text-sm font-semibold hover:bg-[#d92211] transition-all shadow-lg shadow-[#F42A18]/25 cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending Instructions...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{formConfig.buttonText}</span>
            </>
          )}
        </button>

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

export default ForgotPassword
