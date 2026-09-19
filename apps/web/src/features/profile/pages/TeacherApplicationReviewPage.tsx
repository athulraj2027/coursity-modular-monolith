import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Clock,
  RefreshCw,
  FileText,
  ShieldCheck,
  Award,
  CreditCard,
  ExternalLink,
  Eye,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ModalTemplate } from "@/components/common/ModalTemplate"
import { toast } from "@/lib/toast"
import { useProfile } from "../hooks/useProfile"
import { normalizeQualifications } from "../types/profile.types"

export const TeacherApplicationReviewPage: React.FC = () => {
  const navigate = useNavigate()
  const { data: profileData, refetch, isFetching } = useProfile()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const teacherProfile = profileData?.teacherProfile
  const approvalStatus = teacherProfile?.approvalStatus || (teacherProfile?.isApproved ? "VERIFIED" : "PENDING")
  const isInterviewPassed = Boolean(teacherProfile?.isInterviewPassed)

  // Redirect if status changes (e.g., approved by admin -> go to interview step; redo -> go back to edit)
  useEffect(() => {
    if (approvalStatus === "VERIFIED" && !isInterviewPassed) {
      toast.success("Congratulations! Your credentials have been verified.")
      navigate("/teachers/onboarding/interview", { replace: true })
    } else if (approvalStatus === "VERIFIED" && isInterviewPassed) {
      navigate("/teachers/dashboard", { replace: true })
    } else if (approvalStatus === "PENDING" || approvalStatus === "REDO") {
      navigate("/teachers/onboarding/profile", { replace: true })
    }
  }, [approvalStatus, isInterviewPassed, navigate])

  const handleRefresh = async () => {
    try {
      const res = await refetch()
      const newStatus = res.data?.teacherProfile?.approvalStatus
      if (newStatus === "VERIFIED") {
        toast.success("Application approved! You can now proceed to your AI Vetting assessment.")
      } else {
        toast.info("Status refreshed. Application is still under review.")
      }
    } catch {
      toast.error("Failed to refresh status")
    }
  }

  const qualList = normalizeQualifications(teacherProfile?.qualifications)
  const submissionCount = teacherProfile?.submissionCount ?? 1

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-4 py-4 my-auto space-y-6">
      {/* Status Icon */}
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 flex items-center justify-center text-neutral-800 dark:text-neutral-200 shadow-sm">
          <Clock className="w-8 h-8 text-[#F42A18]" />
        </div>
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F42A18] opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#F42A18]" />
        </span>
      </div>

      {/* Submission Status Pill */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        <span>Submission {submissionCount} of 5 • Status: Under Review</span>
      </div>

      {/* Heading & Subtitle */}
      <div className="space-y-2.5 max-w-xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Your Application is Under Admissions Review
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Thank you for submitting your instructor credentials. Our admissions team is currently reviewing your government identity document, academic degrees, and domain expertise.
        </p>
      </div>

      {/* Highlights - Direct on page, no medium card boxes */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
          <span>Review Window: <strong className="text-neutral-800 dark:text-neutral-200 font-medium">24–48 Hours</strong></span>
        </span>
        <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">•</span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Documents: <strong className="text-neutral-800 dark:text-neutral-200 font-medium">Encrypted & Queued</strong></span>
        </span>
        <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">•</span>
        <span className="flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
          <span>Next Step: <strong className="text-neutral-800 dark:text-neutral-200 font-medium">AI Vetting Assessment</strong></span>
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button
          onClick={handleRefresh}
          disabled={isFetching}
          className="gap-2 rounded-xl text-xs font-bold bg-[#F42A18] hover:bg-[#d92212] text-white shadow-md shadow-[#F42A18]/25 cursor-pointer px-6 py-2.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          <span>{isFetching ? "Checking Status..." : "Refresh Status"}</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => setIsPreviewOpen(true)}
          className="gap-2 rounded-xl text-xs font-semibold border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer px-5 py-2.5"
        >
          <FileText className="w-3.5 h-3.5 text-neutral-500" />
          <span>View Submitted Details</span>
        </Button>
      </div>

      {/* Submitted Details Modal Dialog (Keeps main page clean & non-scrollable) */}
      <ModalTemplate
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Submitted Application Summary"
        description="Read-only summary and document attachments currently under admissions review."
        icon={<FileText className="w-5 h-5 text-[#F42A18]" />}
        maxWidth="lg"
        footer={
          <Button
            variant="outline"
            onClick={() => setIsPreviewOpen(false)}
            className="text-xs rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer"
          >
            Close
          </Button>
        }
      >
        <div className="space-y-6 text-left">
          {/* Personal Information */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Profile Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-400">Full Name</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{profileData?.name}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-400">Email Address</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{profileData?.email}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-400">Country</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{profileData?.profile?.country || "—"}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-400">Phone</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{profileData?.profile?.phone || "—"}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800 sm:col-span-2">
                <span className="text-neutral-400">Teaching Experience</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{teacherProfile?.experienceYears ?? 0} years</span>
              </div>
            </div>
          </div>

          {/* Attached Documents with Live Previews */}
          <div className="space-y-3 pt-1">
            <span className="text-[11px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Submitted Document Previews
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Government ID / PAN Card Preview */}
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        Government ID / PAN
                      </h4>
                      {teacherProfile?.identityCard ? (
                        <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5 py-0 px-1.5">
                          Attached
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-neutral-400 py-0 px-1.5">
                          Missing
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Identity document
                    </p>
                  </div>
                </div>

                {teacherProfile?.identityCard ? (
                  <div className="space-y-2">
                    {!teacherProfile.identityCard.toLowerCase().includes(".pdf") ? (
                      <div className="relative group rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 h-28 flex items-center justify-center">
                        <img
                          src={teacherProfile.identityCard}
                          alt="Government ID"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <a
                          href={teacherProfile.identityCard}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white text-xs font-semibold transition-opacity duration-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Full Image</span>
                        </a>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between text-xs">
                        <span className="font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                          ID Document (PDF)
                        </span>
                        <a
                          href={teacherProfile.identityCard}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open</span>
                        </a>
                      </div>
                    )}

                    <a
                      href={teacherProfile.identityCard}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 hover:text-blue-600 py-1 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open ID Document</span>
                    </a>
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-400 italic">No document attached</p>
                )}
              </div>

              {/* Resume / CV Preview */}
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-[#F42A18] flex items-center justify-center shrink-0 border border-[#F42A18]/20">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        Curriculum Vitae / Resume
                      </h4>
                      {teacherProfile?.resume ? (
                        <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5 py-0 px-1.5">
                          Attached
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-neutral-400 py-0 px-1.5">
                          Missing
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Professional background
                    </p>
                  </div>
                </div>

                {teacherProfile?.resume ? (
                  <div className="space-y-2">
                    <div className="h-28 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 flex flex-col items-center justify-center gap-1.5 text-neutral-500 p-2">
                      <FileText className="w-7 h-7 text-[#F42A18]" />
                      <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Resume / CV Document</span>
                    </div>

                    <a
                      href={teacherProfile.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#F42A18] hover:underline py-1 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Preview Resume File</span>
                    </a>
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-400 italic">No resume attached</p>
                )}
              </div>
            </div>

            {/* Certificate Credentials Grid */}
            {teacherProfile?.credentials && teacherProfile.credentials.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-neutral-500" />
                  Academic & Professional Certificates ({teacherProfile.credentials.length})
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {teacherProfile.credentials.map((certUrl, idx) => {
                    const isPdf = certUrl.toLowerCase().includes(".pdf")
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 p-3 space-y-2 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                            Certificate #{idx + 1}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-neutral-400">
                            {isPdf ? "PDF" : "IMAGE"}
                          </span>
                        </div>

                        {!isPdf ? (
                          <div className="relative group rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 h-24 flex items-center justify-center">
                            <img
                              src={certUrl}
                              alt={`Certificate ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <a
                              href={certUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 text-white text-[11px] font-semibold transition-opacity duration-200"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </a>
                          </div>
                        ) : (
                          <div className="h-24 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex flex-col items-center justify-center gap-1 text-neutral-500 border border-neutral-200/80 dark:border-neutral-700/80">
                            <FileText className="w-6 h-6 text-neutral-400" />
                            <span className="text-[11px] font-medium">PDF Document</span>
                          </div>
                        )}

                        <a
                          href={certUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 hover:text-[#F42A18] py-1 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open Certificate</span>
                        </a>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Qualifications & Degrees */}
          {qualList.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Qualifications & Degrees ({qualList.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {qualList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-neutral-200/60 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-1 text-xs"
                  >
                    <div className="font-bold text-neutral-900 dark:text-white flex items-center justify-between">
                      <span>{item.title}</span>
                      <span className="text-[11px] text-neutral-400 font-medium">{item.year}</span>
                    </div>
                    {item.institution && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {item.institution}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Domain Expertise */}
          {teacherProfile?.expertise && teacherProfile.expertise.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Domain Expertise
              </span>
              <div className="flex flex-wrap gap-2">
                {teacherProfile.expertise.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-[#F42A18]/10 text-[#F42A18] border-[#F42A18]/20 text-xs px-2.5 py-0.5"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </ModalTemplate>
    </div>
  )
}

export default TeacherApplicationReviewPage
