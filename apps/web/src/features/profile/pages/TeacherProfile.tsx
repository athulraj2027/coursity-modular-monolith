import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  CheckCircle2,
  Edit3,
  Camera,
  Plus,
  X,
  Save,
  RotateCcw,
  ExternalLink,
  Code2,
  Globe,
  Briefcase,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  RefreshCw,
  Calendar,
  Lock,
  Check,
  Sparkles,
  UserX,
  MessageSquare,
  AlertTriangle,
  Send,
  FileText,
  KeyRound,
  CreditCard,
  Award,
  Building2,
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
  LoadingScreen,
  SubmitVerificationModal,
  SearchInput,
  QualificationsArrayInput,
  useConfirmDialog,
  FileDocumentCard,
  FilePreviewModal,
} from "@/components/common"
import { toast } from "@/lib/toast"
import { useUploadFile } from "@/features/dashboard/hooks/useUpload"
import { useProfile, useUpdateTeacherProfile, useSubmitTeacherVerification } from "../hooks/useProfile"
import { EXPERTISE_CATEGORIES } from "../constants/expertise.constants"
import { validateTeacherForm } from "../schemas/profile.schema"
import type { ApprovalStatus, QualificationItem } from "../types/profile.types"
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

export const TeacherProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "edit">("overview")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { data: profileData, isLoading, isError, error, refetch } = useProfile()
  const updateMutation = useUpdateTeacherProfile()
  const submitMutation = useSubmitTeacherVerification()
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

  // Staged files held locally in browser memory until Save Changes / Submit is clicked
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("all")
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
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

  const navigate = useNavigate()

  // Sync form state when backend profile data is loaded or updated
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        avatar: profileData.profile?.avatar || "",
        phone: profileData.profile?.phone || "",
        country: profileData.profile?.country || "",
        bio: profileData.profile?.bio || "",
        qualifications: normalizeQualifications(profileData.teacherProfile?.qualifications),
        experienceYears: profileData.teacherProfile?.experienceYears ?? 0,
        resume: profileData.teacherProfile?.resume || "",
        credentials: profileData.teacherProfile?.credentials || [],
        identityCard: profileData.teacherProfile?.identityCard || "",
        linkedinUrl: profileData.teacherProfile?.linkedinUrl || "",
        twitterUrl: profileData.teacherProfile?.twitterUrl || "",
        websiteUrl: profileData.teacherProfile?.websiteUrl || "",
        expertise: profileData.teacherProfile?.expertise || [],
      })
      setFieldErrors({})
    }
  }, [profileData])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

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

  const handleToggleExpertise = (tag: string) => {
    if (formData.expertise.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        expertise: prev.expertise.filter((t) => t !== tag),
      }))
    } else {
      if (formData.expertise.length >= 15) {
        toast.error("You can select at most 15 domains of expertise")
        return
      }
      setFormData((prev) => ({
        ...prev,
        expertise: [...prev.expertise, tag],
      }))
    }
    if (fieldErrors.expertise) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next.expertise
        return next
      })
    }
  }

  const handleRemoveExpertise = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.filter((t) => t !== tagToRemove),
    }))
  }

  const filteredCategories = EXPERTISE_CATEGORIES.map((cat) => {
    if (selectedCategoryTab !== "all" && cat.id !== selectedCategoryTab) {
      return null
    }
    const matchingTags = cat.tags.filter((tag) =>
      tag.toLowerCase().includes(expertiseSearch.toLowerCase().trim())
    )
    if (matchingTags.length === 0) return null
    return {
      ...cat,
      tags: matchingTags,
    }
  }).filter(Boolean) as typeof EXPERTISE_CATEGORIES

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

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()

    const clientErrors = validateTeacherForm(formData)
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      const firstError = Object.values(clientErrors)[0]
      if (firstError) {
        toast.error(firstError)
      }
      return
    }

    setFieldErrors({})

    const isSocialLocked =
      currentApprovalStatus === "IN_PROGRESS" ||
      currentApprovalStatus === "VERIFIED" ||
      Boolean(teacherProfile?.isApproved)

    const normalizeUrl = (url?: string | null) => {
      if (!url) return null
      const trimmed = url.trim()
      if (!trimmed) return null
      if (trimmed.startsWith("/") || trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
        return trimmed
      }
      return `https://${trimmed}`
    }

    try {
      setIsUploadingFiles(true)
      const uploaded = await uploadPendingFiles()

      await updateMutation.mutateAsync({
        name: formData.name.trim(),
        avatar: uploaded.avatarUrl,
        phone: formData.phone ? formData.phone.trim() : null,
        country: formData.country.trim(),
        bio: formData.bio ? formData.bio.trim() : null,
        qualifications: formData.qualifications,
        experienceYears: Number(formData.experienceYears) || 0,
        resume: uploaded.resumeUrl,
        credentials: uploaded.credentialsUrls,
        identityCard: uploaded.identityCardUrl,
        linkedinUrl: isSocialLocked ? (teacherProfile?.linkedinUrl || null) : normalizeUrl(formData.linkedinUrl),
        twitterUrl: isSocialLocked ? (teacherProfile?.twitterUrl || null) : normalizeUrl(formData.twitterUrl),
        websiteUrl: normalizeUrl(formData.websiteUrl),
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
      setActiveTab("overview")
    } catch (err: unknown) {
      const errorObj = err as { data?: { errors?: { field: string; message: string }[] }; message?: string }
      if (errorObj?.data?.errors && Array.isArray(errorObj.data.errors)) {
        const backendErrors: Partial<Record<keyof TeacherFormData, string>> = {}
        errorObj.data.errors.forEach((e: { field: string; message: string }) => {
          if (e.field && e.message) {
            backendErrors[e.field as keyof TeacherFormData] = e.message
          }
        })
        if (Object.keys(backendErrors).length > 0) {
          setFieldErrors(backendErrors)
        }
      }
    } finally {
      setIsUploadingFiles(false)
    }
  }

  const handleResetForm = async () => {
    if (profileData) {
      const confirmed = await confirm({
        actionType: "discard",
        title: "Discard Unsaved Changes?",
        description:
          "Are you sure you want to revert all changes made to your instructor profile? Any unsaved qualifications, certificates, or bio edits will be lost.",
      })
      if (!confirmed) return

      setStagedFiles({ avatar: null, identityCard: null, resume: null, credentials: [] })

      setFormData({
        name: profileData.name || "",
        avatar: profileData.profile?.avatar || "",
        phone: profileData.profile?.phone || "",
        country: profileData.profile?.country || "",
        bio: profileData.profile?.bio || "",
        qualifications: normalizeQualifications(profileData.teacherProfile?.qualifications),
        experienceYears: profileData.teacherProfile?.experienceYears ?? 0,
        resume: profileData.teacherProfile?.resume || "",
        credentials: profileData.teacherProfile?.credentials || [],
        identityCard: profileData.teacherProfile?.identityCard || "",
        linkedinUrl: profileData.teacherProfile?.linkedinUrl || "",
        twitterUrl: profileData.teacherProfile?.twitterUrl || "",
        websiteUrl: profileData.teacherProfile?.websiteUrl || "",
        expertise: profileData.teacherProfile?.expertise || [],
      })
      setFieldErrors({})
    }
  }

  if (isLoading) {
    return (
      <LoadingScreen
        fullScreen={false}
        message="Loading instructor profile..."
        subMessage="Fetching your profile credentials and verification status"
      />
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 w-full">
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          {error instanceof Error ? error.message : "Failed to load instructor profile"}
        </p>
        <Button onClick={() => refetch()} variant="outline" className="gap-2 rounded-xl text-xs cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </Button>
      </div>
    )
  }

  const userProfile = profileData?.profile
  const teacherProfile = profileData?.teacherProfile
  const currentApprovalStatus: ApprovalStatus =
    teacherProfile?.approvalStatus ||
    (teacherProfile?.isApproved ? "VERIFIED" : "PENDING")

  const submissionCount = teacherProfile?.submissionCount ?? 0
  const isSubmissionMaxed = submissionCount >= 5

  const handleSubmitForVerification = () => {
    if (isSubmissionMaxed) {
      toast.error(
        "You have reached the maximum verification submission limit (5 attempts). Please contact an administrator."
      )
      return
    }

    const hasCountry = Boolean(userProfile?.country?.trim() || formData.country?.trim())
    if (!hasCountry) {
      toast.error("Please specify your country before submitting your application for verification.")
      setActiveTab("edit")
      return
    }

    const hasQualifications =
      formData.qualifications.length > 0 ||
      normalizeQualifications(teacherProfile?.qualifications).length > 0
    const hasBio = Boolean(userProfile?.bio?.trim() || formData.bio?.trim())
    const hasExpertise =
      (teacherProfile?.expertise && teacherProfile.expertise.length > 0) ||
      (formData.expertise && formData.expertise.length > 0)

    if (!hasQualifications && !hasBio) {
      toast.error("Please add your qualifications or biography before submitting for verification.")
      setActiveTab("edit")
      return
    }

    if (!hasExpertise) {
      toast.error("Please select at least one domain of expertise before submitting for verification.")
      setActiveTab("edit")
      return
    }

    // Open confirmation modal before making the verification submission API call
    setIsSubmitModalOpen(true)
  }

  const handleConfirmSubmitForVerification = async () => {
    try {
      setIsUploadingFiles(true)
      const uploaded = await uploadPendingFiles()

      const isSocialLocked =
        currentApprovalStatus === "IN_PROGRESS" ||
        currentApprovalStatus === "VERIFIED" ||
        Boolean(teacherProfile?.isApproved)

      const normalizeUrl = (url?: string | null) => {
        if (!url) return null
        const trimmed = url.trim()
        if (!trimmed) return null
        if (trimmed.startsWith("/") || trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
          return trimmed
        }
        return `https://${trimmed}`
      }

      await updateMutation.mutateAsync({
        name: formData.name.trim(),
        avatar: uploaded.avatarUrl,
        phone: formData.phone ? formData.phone.trim() : null,
        country: formData.country.trim(),
        bio: formData.bio ? formData.bio.trim() : null,
        qualifications: formData.qualifications,
        experienceYears: Number(formData.experienceYears) || 0,
        resume: uploaded.resumeUrl,
        credentials: uploaded.credentialsUrls,
        identityCard: uploaded.identityCardUrl,
        linkedinUrl: isSocialLocked ? (teacherProfile?.linkedinUrl || null) : normalizeUrl(formData.linkedinUrl),
        twitterUrl: isSocialLocked ? (teacherProfile?.twitterUrl || null) : normalizeUrl(formData.twitterUrl),
        websiteUrl: normalizeUrl(formData.websiteUrl),
        expertise: formData.expertise,
      })

      setStagedFiles({ avatar: null, identityCard: null, resume: null, credentials: [] })
      await submitMutation.mutateAsync()
      setIsSubmitModalOpen(false)
      setActiveTab("overview")
    } catch {
      // Handled in mutation hook
    } finally {
      setIsUploadingFiles(false)
    }
  }

  const avatarUrl =
    userProfile?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.name || "Teacher")}&background=F42A18&color=fff`

  const hasSocialLinks =
    Boolean(teacherProfile?.linkedinUrl) ||
    Boolean(teacherProfile?.twitterUrl) ||
    Boolean(teacherProfile?.websiteUrl)

  return (
    <div className="flex flex-1 flex-col w-full text-left space-y-8">
      {/* Teacher Profile Header (Clean single surface without artificial banners) */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar with edit button */}
          <div className="relative group shrink-0">
            <img
              src={avatarUrl}
              alt={profileData?.name || "Instructor Avatar"}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-neutral-100 dark:bg-neutral-800 ring-1 ring-neutral-200 dark:ring-neutral-800"
            />
            <button
              type="button"
              onClick={() => {
                setActiveTab("edit")
                setTimeout(() => {
                  fileInputRef.current?.click()
                }, 50)
              }}
              title="Change Avatar"
              className="absolute bottom-1 right-1 p-1.5 rounded-lg bg-neutral-900/90 hover:bg-[#F42A18] text-white shadow-sm transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Teacher details */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {profileData?.name}
              </h1>

              {/* Status Badge */}
              {currentApprovalStatus === "VERIFIED" ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold text-[11px] px-2.5 py-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Instructor
                </Badge>
              ) : currentApprovalStatus === "IN_PROGRESS" ? (
                <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 font-semibold text-[11px] px-2.5 py-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Application In Progress
                </Badge>
              ) : currentApprovalStatus === "REDO" ? (
                <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30 font-semibold text-[11px] px-2.5 py-0.5 flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Revisions Requested
                </Badge>
              ) : currentApprovalStatus === "REVOKED" ? (
                <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-semibold text-[11px] px-2.5 py-0.5 flex items-center gap-1">
                  <UserX className="w-3.5 h-3.5" />
                  Verification Revoked
                </Badge>
              ) : (
                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold text-[11px] px-2.5 py-0.5 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Draft Profile
                </Badge>
              )}

              {profileData?.isBlocked ? (
                <Badge variant="outline" className="text-red-600 dark:text-red-400 border-red-500/20 text-xs flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  Account Blocked
                </Badge>
              ) : (
                <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Active Account
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                {profileData?.email}
              </span>
              {userProfile?.country && (
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-neutral-400" />
                  {userProfile.country}
                </span>
              )}
              {userProfile?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  {userProfile.phone}
                </span>
              )}
              {teacherProfile?.experienceYears != null && (
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
                  {teacherProfile.experienceYears}+ Years Exp.
                </span>
              )}
              {profileData?.createdAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  Joined {new Date(profileData.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              )}
            </div>

            {/* Social links row */}
            {hasSocialLinks && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-medium text-neutral-400">Socials:</span>
                {teacherProfile?.linkedinUrl && (
                  <a
                    href={teacherProfile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded-md text-neutral-500 hover:text-[#F42A18] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="LinkedIn"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {teacherProfile?.twitterUrl && (
                  <a
                    href={teacherProfile.twitterUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded-md text-neutral-500 hover:text-[#F42A18] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Twitter / X"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                )}
                {teacherProfile?.websiteUrl && (
                  <a
                    href={teacherProfile.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded-md text-neutral-500 hover:text-[#F42A18] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Website"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {(currentApprovalStatus === "VERIFIED" || teacherProfile?.isApproved) && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Certified Instructor</span>
            </div>
          )}

          {(currentApprovalStatus === "PENDING" || currentApprovalStatus === "REDO") && (
            <Button
              onClick={handleSubmitForVerification}
              disabled={submitMutation.isPending || isSubmissionMaxed}
              className={`gap-2 rounded-xl text-xs font-semibold cursor-pointer w-full sm:w-auto ${
                isSubmissionMaxed
                  ? "bg-neutral-600 text-neutral-300 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
              title={
                isSubmissionMaxed
                  ? "Maximum submission attempts reached (5/5). Contact administrator to reapply."
                  : "Submit instructor application for administrator verification"
              }
            >
              {submitMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>
                {isSubmissionMaxed
                  ? "Max Submissions (5/5)"
                  : currentApprovalStatus === "REDO"
                    ? "Re-submit Application"
                    : "Submit for Verification"}
              </span>
            </Button>
          )}

          <Button
            variant={activeTab === "edit" ? "outline" : "default"}
            onClick={() => setActiveTab(activeTab === "edit" ? "overview" : "edit")}
            className={`gap-2 rounded-xl text-xs font-semibold cursor-pointer w-full sm:w-auto ${
              activeTab === "overview"
                ? "bg-[#F42A18] hover:bg-[#d92212] text-white"
                : ""
            }`}
          >
            <Edit3 className="w-4 h-4" />
            {activeTab === "edit" ? "View Overview" : "Edit Profile"}
          </Button>
        </div>
      </div>

      {/* Clean Navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-neutral-200/80 dark:border-neutral-800 -mt-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${activeTab === "overview"
              ? "border-[#F42A18] text-[#F42A18]"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
        >
          <User className="w-4 h-4" />
          Instructor Overview
        </button>
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${activeTab === "edit"
              ? "border-[#F42A18] text-[#F42A18]"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
        >
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </button>
        {profileData?.authProvider !== "GOOGLE" && (
          <button
            onClick={() => navigate("/teachers/password")}
            className="flex items-center gap-2 pb-3 text-sm font-semibold transition-all border-b-2 border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            Password & Security
          </button>
        )}
      </div>

      {/* Maximum Submissions Reached Banner */}
      {isSubmissionMaxed && (currentApprovalStatus === "PENDING" || currentApprovalStatus === "REDO") && (
        <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-900 dark:text-red-200 flex items-start gap-3.5">
          <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-red-600 dark:text-red-400">
              Maximum Verification Submissions Limit Reached (5/5 attempts)
            </h3>
            <p className="text-xs leading-relaxed opacity-90">
              You have submitted your profile for verification 5 times. You cannot submit again automatically.
              Please contact an administrator or support team to review your application or reset your submission quota.
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Feedback Banner for REDO / REVOKED / Suggestions */}
      {(currentApprovalStatus === "REDO" || currentApprovalStatus === "REVOKED" || teacherProfile?.rejectionReason) && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3.5 ${currentApprovalStatus === "REVOKED"
              ? "bg-rose-500/5 border-rose-500/20 text-rose-900 dark:text-rose-200"
              : "bg-orange-500/5 border-orange-500/20 text-orange-900 dark:text-orange-200"
            }`}
        >
          {currentApprovalStatus === "REVOKED" ? (
            <UserX className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
          )}

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-sm">
                {currentApprovalStatus === "REDO"
                  ? "Action Required: Revisions Requested for Instructor Verification"
                  : currentApprovalStatus === "REVOKED"
                    ? "Instructor Verification Has Been Revoked"
                    : "Feedback from Administrator Review"}
              </h3>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${currentApprovalStatus === "REVOKED"
                    ? "bg-rose-500/20 text-rose-700 dark:text-rose-300"
                    : "bg-orange-500/20 text-orange-700 dark:text-orange-300"
                  }`}
              >
                {currentApprovalStatus.replace("_", " ")}
              </span>
            </div>

            {teacherProfile?.rejectionReason && (
              <div className="p-3 rounded-xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-200/60 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 space-y-1">
                <div className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#F42A18]" />
                  <span>Suggestions for Improvement:</span>
                </div>
                <p className="italic font-medium leading-relaxed">
                  "{teacherProfile.rejectionReason}"
                </p>
              </div>
            )}

            <p className="text-xs opacity-90 leading-relaxed">
              {currentApprovalStatus === "REDO"
                ? "Please update your qualifications, bio, and portfolio links in the Edit Profile tab below to resolve the suggestions above. Once updated, your application will be re-evaluated by administrators."
                : "Please address the administrator feedback and update your profile information as required."}
            </p>
          </div>
        </div>
      )}

      {/* Tab: Overview (Full-width clean single layout) */}
      {activeTab === "overview" && (
        <div className="w-full space-y-10">
          {/* Biography */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800/80">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#F42A18]" />
                Instructor Biography
              </h2>
              {!userProfile?.bio && (
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className="text-xs text-[#F42A18] hover:underline font-medium cursor-pointer"
                >
                  + Add bio
                </button>
              )}
            </div>
            {userProfile?.bio ? (
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line max-w-4xl">
                {userProfile.bio}
              </p>
            ) : (
              <p className="text-sm text-neutral-400 italic">
                No biography provided yet. Tell students about your teaching philosophy and professional background.
              </p>
            )}
          </div>

          {/* Qualifications & Academic Degrees / Experience */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800/80">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#F42A18]" />
                Qualifications & Academic Degrees / Experience
              </h2>
              {normalizeQualifications(teacherProfile?.qualifications).length === 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className="text-xs text-[#F42A18] hover:underline font-medium cursor-pointer"
                >
                  + Add qualifications
                </button>
              )}
            </div>
            {normalizeQualifications(teacherProfile?.qualifications).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {normalizeQualifications(teacherProfile?.qualifications).map((qual, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/80 border border-neutral-200/70 dark:border-neutral-800 shadow-xs"
                  >
                    <div className="p-2 rounded-lg bg-[#F42A18]/10 text-[#F42A18] shrink-0 mt-0.5">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <h3 className="text-xs font-bold text-neutral-900 dark:text-white truncate" title={qual.title}>
                        {qual.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                        {qual.institution && (
                          <span className="flex items-center gap-1 truncate max-w-[150px]" title={qual.institution}>
                            <Building2 className="w-3 h-3 text-neutral-400 shrink-0" />
                            <span className="truncate">{qual.institution}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-medium text-neutral-600 dark:text-neutral-300">
                          <Calendar className="w-3 h-3 text-[#F42A18] shrink-0" />
                          <span>{qual.year}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-400 italic">
                No qualifications listed yet. Click "Edit Profile" to add your academic degrees or experience.
              </p>
            )}
          </div>

          {/* Resume & Curriculum Vitae (PDF) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800/80">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#F42A18]" />
                Resume & Curriculum Vitae (PDF)
              </h2>
              {!teacherProfile?.resume && (
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className="text-xs text-[#F42A18] hover:underline font-medium cursor-pointer"
                >
                  + Upload resume
                </button>
              )}
            </div>
            {teacherProfile?.resume ? (
              <div className="max-w-4xl">
                <FileDocumentCard
                  title="Instructor Resume & Professional CV"
                  url={teacherProfile.resume}
                  category="resume"
                  subtitle="Saved securely in S3 storage"
                  onPreview={handlePreviewFile}
                />
              </div>
            ) : (
              <p className="text-sm text-neutral-400 italic">
                No resume uploaded yet. Click "Edit Profile" to upload your CV in PDF format for administrative verification.
              </p>
            )}
          </div>

          {/* Government Identity Document (PAN / National ID) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800/80">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#F42A18]" />
                Government Identity Document (PAN / National ID)
              </h2>
              {!teacherProfile?.identityCard && (
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className="text-xs text-[#F42A18] hover:underline font-medium cursor-pointer"
                >
                  + Upload identity card
                </button>
              )}
            </div>
            {teacherProfile?.identityCard ? (
              <div className="max-w-4xl">
                <FileDocumentCard
                  title="Government Identity Card / PAN Card"
                  url={teacherProfile.identityCard}
                  category="identity"
                  subtitle="Stored securely for admin verification"
                  onPreview={handlePreviewFile}
                />
              </div>
            ) : (
              <p className="text-sm text-neutral-400 italic">
                No identity document uploaded yet. Click "Edit Profile" to upload your PAN Card, Aadhaar, Passport, or National ID.
              </p>
            )}
          </div>

          {/* Uploaded Certificates & Credentials */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800/80">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#F42A18]" />
                  Uploaded Certificates & Degrees (Credentials)
                </h2>
                {teacherProfile?.credentials && teacherProfile.credentials.length > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {teacherProfile.credentials.length} {teacherProfile.credentials.length === 1 ? "certificate" : "certificates"}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className="text-xs text-[#F42A18] hover:underline font-medium cursor-pointer"
              >
                + Manage certificates
              </button>
            </div>
            {teacherProfile?.credentials && teacherProfile.credentials.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
            ) : (
              <p className="text-sm text-neutral-400 italic">
                No certificates uploaded yet. Click "Edit Profile" to upload your degrees and accreditation certificates.
              </p>
            )}
          </div>

          {/* Domains of Expertise */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800/80">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#F42A18]" />
                Domains of Expertise
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className="text-xs text-[#F42A18] hover:underline font-medium cursor-pointer"
              >
                Edit domains
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {teacherProfile?.expertise && teacherProfile.expertise.length > 0 ? (
                teacherProfile.expertise.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-neutral-400 italic">
                  No domains of expertise added yet. Click "Edit Profile" to add your technical specializations.
                </p>
              )}
            </div>
          </div>

          {/* Instructor & Verification Details */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800/80">
              <KeyRound className="w-4 h-4 text-[#F42A18]" />
              Account & Instructor Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-1">
              <div className="space-y-1">
                <span className="text-xs text-neutral-400 font-medium">Instructor Status</span>
                <div className="pt-0.5">
                  <Badge
                    className={
                      currentApprovalStatus === "VERIFIED"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs"
                        : currentApprovalStatus === "IN_PROGRESS"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-xs"
                          : currentApprovalStatus === "REDO"
                            ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 text-xs"
                            : currentApprovalStatus === "REVOKED"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-xs"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs"
                    }
                  >
                    {currentApprovalStatus.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-neutral-400 font-medium">Submissions Count</span>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {submissionCount} / 5 Attempts
                </p>
              </div>

              {profileData?.createdAt && (
                <div className="space-y-1">
                  <span className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Member Since
                  </span>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {new Date(profileData.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}

              {profileData?.updatedAt && (
                <div className="space-y-1">
                  <span className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Last Updated
                  </span>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {new Date(profileData.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Verified Instructor AI Assessment & Vetting Card */}
          {teacherProfile?.isInterviewPassed && (
            <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-neutral-900 via-neutral-900 to-emerald-950/40 p-6 sm:p-8 text-left shadow-lg">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified & Certified Instructor
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    Instructor Pedagogical & Technical Certification
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {teacherProfile.interviewFeedback ||
                      "You have successfully passed the AI technical and pedagogical evaluation. Your instructor credentials and course publishing rights are fully activated on Coursity."}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs font-semibold text-emerald-400 border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Assessment Passed {teacherProfile.interviewScore ? `(${teacherProfile.interviewScore}%)` : ""}</span>
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Edit Instructor Profile Form (Full-width clean layout) */}
      {activeTab === "edit" && (
        <form onSubmit={handleSaveChanges} noValidate className="w-full space-y-8">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Edit Instructor Profile</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Manage your credentials, biography, specializations, and portfolio links.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Full Name */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="name" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Display Name <span className="text-[#F42A18]">*</span>
                </Label>
                {fieldErrors.name && (
                  <span className="text-[11px] font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                    {fieldErrors.name}
                  </span>
                )}
              </div>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g. Dr. Jane Doe"
                className={`rounded-xl ${fieldErrors.name ? "border-[#F42A18] focus-visible:ring-[#F42A18]/25" : ""}`}
                required
              />
            </div>

            {/* Email (Readonly) */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Email Address (Read-only)
              </Label>
              <Input
                id="email"
                value={profileData?.email || ""}
                disabled
                className="rounded-xl bg-neutral-100 dark:bg-neutral-800 cursor-not-allowed text-neutral-500"
              />
            </div>

            {/* Country Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="country" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Country / Region <span className="text-[#F42A18]">*</span>
                </Label>
                {fieldErrors.country && (
                  <span className="text-[11px] font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                    {fieldErrors.country}
                  </span>
                )}
              </div>
              <CountrySelect
                id="country"
                value={formData.country}
                onChange={(countryName) => handleInputChange("country", countryName)}
                error={Boolean(fieldErrors.country)}
                placeholder="Select country"
              />
            </div>

            {/* Phone Number with Country Code */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="phone" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Phone Number <span className="text-[#F42A18]">*</span>
                </Label>
                {fieldErrors.phone && (
                  <span className="text-[11px] font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                    {fieldErrors.phone}
                  </span>
                )}
              </div>
              <PhoneInputWithCountry
                id="phone"
                value={formData.phone}
                country={formData.country}
                onChange={(val) => handleInputChange("phone", val)}
                onCountryChange={(countryName) => handleInputChange("country", countryName)}
                error={Boolean(fieldErrors.phone)}
                placeholder="555 019 2834"
              />
            </div>

            {/* Experience Years */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="experienceYears" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Industry Experience (Years) <span className="text-[#F42A18]">*</span>
                </Label>
                {fieldErrors.experienceYears && (
                  <span className="text-[11px] font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                    {fieldErrors.experienceYears}
                  </span>
                )}
              </div>
              <Input
                id="experienceYears"
                type="number"
                min={0}
                max={80}
                value={formData.experienceYears}
                onChange={(e) => handleInputChange("experienceYears", parseInt(e.target.value) || 0)}
                className={`rounded-xl ${fieldErrors.experienceYears ? "border-[#F42A18] focus-visible:ring-[#F42A18]/25" : ""}`}
              />
            </div>

            {/* Qualifications & Academic Degrees / Experience Array Input */}
            <div className="md:col-span-2">
              <QualificationsArrayInput
                id="qualifications"
                value={formData.qualifications}
                onChange={(items) => handleInputChange("qualifications", items)}
                error={fieldErrors.qualifications}
              />
            </div>

            {/* Avatar Image Input */}
            <div className="md:col-span-2">
              <ImageUploadInput
                id="avatar"
                label="Instructor Profile Picture"
                value={formData.avatar}
                onChange={(val: string) => handleInputChange("avatar", val)}
                onFileSelect={(file) => setStagedFiles((prev) => ({ ...prev, avatar: file }))}
                fallbackName={formData.name || profileData?.name}
                inputRef={fileInputRef}
              />
            </div>

            {/* Resume / Curriculum Vitae PDF */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Curriculum Vitae / Resume (PDF) <span className="text-[#F42A18]">*</span>
                </Label>
                {fieldErrors.resume && (
                  <span className="text-[11px] font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                    {fieldErrors.resume}
                  </span>
                )}
              </div>
              <ResumeUploadInput
                id="resume"
                label=""
                value={formData.resume}
                onChange={(val: string) => handleInputChange("resume", val)}
                onFileSelect={(file) => setStagedFiles((prev) => ({ ...prev, resume: file }))}
              />
            </div>

            {/* Government Identity Document (PAN / National ID) */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Government Identity Document (PAN Card / National ID / Passport) <span className="text-[#F42A18]">*</span>
                </Label>
                {fieldErrors.identityCard && (
                  <span className="text-[11px] font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                    {fieldErrors.identityCard}
                  </span>
                )}
              </div>
              <IdentityCardUploadInput
                id="identityCard"
                label=""
                value={formData.identityCard}
                onChange={(val: string) => handleInputChange("identityCard", val)}
                onFileSelect={(file) => setStagedFiles((prev) => ({ ...prev, identityCard: file }))}
              />
            </div>

            {/* Professional Credentials & Certificates (Multiple) */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Professional Accreditation Certificates & Degrees (Credentials) <span className="text-[#F42A18]">*</span>
                </Label>
                {fieldErrors.credentials && (
                  <span className="text-[11px] font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                    {fieldErrors.credentials}
                  </span>
                )}
              </div>
              <MultipleCertificatesUploadInput
                id="credentials"
                label=""
                values={formData.credentials}
                onChange={(urls: string[]) => {
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
              />
            </div>

            {/* Bio */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="bio" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Biography & Teaching Philosophy <span className="text-[#F42A18]">*</span>
                </Label>
                {fieldErrors.bio && (
                  <span className="text-[11px] font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                    {fieldErrors.bio}
                  </span>
                )}
              </div>
              <textarea
                id="bio"
                rows={4}
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Share your industry background, teaching style, and areas of expertise..."
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-hidden focus:ring-2 text-neutral-900 dark:text-white ${
                  fieldErrors.bio
                    ? "border-[#F42A18] focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
                    : "border-neutral-200 dark:border-neutral-800 focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
                }`}
              />
            </div>

            {/* LinkedIn URL (Optional) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="linkedinUrl" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  LinkedIn URL (Optional)
                  {(currentApprovalStatus === "IN_PROGRESS" || currentApprovalStatus === "VERIFIED" || teacherProfile?.isApproved) && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </Label>
                {fieldErrors.linkedinUrl && (
                  <span className="text-[11px] font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                    {fieldErrors.linkedinUrl}
                  </span>
                )}
              </div>
              <Input
                id="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                placeholder="https://linkedin.com/in/username"
                disabled={currentApprovalStatus === "IN_PROGRESS" || currentApprovalStatus === "VERIFIED" || Boolean(teacherProfile?.isApproved)}
                className={`rounded-xl ${
                  fieldErrors.linkedinUrl ? "border-[#F42A18] focus-visible:ring-[#F42A18]/25" : ""
                } ${
                  currentApprovalStatus === "IN_PROGRESS" || currentApprovalStatus === "VERIFIED" || teacherProfile?.isApproved
                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed"
                    : ""
                }`}
              />
            </div>

            {/* Twitter / X URL (Optional) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="twitterUrl" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  Twitter / X URL (Optional)
                  {(currentApprovalStatus === "IN_PROGRESS" || currentApprovalStatus === "VERIFIED" || teacherProfile?.isApproved) && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </Label>
                {fieldErrors.twitterUrl && (
                  <span className="text-[11px] font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                    {fieldErrors.twitterUrl}
                  </span>
                )}
              </div>
              <Input
                id="twitterUrl"
                value={formData.twitterUrl}
                onChange={(e) => handleInputChange("twitterUrl", e.target.value)}
                placeholder="https://x.com/username"
                disabled={currentApprovalStatus === "IN_PROGRESS" || currentApprovalStatus === "VERIFIED" || Boolean(teacherProfile?.isApproved)}
                className={`rounded-xl ${
                  fieldErrors.twitterUrl ? "border-[#F42A18] focus-visible:ring-[#F42A18]/25" : ""
                } ${
                  currentApprovalStatus === "IN_PROGRESS" || currentApprovalStatus === "VERIFIED" || teacherProfile?.isApproved
                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed"
                    : ""
                }`}
              />
            </div>

            {/* Website URL (Optional) */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="websiteUrl" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Portfolio / Personal Website URL (Optional)
                </Label>
                {fieldErrors.websiteUrl && (
                  <span className="text-[11px] font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                    {fieldErrors.websiteUrl}
                  </span>
                )}
              </div>
              <Input
                id="websiteUrl"
                value={formData.websiteUrl}
                onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                placeholder="https://yourwebsite.com"
                className={`rounded-xl ${fieldErrors.websiteUrl ? "border-[#F42A18] focus-visible:ring-[#F42A18]/25" : ""}`}
              />
            </div>

            {/* Domains of Expertise Selector */}
            <div className="md:col-span-2 space-y-3" ref={dropdownRef}>
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F42A18]" />
                  Domains of Expertise <span className="text-[#F42A18]">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  {fieldErrors.expertise && (
                    <span className="text-[11px] font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                      {fieldErrors.expertise}
                    </span>
                  )}
                  <span className="text-[11px] font-medium text-neutral-400">
                    {formData.expertise.length} / 15 selected
                  </span>
                </div>
              </div>

              {/* Selected Tags Display */}
              <div
                className={`flex flex-wrap gap-2 p-3 rounded-2xl border bg-neutral-50/50 dark:bg-neutral-900/40 min-h-12 items-center ${
                  fieldErrors.expertise
                    ? "border-[#F42A18] ring-1 ring-[#F42A18]/20"
                    : "border-neutral-200 dark:border-neutral-800"
                }`}
              >
                {formData.expertise.length > 0 ? (
                  formData.expertise.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-[#F42A18]/10 text-[#F42A18] dark:text-[#ff6b5e] border border-[#F42A18]/25"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveExpertise(tag)}
                        className="hover:text-neutral-900 dark:hover:text-white cursor-pointer ml-0.5"
                        title={`Remove ${tag}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-neutral-400 italic">
                    No expertise domains selected yet. Search or choose from the suggestions below.
                  </span>
                )}
              </div>

              {/* Search & Selection Dropdown */}
              <div className="relative">
                <SearchInput
                  value={expertiseSearch}
                  onChange={(val) => {
                    setExpertiseSearch(val)
                    setIsDropdownOpen(true)
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Search domains (e.g. Distributed Systems, Machine Learning, Rust)..."
                  className="rounded-xl text-xs"
                  containerClassName="w-full"
                />

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute z-30 left-0 right-0 mt-2 p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl max-h-72 overflow-y-auto space-y-3">
                    {/* Filter category pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                      <button
                        type="button"
                        onClick={() => setSelectedCategoryTab("all")}
                        className={`px-2.5 py-1 rounded-lg font-medium shrink-0 cursor-pointer transition-colors ${selectedCategoryTab === "all"
                            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                          }`}
                      >
                        All Categories
                      </button>
                      {EXPERTISE_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategoryTab(cat.id)}
                          className={`px-2.5 py-1 rounded-lg font-medium shrink-0 cursor-pointer transition-colors ${selectedCategoryTab === cat.id
                              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                            }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>

                    {/* Filtered list */}
                    {filteredCategories.length > 0 ? (
                      <div className="space-y-3">
                        {filteredCategories.map((cat) => (
                          <div key={cat.id} className="space-y-1.5">
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                              {cat.name}
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {cat.tags.map((tag) => {
                                const isSelected = formData.expertise.includes(tag)
                                return (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleToggleExpertise(tag)}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${isSelected
                                        ? "bg-[#F42A18] text-white shadow-xs"
                                        : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-neutral-700/60"
                                      }`}
                                  >
                                    {isSelected ? (
                                      <Check className="w-3 h-3" />
                                    ) : (
                                      <Plus className="w-3 h-3 opacity-60" />
                                    )}
                                    {tag}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-neutral-400">
                        No matching domains found for &quot;{expertiseSearch}&quot;.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Suggestions */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#F42A18]" />
                  Suggested Domains (Click to toggle):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SUGGESTIONS.map((tag) => {
                    const isSelected = formData.expertise.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleExpertise(tag)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${isSelected
                            ? "bg-[#F42A18]/15 text-[#F42A18] border border-[#F42A18]/30 font-semibold"
                            : "bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                          }`}
                      >
                        {isSelected ? (
                          <Check className="w-2.5 h-2.5" />
                        ) : (
                          <Plus className="w-2.5 h-2.5 opacity-60" />
                        )}
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-neutral-200/80 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetForm}
              disabled={isUploadingFiles || updateMutation.isPending}
              className="gap-2 rounded-xl text-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
            <Button
              type="submit"
              disabled={isUploadingFiles || updateMutation.isPending}
              className="gap-2 rounded-xl text-xs bg-[#F42A18] hover:bg-[#d92212] text-white cursor-pointer"
            >
              {isUploadingFiles || updateMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {isUploadingFiles ? "Uploading Files..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Verification Submission Confirmation Modal */}
      <SubmitVerificationModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleConfirmSubmitForVerification}
        isLoading={isUploadingFiles || submitMutation.isPending || updateMutation.isPending}
        submissionCount={submissionCount}
        isRedo={currentApprovalStatus === "REDO"}
        qualifications={formData.qualifications || teacherProfile?.qualifications}
        bio={formData.bio || userProfile?.bio}
        expertise={
          formData.expertise && formData.expertise.length > 0
            ? formData.expertise
            : teacherProfile?.expertise || []
        }
      />
      <ConfirmDialog />

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

export default TeacherProfilePage
