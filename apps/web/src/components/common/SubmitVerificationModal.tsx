import React from "react"
import {
  ShieldCheck,
  RotateCcw,
  Send,
  Loader2,
  CheckCircle2,
  Info,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ModalTemplate } from "./ModalTemplate"

export interface SubmitVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  isLoading?: boolean
  submissionCount?: number
  maxSubmissions?: number
  isRedo?: boolean
  qualifications?: string | null
  bio?: string | null
  expertise?: string[]
}

export const SubmitVerificationModal: React.FC<SubmitVerificationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  submissionCount = 0,
  maxSubmissions = 5,
  isRedo = false,
  qualifications,
  bio,
  expertise = [],
}) => {
  const nextAttempt = submissionCount + 1
  const remainingAttempts = Math.max(0, maxSubmissions - nextAttempt)

  const handleConfirm = async () => {
    if (isLoading) return
    await onConfirm()
  }

  const headerIcon = (
    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
      {isRedo ? <RotateCcw className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
    </div>
  )

  const footer = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
        className="text-xs rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer"
      >
        Cancel
      </Button>

      <Button
        type="button"
        onClick={handleConfirm}
        disabled={isLoading}
        className="text-xs rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Send className="w-3.5 h-3.5" />
        )}
        <span>{isRedo ? "Confirm & Re-submit" : "Confirm & Submit for Review"}</span>
      </Button>
    </>
  )

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title={isRedo ? "Re-submit for Verification" : "Submit for Instructor Verification"}
      description={
        isRedo
          ? "Submit your revised credentials for administrative review"
          : "Request instructor accreditation and course publishing access"
      }
      icon={headerIcon}
      maxWidth="md"
      closeOnOverlayClick={!isLoading}
      closeOnEsc={!isLoading}
      showCloseButton={!isLoading}
      footer={footer}
    >
      <div className="space-y-4 text-left">
        {/* Attempt Counter Banner */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#F42A18]" />
              Submission Attempt
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Attempt {nextAttempt} of {maxSubmissions}
            </span>
          </div>

          <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${(nextAttempt / maxSubmissions) * 100}%` }}
            />
          </div>

          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            {remainingAttempts > 0
              ? `You will have ${remainingAttempts} submission attempt${remainingAttempts > 1 ? "s" : ""} remaining if revision is requested.`
              : "This is your final submission attempt before requiring administrator intervention."}
          </p>
        </div>

        {/* Profile Summary Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Profile Readiness Summary
          </h4>

          <div className="space-y-2 text-xs">
            {/* Qualifications */}
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">Qualifications: </span>
                <span className="text-neutral-600 dark:text-neutral-400 truncate">
                  {qualifications?.trim() || "Provided"}
                </span>
              </div>
            </div>

            {/* Expertise */}
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  Domains of Expertise ({expertise.length}):
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {expertise.slice(0, 4).map((exp) => (
                    <Badge
                      key={exp}
                      variant="secondary"
                      className="text-[10px] py-0 px-2 bg-neutral-100 dark:bg-neutral-800"
                    >
                      {exp}
                    </Badge>
                  ))}
                  {expertise.length > 4 && (
                    <span className="text-[10px] text-neutral-500 font-medium">
                      +{expertise.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {bio && (
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">Biography: </span>
                  <span className="text-neutral-600 dark:text-neutral-400 line-clamp-1">
                    {bio}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notice Info Box */}
        <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
          <div className="space-y-1">
            <p className="font-semibold">Review Guidelines:</p>
            <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80 leading-relaxed">
              Once submitted, your status will become <strong>In Progress</strong>. Social media URLs cannot be edited while under review. When approved, your submission counter resets to 0.
            </p>
          </div>
        </div>
      </div>
    </ModalTemplate>
  )
}

export default SubmitVerificationModal
