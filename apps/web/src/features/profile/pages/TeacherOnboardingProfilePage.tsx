import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  User,
  GraduationCap,
  Save,
  RotateCcw,
  Briefcase,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Send,
  Award,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  ImageUploadInput,
  ResumeUploadInput,
  MultipleCertificatesUploadInput,
  IdentityCardUploadInput,
  CountrySelect,
  PhoneInputWithCountry,
  SubmitVerificationModal,
  SearchInput,
  QualificationsArrayInput,
  useConfirmDialog,
} from "@/components/common"
import { toast } from "@/lib/toast"
import { useUploadFile } from "@/features/dashboard/hooks/useUpload"
import { useProfile, useUpdateTeacherProfile, useSubmitTeacherVerification } from "../hooks/useProfile"
import { validateTeacherForm } from "../schemas/profile.schema"
import type { QualificationItem } from "../types/profile.types"
import { normalizeQualifications } from "../types/profile.types"

const POPULAR_SUGGESTIONS = [
  "Web Development",
  "Backend Development",
  "Frontend Development",
  "Cloud Computing",
  "Distributed Systems",
  "System Design",
  "Machine Learning",
  "Artificial Intelligence",
  "Python",
  "Rust",
  "PostgreSQL",
  "Cybersecurity",
  "UI/UX Design",
]

interface TeacherFormData {
  name: string
  avatar: string
  phone: string
  country: string
  qualifications: QualificationItem[]
  experienceYears: number
  bio: string
  resume: string
  credentials: string[]
  identityCard: string
  linkedinUrl: string
  twitterUrl: string
  websiteUrl: string
  expertise: string[]
}

