import React, { useState, useEffect, useRef } from "react"
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
  AlertCircle,
  Search,
  Check,
  Sparkles,
  UserX,
  MessageSquare,
  AlertTriangle,
  Send,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ImageUploadInput } from "@/components/common"
import { toast } from "@/lib/toast"
import { useProfile, useUpdateTeacherProfile, useSubmitTeacherVerification } from "../hooks/useProfile"
import { EXPERTISE_CATEGORIES } from "../constants/expertise.constants"
import { validateTeacherForm } from "../schemas/profile.schema"
import type { ApprovalStatus } from "../types/profile.types"

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
  qualifications: string
  experienceYears: number
  bio: string
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

  const [formData, setFormData] = useState<TeacherFormData>({
    name: "",
    avatar: "",
    phone: "",
    qualifications: "",
    experienceYears: 0,
    bio: "",
    linkedinUrl: "",
    twitterUrl: "",
    websiteUrl: "",
    expertise: [],
  })

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof TeacherFormData, string>>>({})
  const [expertiseSearch, setExpertiseSearch] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("all")

  // Sync form state when backend profile data is loaded or updated
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        avatar: profileData.profile?.avatar || "",
        phone: profileData.profile?.phone || "",
        bio: profileData.profile?.bio || "",
        qualifications: profileData.teacherProfile?.qualifications || "",
        experienceYears: profileData.teacherProfile?.experienceYears ?? 0,
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

  const handleInputChange = (field: keyof TeacherFormData, value: any) => {
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

    try {
      await updateMutation.mutateAsync({
        name: formData.name.trim(),
        avatar: formData.avatar ? formData.avatar.trim() : null,
        phone: formData.phone ? formData.phone.trim() : null,
        bio: formData.bio ? formData.bio.trim() : null,
        qualifications: formData.qualifications ? formData.qualifications.trim() : null,
        experienceYears: Number(formData.experienceYears) || 0,
        linkedinUrl: formData.linkedinUrl ? formData.linkedinUrl.trim() : null,
        twitterUrl: formData.twitterUrl ? formData.twitterUrl.trim() : null,
        websiteUrl: formData.websiteUrl ? formData.websiteUrl.trim() : null,
        expertise: formData.expertise,
      })
      setActiveTab("overview")
    } catch (err: any) {
      if (err?.data?.errors && Array.isArray(err.data.errors)) {
        const backendErrors: Partial<Record<keyof TeacherFormData, string>> = {}
        err.data.errors.forEach((e: { field: string; message: string }) => {
          if (e.field && e.message) {
            backendErrors[e.field as keyof TeacherFormData] = e.message
          }
        })
        if (Object.keys(backendErrors).length > 0) {
          setFieldErrors(backendErrors)
        }
      }
    }
  }

  const handleResetForm = () => {
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        avatar: profileData.profile?.avatar || "",
        phone: profileData.profile?.phone || "",
        bio: profileData.profile?.bio || "",
        qualifications: profileData.teacherProfile?.qualifications || "",
        experienceYears: profileData.teacherProfile?.experienceYears ?? 0,
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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-[#F42A18] animate-spin" />
        <p className="text-sm font-medium text-neutral-500">Loading instructor profile...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20">
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          {(error as any)?.message || "Failed to load instructor profile"}
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

  const handleSubmitForVerification = async () => {
    if (isSubmissionMaxed) {
      toast.error(
        "You have reached the maximum verification submission limit (5 attempts). Please contact an administrator."
      )
      return
    }

    const hasQualifications = Boolean(teacherProfile?.qualifications?.trim() || formData.qualifications?.trim())
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

    try {
      await submitMutation.mutateAsync()
      setActiveTab("overview")
    } catch {
      // Handled in mutation hook
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
    <div className="flex flex-1 flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Teacher Profile Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/80 shadow-xs">
        {/* Banner Cover Pattern */}
        <div className="h-36 sm:h-44 w-full bg-linear-to-r from-neutral-950 via-neutral-900 to-[#F42A18]/85 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(244,42,24,0.35),transparent_65%)]" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {currentApprovalStatus === "VERIFIED" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Verified & Approved Instructor
              </span>
            ) : currentApprovalStatus === "IN_PROGRESS" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 backdrop-blur-md text-blue-300 border border-blue-500/30">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Application Under Review ({submissionCount}/5 Submissions)
              </span>
            ) : currentApprovalStatus === "REDO" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 backdrop-blur-md text-orange-300 border border-orange-500/30">
                <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
                Revision Requested ({submissionCount}/5 Submissions)
              </span>
            ) : currentApprovalStatus === "REVOKED" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 backdrop-blur-md text-rose-300 border border-rose-500/30">
                <UserX className="w-3.5 h-3.5 text-rose-400" />
                Verification Revoked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-500/30">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Draft Profile ({submissionCount}/5 Submissions)
              </span>
            )}
          </div>
        </div>

        {/* Profile Info Header */}
        <div className="px-6 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            {/* Avatar */}
            <div className="relative group">
              <img
                src={avatarUrl}
                alt={profileData?.name || "Instructor Avatar"}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white dark:border-neutral-900 shadow-xl bg-neutral-100 dark:bg-neutral-800"
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
                className="absolute bottom-1 right-1 p-2 rounded-xl bg-neutral-900/80 hover:bg-[#F42A18] text-white shadow-md backdrop-blur-xs transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {(currentApprovalStatus === "PENDING" || currentApprovalStatus === "REDO") && (
                <Button
                  onClick={handleSubmitForVerification}
                  disabled={submitMutation.isPending || isSubmissionMaxed}
                  className={`flex-1 sm:flex-none gap-2 rounded-xl text-xs font-semibold cursor-pointer shadow-xs ${isSubmissionMaxed
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
                variant={activeTab === "edit" ? "secondary" : "default"}
                onClick={() => setActiveTab(activeTab === "edit" ? "overview" : "edit")}
                className="flex-1 sm:flex-none gap-2 bg-[#F42A18] hover:bg-[#d92212] text-white cursor-pointer rounded-xl text-xs font-semibold"
              >
                <Edit3 className="w-4 h-4" />
                {activeTab === "edit" ? "View Profile" : "Edit Profile"}
              </Button>
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-1.5 text-left">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {profileData?.name}
              </h1>
              <Badge variant="secondary" className="bg-[#F42A18]/10 text-[#F42A18] border-[#F42A18]/20 font-semibold uppercase text-[11px] px-2.5 py-0.5">
                {profileData?.role || "TEACHER"}
              </Badge>
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

            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                {profileData?.email}
              </span>
              {userProfile?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  {userProfile.phone}
                </span>
              )}
              {teacherProfile?.experienceYears != null && (
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
                  {teacherProfile.experienceYears}+ Years Industry Exp.
                </span>
              )}
              {profileData?.createdAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  Joined {new Date(profileData.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          </div>

          {/* Quick Stats & Socials Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800">
            {hasSocialLinks ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  Socials:
                </span>
                {teacherProfile?.linkedinUrl && (
                  <a
                    href={teacherProfile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-[#F42A18] hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
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
                    className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-[#F42A18] hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
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
                    className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-[#F42A18] hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    title="Website"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ) : (
              <span className="text-xs text-neutral-400 italic">No social profiles attached</span>
            )}
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-4 mt-6 border-b border-neutral-100 dark:border-neutral-800">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer ${activeTab === "overview"
                ? "border-[#F42A18] text-[#F42A18] dark:text-[#F42A18]"
                : "border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                }`}
            >
              <User className="w-4 h-4" />
              Instructor Overview
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer ${activeTab === "edit"
                ? "border-[#F42A18] text-[#F42A18] dark:text-[#F42A18]"
                : "border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                }`}
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Maximum Submissions Reached Banner */}
      {isSubmissionMaxed && (currentApprovalStatus === "PENDING" || currentApprovalStatus === "REDO") && (
        <div className="p-5 rounded-3xl border border-red-500/30 bg-red-500/10 text-red-900 dark:text-red-200 flex flex-col sm:flex-row items-start gap-4 shadow-xs text-left">
          <div className="p-2.5 rounded-2xl bg-red-500/20 text-red-600 dark:text-red-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
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
          className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-start gap-4 text-left shadow-xs ${currentApprovalStatus === "REVOKED"
            ? "bg-rose-500/10 border-rose-500/25 text-rose-900 dark:text-rose-200"
            : "bg-orange-500/10 border-orange-500/25 text-orange-900 dark:text-orange-200"
            }`}
        >
          <div
            className={`p-2.5 rounded-2xl shrink-0 ${currentApprovalStatus === "REVOKED"
              ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
              : "bg-orange-500/20 text-orange-600 dark:text-orange-400"
              }`}
          >
            {currentApprovalStatus === "REVOKED" ? (
              <UserX className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>

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
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${currentApprovalStatus === "REVOKED"
                  ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30"
                  : "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30"
                  }`}
              >
                {currentApprovalStatus.replace("_", " ")}
              </span>
            </div>

            {teacherProfile?.rejectionReason && (
              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 space-y-1">
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

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          {/* Main Info (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[#F42A18]" />
                Instructor Biography
              </h2>
              {userProfile?.bio ? (
                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                  {userProfile.bio}
                </p>
              ) : (
                <p className="text-xs text-neutral-400 italic">
                  No biography provided yet. Click "Edit Profile" to add your teaching philosophy and background.
                </p>
              )}
            </div>

            {/* Qualifications */}
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#F42A18]" />
                Qualifications & Credentials
              </h2>
              {teacherProfile?.qualifications ? (
                <div className="flex items-start gap-3.5 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800">
                  <div className="p-2 rounded-lg bg-[#F42A18]/10 text-[#F42A18] shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {teacherProfile.qualifications}
                    </h3>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-400 italic">
                  No qualifications listed yet. Click "Edit Profile" to add your academic degrees or certifications.
                </p>
              )}
            </div>

            {/* Domains of Expertise */}
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#F42A18]" />
                  Domains of Expertise
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className="text-xs text-[#F42A18] hover:underline font-semibold cursor-pointer"
                >
                  Edit domains
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {teacherProfile?.expertise && teacherProfile.expertise.length > 0 ? (
                  teacherProfile.expertise.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-100 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-neutral-700/60"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-neutral-400 italic">
                    No domains of expertise added yet. Click "Edit Profile" to add your technical specializations.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Account Details Side Column (1 col) */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Instructor Details</h2>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/80">
                  <span className="text-neutral-500">Instructor Status</span>
                  <Badge
                    className={
                      currentApprovalStatus === "VERIFIED"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]"
                        : currentApprovalStatus === "IN_PROGRESS"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px]"
                          : currentApprovalStatus === "REDO"
                            ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 text-[10px]"
                            : currentApprovalStatus === "REVOKED"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px]"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]"
                    }
                  >
                    {currentApprovalStatus.replace("_", " ")}
                  </Badge>
                </div>
                {profileData?.createdAt && (
                  <div className="flex items-center justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/80">
                    <span className="text-neutral-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      Member Since
                    </span>
                    <span className="text-neutral-600 dark:text-neutral-400 text-[11px]">
                      {new Date(profileData.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {profileData?.updatedAt && (
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-neutral-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      Last Synchronized
                    </span>
                    <span className="text-neutral-600 dark:text-neutral-400 text-[11px]">
                      {new Date(profileData.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Edit Instructor Profile Form */}
      {activeTab === "edit" && (
        <form onSubmit={handleSaveChanges} className="space-y-6 text-left">
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Edit Instructor Profile</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Manage your instructor details, credentials, and social links.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Display Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g. Ada Lovelace"
                  className={`rounded-xl ${fieldErrors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  required
                />
                {fieldErrors.name && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* Email (Readonly) */}
              <div className="space-y-2">
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

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className={`rounded-xl ${fieldErrors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              {/* Experience Years */}
              <div className="space-y-2">
                <Label htmlFor="experienceYears" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Industry Experience (Years)
                </Label>
                <Input
                  id="experienceYears"
                  type="number"
                  min={0}
                  max={80}
                  value={formData.experienceYears}
                  onChange={(e) => handleInputChange("experienceYears", parseInt(e.target.value) || 0)}
                  className={`rounded-xl ${fieldErrors.experienceYears ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {fieldErrors.experienceYears && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {fieldErrors.experienceYears}
                  </p>
                )}
              </div>

              {/* Avatar Image Input */}
              <div className="sm:col-span-2">
                <ImageUploadInput
                  id="avatar"
                  label="Instructor Profile Picture"
                  value={formData.avatar}
                  onChange={(val: string) => handleInputChange("avatar", val)}
                  fallbackName={formData.name || profileData?.name}
                  inputRef={fileInputRef}
                />
              </div>

              {/* Qualifications */}
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="qualifications" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Qualifications & Academic Credentials
                </Label>
                <Input
                  id="qualifications"
                  value={formData.qualifications}
                  onChange={(e) => handleInputChange("qualifications", e.target.value)}
                  placeholder="e.g. Ph.D. in Computer Science • MIT"
                  className={`rounded-xl ${fieldErrors.qualifications ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {fieldErrors.qualifications && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {fieldErrors.qualifications}
                  </p>
                )}
              </div>

              {/* Bio */}
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="bio" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Biography & Background
                </Label>
                <textarea
                  id="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Share your industry experience, background, and teaching focus..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-hidden focus:ring-2 text-neutral-900 dark:text-white ${fieldErrors.bio
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-neutral-200 dark:border-neutral-800 focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
                    }`}
                />
                {fieldErrors.bio && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {fieldErrors.bio}
                  </p>
                )}
              </div>

              {/* LinkedIn URL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="linkedinUrl" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    LinkedIn URL
                    {(currentApprovalStatus === "IN_PROGRESS" || currentApprovalStatus === "VERIFIED" || teacherProfile?.isApproved) && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                        <Lock className="w-3 h-3" /> Locked ({currentApprovalStatus === "IN_PROGRESS" ? "In Progress" : "Approved"})
                      </span>
                    )}
                  </Label>
                </div>
                <Input
                  id="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  disabled={currentApprovalStatus === "IN_PROGRESS" || currentApprovalStatus === "VERIFIED" || Boolean(teacherProfile?.isApproved)}
                  className={`rounded-xl ${fieldErrors.linkedinUrl ? "border-red-500 focus-visible:ring-red-500" : ""
                    } ${currentApprovalStatus === "IN_PROGRESS" || currentApprovalStatus === "VERIFIED" || teacherProfile?.isApproved ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed" : ""}`}
                />
                {fieldErrors.linkedinUrl && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {fieldErrors.linkedinUrl}
                  </p>
                )}
                {(currentApprovalStatus === "IN_PROGRESS" || currentApprovalStatus === "VERIFIED" || teacherProfile?.isApproved) && (
                  <p className="text-[11px] text-neutral-400">
                    {currentApprovalStatus === "IN_PROGRESS"
                      ? "LinkedIn URL cannot be modified while your application is under evaluation (In Progress)."
                      : "LinkedIn URL cannot be changed after instructor account verification."}
                  </p>
                )}
              </div>

              {/* Twitter / X URL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="twitterUrl" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    Twitter / X URL
                    {(currentApprovalStatus === "IN_PROGRESS" || currentApprovalStatus === "VERIFIED" || teacherProfile?.isApproved) && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                        <Lock className="w-3 h-3" /> Locked ({currentApprovalStatus === "IN_PROGRESS" ? "In Progress" : "Approved"})
                      </span>
                    )}
                  </Label>
                </div>
                <Input
                  id="twitterUrl"
                  value={formData.twitterUrl}
                  onChange={(e) => handleInputChange("twitterUrl", e.target.value)}
                  placeholder="https://x.com/..."
                  disabled={currentApprovalStatus === "IN_PROGRESS" || currentApprovalStatus === "VERIFIED" || Boolean(teacherProfile?.isApproved)}
                  className={`rounded-xl ${fieldErrors.twitterUrl ? "border-red-500 focus-visible:ring-red-500" : ""
                    } ${currentApprovalStatus === "IN_PROGRESS" || currentApprovalStatus === "VERIFIED" || teacherProfile?.isApproved ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed" : ""}`}
                />
                {fieldErrors.twitterUrl && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {fieldErrors.twitterUrl}
                  </p>
                )}
                {(currentApprovalStatus === "IN_PROGRESS" || currentApprovalStatus === "VERIFIED" || teacherProfile?.isApproved) && (
                  <p className="text-[11px] text-neutral-400">
                    {currentApprovalStatus === "IN_PROGRESS"
                      ? "Twitter / X URL cannot be modified while your application is under evaluation (In Progress)."
                      : "Twitter / X URL cannot be changed after instructor account verification."}
                  </p>
                )}
              </div>

              {/* Website URL */}
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="websiteUrl" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Portfolio / Personal Website URL
                </Label>
                <Input
                  id="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                  placeholder="https://yourportfolio.io"
                  className={`rounded-xl ${fieldErrors.websiteUrl ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {fieldErrors.websiteUrl && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {fieldErrors.websiteUrl}
                  </p>
                )}
              </div>

              {/* Expertise Areas */}
              <div className="sm:col-span-2 space-y-3" ref={dropdownRef}>
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#F42A18]" />
                    Domains of Expertise (Standardized Topics)
                  </Label>
                  <span className="text-[11px] font-medium text-neutral-400">
                    {formData.expertise.length} / 15 selected
                  </span>
                </div>

                {/* Selected Tags Display */}
                <div className="flex flex-wrap gap-2 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 min-h-12 items-center">
                  {formData.expertise.length > 0 ? (
                    formData.expertise.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-[#F42A18]/10 text-[#F42A18] dark:text-[#ff6b5e] border border-[#F42A18]/25 shadow-2xs transition-all hover:bg-[#F42A18]/15"
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
                      No expertise domains selected yet. Search or click on the suggestions below to add.
                    </span>
                  )}
                </div>
                {fieldErrors.expertise && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {fieldErrors.expertise}
                  </p>
                )}

                {/* Search & Selection Dropdown */}
                <div className="relative">
                  <div className="relative">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      value={expertiseSearch}
                      onChange={(e) => {
                        setExpertiseSearch(e.target.value)
                        setIsDropdownOpen(true)
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      placeholder="Search standardized domains (e.g. Distributed Systems, Machine Learning, Rust)..."
                      className="pl-9 pr-9 rounded-xl text-xs"
                    />
                    {expertiseSearch && (
                      <button
                        type="button"
                        onClick={() => setExpertiseSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

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

                      {/* Filtered list of categories & tags */}
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
                          No matching standard domains found for &quot;{expertiseSearch}&quot;.
                          <p className="text-[11px] text-neutral-500 mt-1">
                            Please select from the standardized list above.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Popular / Quick Suggestion Chips */}
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
                              : "bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200/60 dark:border-neutral-800"
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
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetForm}
                disabled={updateMutation.isPending}
                className="gap-2 rounded-xl text-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="gap-2 rounded-xl text-xs bg-[#F42A18] hover:bg-[#d92212] text-white cursor-pointer"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

export default TeacherProfilePage
