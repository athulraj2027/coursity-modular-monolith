import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Clock,
  RefreshCw,
  FileText,
  ShieldCheck,
  Award,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ModalTemplate } from "@/components/common/ModalTemplate"
import { FileDocumentCard, FilePreviewModal } from "@/components/common/FileDocumentCard"
import { toast } from "@/lib/toast"
import { useProfile } from "../hooks/useProfile"
import { normalizeQualifications } from "../types/profile.types"

export const TeacherApplicationReviewPage: React.FC = () => {
  const navigate = useNavigate()
  const { data: profileData, refetch, isFetching } = useProfile()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [filePreview, setFilePreview] = useState<{
    isOpen: boolean
    title: string
    url: string
    type?: "pdf" | "image" | "document"
  }>({
    isOpen: false,
    title: "",
    url: "",
  })

  const handlePreviewFile = (url: string, title: string, type: "pdf" | "image" | "document") => {
    setFilePreview({
      isOpen: true,
      title,
      url,
      type,
    })
  }

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
          {(teacherProfile?.resume || teacherProfile?.identityCard || (teacherProfile?.credentials && teacherProfile.credentials.length > 0)) && (
            <div className="space-y-3 pt-1">
              <span className="text-[11px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Submitted Verification Documents & Credentials
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Government ID / PAN Card Preview */}
                {teacherProfile?.identityCard && (
                  <FileDocumentCard
                    title="Government ID / PAN Card"
                    url={teacherProfile.identityCard}
                    category="identity"
                    subtitle="Identity Document"
                    onPreview={handlePreviewFile}
                  />
                )}

                {/* Resume / CV Preview */}
                {teacherProfile?.resume && (
                  <FileDocumentCard
                    title="Curriculum Vitae / Resume"
                    url={teacherProfile.resume}
                    category="resume"
                    subtitle="Professional Background"
                    onPreview={handlePreviewFile}
                  />
                )}
              </div>

              {/* Certificate Credentials Grid */}
              {teacherProfile?.credentials && teacherProfile.credentials.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-neutral-500" />
                    Academic & Professional Certificates ({teacherProfile.credentials.length})
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {teacherProfile.credentials.map((certUrl, idx) => (
                      <FileDocumentCard
                        key={idx}
                        title={`Certificate #${idx + 1}`}
                        url={certUrl}
                        category="certificate"
                        subtitle="Accreditation Credential"
                        onPreview={handlePreviewFile}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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

      {/* Interactive File Preview Modal */}
      <FilePreviewModal
        isOpen={filePreview.isOpen}
        title={filePreview.title}
        url={filePreview.url}
        fileType={filePreview.type}
        onClose={() => setFilePreview((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}

export default TeacherApplicationReviewPage