export const TeacherOnboardingProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { data: profileData, isLoading, isError, error, refetch } = useProfile()
  const updateMutation = useUpdateTeacherProfile()
  const submitVerificationMutation = useSubmitTeacherVerification()
  const { uploadFile } = useUploadFile()
  const { confirm, ConfirmDialog } = useConfirmDialog()

  const [formData, setFormData] = useState<TeacherFormData>({
    name: "",
    avatar: "",
    phone: "",
    country: "",
    qualifications: [],
    experienceYears: 0,
    bio: "",
    resume: "",
    credentials: [],
    identityCard: "",
    linkedinUrl: "",
    twitterUrl: "",
    websiteUrl: "",
    expertise: [],
  })

  // Staged files held locally in browser memory until Save Draft / Submit is clicked
  const [stagedFiles, setStagedFiles] = useState<{
    avatar: File | null
    identityCard: File | null
    resume: File | null
    credentials: Array<{ file: File; previewUrl: string; name: string }>
  }>({
    avatar: null,
    identityCard: null,
    resume: null,
    credentials: [],
  })
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof TeacherFormData, string>>>({})
  const [expertiseSearch, setExpertiseSearch] = useState("")
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const teacherProfile = profileData?.teacherProfile
  const approvalStatus = teacherProfile?.approvalStatus || (teacherProfile?.isApproved ? "VERIFIED" : "PENDING")
  const submissionCount = teacherProfile?.submissionCount ?? 0
  const maxAttempts = 5

  // Redirect if already in review or verified
  useEffect(() => {
    if (approvalStatus === "IN_PROGRESS") {
      navigate("/teachers/onboarding/review", { replace: true })
    } else if (approvalStatus === "VERIFIED" && !teacherProfile?.isInterviewPassed) {
      navigate("/teachers/onboarding/interview", { replace: true })
    } else if (approvalStatus === "VERIFIED" && teacherProfile?.isInterviewPassed) {
      navigate("/teachers/dashboard", { replace: true })
    }
  }, [approvalStatus, teacherProfile?.isInterviewPassed, navigate])

  // Populate initial values
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        avatar: profileData.profile?.avatar || "",
        phone: profileData.profile?.phone || "",
        country: profileData.profile?.country || "",
        qualifications: normalizeQualifications(teacherProfile?.qualifications),
        experienceYears: teacherProfile?.experienceYears || 0,
        bio: profileData.profile?.bio || "",
        resume: teacherProfile?.resume || "",
        credentials: teacherProfile?.credentials || [],
        identityCard: teacherProfile?.identityCard || "",
        linkedinUrl: teacherProfile?.linkedinUrl || "",
        twitterUrl: teacherProfile?.twitterUrl || "",
        websiteUrl: teacherProfile?.websiteUrl || "",
        expertise: teacherProfile?.expertise || [],
      })
      setFieldErrors({})
    }
  }, [profileData, teacherProfile])

  const handleInputChange = <K extends keyof TeacherFormData>(field: K, value: TeacherFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleAddExpertise = (tag: string) => {
    const trimmed = tag.trim()
    if (!trimmed) return
    if (formData.expertise.includes(trimmed)) return
    if (formData.expertise.length >= 10) {
      toast.error("Maximum 10 expertise tags allowed")
      return
    }
    handleInputChange("expertise", [...formData.expertise, trimmed])
    setExpertiseSearch("")
  }

  const handleRemoveExpertise = (tag: string) => {
    handleInputChange(
      "expertise",
      formData.expertise.filter((t) => t !== tag)
    )
  }

  const uploadPendingFiles = async () => {
    let avatarUrl = formData.avatar
    let identityCardUrl = formData.identityCard
    let resumeUrl = formData.resume
    let credentialsUrls = [...formData.credentials]

    // 1. Upload avatar if a new local file was selected
    if (stagedFiles.avatar) {
      const res = await uploadFile({
        file: stagedFiles.avatar,
        options: { folder: "avatars", maxDimension: 800, quality: 0.88 },
      })
      if (res) avatarUrl = res
    }

    // 2. Upload identity card if a new local file was selected
    if (stagedFiles.identityCard) {
      const res = await uploadFile({
        file: stagedFiles.identityCard,
        options: { folder: "identity" },
      })
      if (res) identityCardUrl = res
    }

    // 3. Upload resume if a new local file was selected
    if (stagedFiles.resume) {
      const res = await uploadFile({
        file: stagedFiles.resume,
        options: { folder: "documents" },
      })
      if (res) resumeUrl = res
    }

    // 4. Upload certificates if new local files were selected
    if (stagedFiles.credentials.length > 0) {
      const uploadedCerts: string[] = []
      for (const item of stagedFiles.credentials) {
        const res = await uploadFile({
          file: item.file,
          options: { folder: "certificates" },
        })
        if (res) {
          uploadedCerts.push(res)
        }
      }
      credentialsUrls = [
        ...credentialsUrls.filter((url) => !url.startsWith("blob:")),
        ...uploadedCerts,
      ]
    }

    return {
      avatarUrl: avatarUrl?.startsWith("blob:") ? null : avatarUrl || null,
      identityCardUrl: identityCardUrl?.startsWith("blob:") ? null : identityCardUrl || null,
      resumeUrl: resumeUrl?.startsWith("blob:") ? null : resumeUrl || null,
      credentialsUrls: credentialsUrls.filter((url) => !url.startsWith("blob:")),
    }
  }

  const handleSaveDraft = async () => {
    try {
      setIsUploadingFiles(true)
      const uploaded = await uploadPendingFiles()

      await updateMutation.mutateAsync({
        name: formData.name.trim(),
        avatar: uploaded.avatarUrl,
        phone: formData.phone ? formData.phone.trim() : null,
        country: formData.country.trim(),
        qualifications: formData.qualifications,
        experienceYears: formData.experienceYears,
        bio: formData.bio ? formData.bio.trim() : null,
        resume: uploaded.resumeUrl,
        credentials: uploaded.credentialsUrls,
        identityCard: uploaded.identityCardUrl,
        linkedinUrl: formData.linkedinUrl ? formData.linkedinUrl.trim() : null,
        twitterUrl: formData.twitterUrl ? formData.twitterUrl.trim() : null,
        websiteUrl: formData.websiteUrl ? formData.websiteUrl.trim() : null,
        expertise: formData.expertise,
      })

      setFormData((prev) => ({
        ...prev,
        avatar: uploaded.avatarUrl || "",
        identityCard: uploaded.identityCardUrl || "",
        resume: uploaded.resumeUrl || "",
        credentials: uploaded.credentialsUrls,
      }))
      setStagedFiles({ avatar: null, identityCard: null, resume: null, credentials: [] })
      toast.success("Profile progress saved as draft")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile progress")
    } finally {
      setIsUploadingFiles(false)
    }
  }

  const handleOpenSubmitModal = (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateTeacherForm(formData)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      const firstMessage = Object.values(errors)[0]
      if (firstMessage) toast.error(firstMessage)
      return
    }

    setFieldErrors({})
    setIsSubmitModalOpen(true)
  }

  const handleConfirmSubmitVerification = async () => {
    try {
      setIsUploadingFiles(true)
      const uploaded = await uploadPendingFiles()

      // 1. Save latest changes with permanent S3 URLs
      await updateMutation.mutateAsync({
        name: formData.name.trim(),
        avatar: uploaded.avatarUrl,
        phone: formData.phone ? formData.phone.trim() : null,
        country: formData.country.trim(),
        qualifications: formData.qualifications,
        experienceYears: formData.experienceYears,
        bio: formData.bio ? formData.bio.trim() : null,
        resume: uploaded.resumeUrl,
        credentials: uploaded.credentialsUrls,
        identityCard: uploaded.identityCardUrl,
        linkedinUrl: formData.linkedinUrl ? formData.linkedinUrl.trim() : null,
        twitterUrl: formData.twitterUrl ? formData.twitterUrl.trim() : null,
        websiteUrl: formData.websiteUrl ? formData.websiteUrl.trim() : null,
        expertise: formData.expertise,
      })

      setStagedFiles({ avatar: null, identityCard: null, resume: null, credentials: [] })

      // 2. Submit verification
      await submitVerificationMutation.mutateAsync()
      setIsSubmitModalOpen(false)
      navigate("/teachers/onboarding/review")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit verification")
    } finally {
      setIsUploadingFiles(false)
    }
  }

  const handleResetForm = async () => {
    if (profileData) {
      const confirmed = await confirm({
        actionType: "discard",
        title: "Discard Unsaved Changes?",
        description: "Are you sure you want to revert all changes back to your saved profile?",
      })
      if (!confirmed) return

      setStagedFiles({ avatar: null, identityCard: null, resume: null, credentials: [] })

      setFormData({
        name: profileData.name || "",
        avatar: profileData.profile?.avatar || "",
        phone: profileData.profile?.phone || "",
        country: profileData.profile?.country || "",
        qualifications: normalizeQualifications(teacherProfile?.qualifications),
        experienceYears: teacherProfile?.experienceYears || 0,
        bio: profileData.profile?.bio || "",
        resume: teacherProfile?.resume || "",
        credentials: teacherProfile?.credentials || [],
        identityCard: teacherProfile?.identityCard || "",
        linkedinUrl: teacherProfile?.linkedinUrl || "",
        twitterUrl: teacherProfile?.twitterUrl || "",
        websiteUrl: teacherProfile?.websiteUrl || "",
        expertise: teacherProfile?.expertise || [],
      })
      setFieldErrors({})
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#F42A18]" />
        <p className="text-xs font-medium text-neutral-500">Loading your onboarding profile...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-6 text-center space-y-4 max-w-md mx-auto">
        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">Unable to Load Onboarding Profile</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            {error instanceof Error ? error.message : "An unexpected error occurred while fetching your account details."}
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="gap-2 rounded-xl text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </Button>
      </div>
    )
  }

  const isRedo = approvalStatus === "REDO"

  return (
    <div className="flex flex-1 flex-col w-full text-left space-y-8 pb-16">
      {/* Onboarding Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 sm:p-8 shadow-xs">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#F42A18]/10 blur-3xl"
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-[#F42A18]/10 text-[#F42A18] border border-[#F42A18]/20">
              Step 1 of 4: Instructor Profile & Credentials
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Complete Your Instructor Profile
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Welcome to Coursity! Please provide your academic qualifications, upload verification documents (Identity Card and Certificates), and highlight your expertise. Our admissions team will review your application within 24-48 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Rejection / Redo Banner (if applicable) */}
      {isRedo && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-2 text-amber-900 dark:text-amber-200 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Application Revision Requested (Submission {submissionCount}/{maxAttempts})</span>
            </div>
            <Badge variant="outline" className="text-[11px] border-amber-500/40 text-amber-600 dark:text-amber-400">
              Action Required
            </Badge>
          </div>
          <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
            {teacherProfile?.rejectionReason || "Admissions requested updates to your profile credentials or verification documents."}
          </p>
          <div className="text-[11px] text-amber-700/80 dark:text-amber-400/80 font-medium pt-1">
            Please make the requested modifications below and resubmit your application.
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleOpenSubmitModal} noValidate className="space-y-8">
        {/* Section 1: Basic Identity & Contact */}
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <User className="w-4 h-4 text-[#F42A18]" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Personal Information & Avatar
            </h2>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Profile Photo <span className="text-[#F42A18]">*</span>
            </Label>
            <ImageUploadInput
              id="onboardingAvatar"
              label="Profile Photo"
              value={formData.avatar}
              onChange={(url) => handleInputChange("avatar", url)}
              onFileSelect={(file) => setStagedFiles((prev) => ({ ...prev, avatar: file }))}
              fallbackName={formData.name || profileData?.name}
              inputRef={fileInputRef}
            />
            {fieldErrors.avatar && (
              <span className="text-[11px] font-medium text-[#F42A18] block mt-1">
                {fieldErrors.avatar}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="teacherName" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Full Name <span className="text-[#F42A18]">*</span>
                </Label>
                {fieldErrors.name && (
                  <span className="text-[11px] font-medium text-[#F42A18]">
                    {fieldErrors.name}
                  </span>
                )}
              </div>
              <Input
                id="teacherName"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ada Lovelace"
                className={`rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800/50 ${fieldErrors.name ? "border-[#F42A18] focus-visible:ring-[#F42A18]/25" : ""
                  }`}
                required
              />
            </div>

            {/* Country Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="teacherCountry" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Country <span className="text-[#F42A18]">*</span>
                </Label>
                {fieldErrors.country && (
                  <span className="text-[11px] font-medium text-[#F42A18]">
                    {fieldErrors.country}
                  </span>
                )}
              </div>
              <CountrySelect
                id="teacherCountry"
                value={formData.country}
                onChange={(countryName) => handleInputChange("country", countryName)}
                error={Boolean(fieldErrors.country)}
                placeholder="Select country"
              />
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="teacherPhone" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Phone Number <span className="text-[#F42A18]">*</span>
                </Label>
                {fieldErrors.phone && (
                  <span className="text-[11px] font-medium text-[#F42A18]">
                    {fieldErrors.phone}
                  </span>
                )}
              </div>
              <PhoneInputWithCountry
                id="teacherPhone"
                value={formData.phone}
                country={formData.country}
                onChange={(val) => handleInputChange("phone", val)}
                onCountryChange={(countryName) => handleInputChange("country", countryName)}
                error={Boolean(fieldErrors.phone)}
                placeholder="555 000 0000"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Qualifications & Academic Degrees / Experience */}
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <GraduationCap className="w-4 h-4 text-[#F42A18]" />
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Qualifications & Academic Degrees / Job Experience
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Add each university degree, certification, or senior software engineering role.
              </p>
            </div>
          </div>

          <QualificationsArrayInput
            value={formData.qualifications}
            onChange={(items) => handleInputChange("qualifications", items)}
            error={fieldErrors.qualifications}
            maxItems={20}
          />
        </div>

        {/* Section 3: Verification Documents Upload */}
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <Award className="w-4 h-4 text-[#F42A18]" />
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Verification Documents & Credentials
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                These documents are encrypted and only accessible to Coursity Admissions for verification.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Identity Card */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Government ID / PAN Card <span className="text-[#F42A18]">*</span>
                </Label>
                {fieldErrors.identityCard && (
                  <span className="text-[11px] font-medium text-[#F42A18]">
                    {fieldErrors.identityCard}
                  </span>
                )}
              </div>
              <IdentityCardUploadInput
                id="onboardingIdCard"
                value={formData.identityCard}
                onChange={(url) => handleInputChange("identityCard", url)}
                onFileSelect={(file) => setStagedFiles((prev) => ({ ...prev, identityCard: file }))}
              />
            </div>

            {/* Certificates Multi-upload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Certificates & Credentials <span className="text-[#F42A18]">*</span>
                </Label>
                {fieldErrors.credentials && (
                  <span className="text-[11px] font-medium text-[#F42A18]">
                    {fieldErrors.credentials}
                  </span>
                )}
              </div>
              <MultipleCertificatesUploadInput
                id="onboardingCertificates"
                values={formData.credentials}
                onChange={(urls) => {
                  handleInputChange("credentials", urls)
                  setStagedFiles((prev) => ({
                    ...prev,
                    credentials: prev.credentials.filter((item) => urls.includes(item.previewUrl)),
                  }))
                }}
                onFilesSelect={(staged) => {
                  setStagedFiles((prev) => ({
                    ...prev,
                    credentials: [...prev.credentials, ...staged],
                  }))
                }}
                maxCount={10}
              />
            </div>

            {/* Resume / CV */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Curriculum Vitae / Resume <span className="text-[#F42A18]">*</span>
                </Label>
                {fieldErrors.resume && (
                  <span className="text-[11px] font-medium text-[#F42A18]">
                    {fieldErrors.resume}
                  </span>
                )}
              </div>
              <ResumeUploadInput
                id="onboardingResume"
                value={formData.resume}
                onChange={(url) => handleInputChange("resume", url)}
                onFileSelect={(file) => setStagedFiles((prev) => ({ ...prev, resume: file }))}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Professional Overview & Expertise */}
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <Briefcase className="w-4 h-4 text-[#F42A18]" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Professional Bio & Subject Domain Expertise
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Experience Years */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="onboardingExpYears" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Years of Professional Experience <span className="text-[#F42A18]">*</span>
                </Label>
                {fieldErrors.experienceYears && (
                  <span className="text-[11px] font-medium text-[#F42A18]">
                    {fieldErrors.experienceYears}
                  </span>
                )}
              </div>
              <Input
                id="onboardingExpYears"
                type="number"
                min="0"
                max="60"
                value={formData.experienceYears}
                onChange={(e) => handleInputChange("experienceYears", parseInt(e.target.value) || 0)}
                className={`rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800/50 ${fieldErrors.experienceYears ? "border-[#F42A18] focus-visible:ring-[#F42A18]/25" : ""
                  }`}
                required
              />
            </div>

            {/* Social Links (Optional) */}
            <div className="space-y-1.5">
              <Label htmlFor="onboardingLinkedin" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                LinkedIn Profile URL
              </Label>
              <Input
                id="onboardingLinkedin"
                value={formData.linkedinUrl}
                onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800/50"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="onboardingBio" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Instructor Biography & Teaching Philosophy <span className="text-[#F42A18]">*</span>
              </Label>
              {fieldErrors.bio && (
                <span className="text-[11px] font-medium text-[#F42A18]">
                  {fieldErrors.bio}
                </span>
              )}
            </div>
            <textarea
              id="onboardingBio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Describe your engineering background, systems you have built, and what you aim to teach on Coursity..."
              rows={4}
              className={`w-full rounded-xl text-xs p-3.5 bg-neutral-50 dark:bg-neutral-800/50 border ${fieldErrors.bio
                  ? "border-[#F42A18] focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
                  : "border-neutral-200 dark:border-neutral-700 focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
                } focus:outline-none focus:ring-2`}
            />
          </div>

          {/* Domain Expertise */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Domain Expertise & Topics <span className="text-[#F42A18]">*</span>
              </Label>
              {fieldErrors.expertise && (
                <span className="text-[11px] font-medium text-[#F42A18]">
                  {fieldErrors.expertise}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.expertise.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#F42A18]/10 text-[#F42A18] border border-[#F42A18]/20"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveExpertise(tag)}
                    className="hover:text-red-700 cursor-pointer font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="space-y-2">
              <SearchInput
                id="onboardingExpertiseInput"
                value={expertiseSearch}
                onChange={setExpertiseSearch}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddExpertise(expertiseSearch)
                  }
                }}
                placeholder="Type a subject or topic and press Enter..."
              />

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-neutral-400 font-medium">Suggested:</span>
                {POPULAR_SUGGESTIONS.filter((s) => !formData.expertise.includes(s))
                  .slice(0, 6)
                  .map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddExpertise(s)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-[#F42A18]/10 hover:text-[#F42A18] transition-colors cursor-pointer"
                    >
                      + {s}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleResetForm}
            disabled={isUploadingFiles || updateMutation.isPending || submitVerificationMutation.isPending}
            className="gap-2 rounded-xl text-xs font-semibold cursor-pointer border-neutral-300 dark:border-neutral-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Changes
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isUploadingFiles || updateMutation.isPending || submitVerificationMutation.isPending}
              className="gap-2 rounded-xl text-xs font-semibold border-neutral-300 dark:border-neutral-700 cursor-pointer"
            >
              {isUploadingFiles || updateMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {isUploadingFiles ? "Uploading Files..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Draft
                </>
              )}
            </Button>

            <Button
              type="submit"
              disabled={isUploadingFiles || updateMutation.isPending || submitVerificationMutation.isPending}
              className="gap-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#F42A18] to-rose-600 hover:from-[#d92212] hover:to-rose-700 text-white shadow-md shadow-[#F42A18]/25 cursor-pointer px-6 py-2.5"
            >
              {isUploadingFiles || submitVerificationMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {isUploadingFiles ? "Uploading Files..." : "Processing Submission..."}
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Submit Application for Verification
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Submit Verification Confirmation Modal */}
      <SubmitVerificationModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleConfirmSubmitVerification}
        isLoading={isUploadingFiles || submitVerificationMutation.isPending || updateMutation.isPending}
        submissionCount={submissionCount}
        maxSubmissions={maxAttempts}
        isRedo={isRedo}
        qualifications={formData.qualifications}
        bio={formData.bio}
        expertise={formData.expertise}
      />

      {/* Discard Confirmation Dialog */}
      <ConfirmDialog />
    </div>
  )
}

export default TeacherOnboardingProfilePage
