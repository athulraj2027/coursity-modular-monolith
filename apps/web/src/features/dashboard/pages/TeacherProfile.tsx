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
  Hash,
  Fingerprint,
  Calendar,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ImageUploadInput } from "@/components/common"
import { useProfile, useUpdateTeacherProfile } from "../hooks/useProfile"

interface TeacherFormData {
  name: string
  avatar: string
  phone: string
  headline: string
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
  const { data: profileData, isLoading, isError, error, refetch } = useProfile()
  const updateMutation = useUpdateTeacherProfile()

  const [formData, setFormData] = useState<TeacherFormData>({
    name: "",
    avatar: "",
    phone: "",
    headline: "",
    qualifications: "",
    experienceYears: 0,
    bio: "",
    linkedinUrl: "",
    twitterUrl: "",
    websiteUrl: "",
    expertise: [],
  })

  const [newTag, setNewTag] = useState("")

  // Sync form state when backend profile data is loaded or updated
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        avatar: profileData.teacherProfile?.avatar || "",
        phone: profileData.teacherProfile?.phone || "",
        headline: profileData.teacherProfile?.headline || "",
        qualifications: profileData.teacherProfile?.qualifications || "",
        experienceYears: profileData.teacherProfile?.experienceYears ?? 0,
        bio: profileData.teacherProfile?.bio || "",
        linkedinUrl: profileData.teacherProfile?.linkedinUrl || "",
        twitterUrl: profileData.teacherProfile?.twitterUrl || "",
        websiteUrl: profileData.teacherProfile?.websiteUrl || "",
        expertise: profileData.teacherProfile?.expertise || [],
      })
    }
  }, [profileData])

  const handleInputChange = (field: keyof TeacherFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddExpertise = () => {
    const trimmed = newTag.trim()
    if (!trimmed) return
    if (!formData.expertise.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        expertise: [...prev.expertise, trimmed],
      }))
    }
    setNewTag("")
  }

  const handleRemoveExpertise = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.filter((t) => t !== tagToRemove),
    }))
  }

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateMutation.mutateAsync({
        name: formData.name.trim(),
        avatar: formData.avatar ? formData.avatar.trim() : null,
        phone: formData.phone ? formData.phone.trim() : null,
        headline: formData.headline ? formData.headline.trim() : null,
        qualifications: formData.qualifications ? formData.qualifications.trim() : null,
        experienceYears: Number(formData.experienceYears) || 0,
        bio: formData.bio ? formData.bio.trim() : null,
        linkedinUrl: formData.linkedinUrl ? formData.linkedinUrl.trim() : null,
        twitterUrl: formData.twitterUrl ? formData.twitterUrl.trim() : null,
        websiteUrl: formData.websiteUrl ? formData.websiteUrl.trim() : null,
        expertise: formData.expertise,
      })
      setActiveTab("overview")
    } catch {
      // Toast handled via useMutation's onError handler
    }
  }

  const handleResetForm = () => {
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        avatar: profileData.teacherProfile?.avatar || "",
        phone: profileData.teacherProfile?.phone || "",
        headline: profileData.teacherProfile?.headline || "",
        qualifications: profileData.teacherProfile?.qualifications || "",
        experienceYears: profileData.teacherProfile?.experienceYears ?? 0,
        bio: profileData.teacherProfile?.bio || "",
        linkedinUrl: profileData.teacherProfile?.linkedinUrl || "",
        twitterUrl: profileData.teacherProfile?.twitterUrl || "",
        websiteUrl: profileData.teacherProfile?.websiteUrl || "",
        expertise: profileData.teacherProfile?.expertise || [],
      })
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

  const teacherProfile = profileData?.teacherProfile
  const avatarUrl =
    teacherProfile?.avatar ||
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
            {teacherProfile?.isApproved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Verified & Approved Instructor
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-500/30">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Pending Verification
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
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
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

            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {teacherProfile?.headline || "Instructor at Coursity"}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                {profileData?.email}
              </span>
              {teacherProfile?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  {teacherProfile.phone}
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

          {/* Social Links Bar */}
          {hasSocialLinks && (
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
              {teacherProfile?.linkedinUrl && (
                <a
                  href={teacherProfile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-[#F42A18] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  LinkedIn
                </a>
              )}
              {teacherProfile?.twitterUrl && (
                <a
                  href={teacherProfile.twitterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-[#F42A18] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Twitter / X
                </a>
              )}
              {teacherProfile?.websiteUrl && (
                <a
                  href={teacherProfile.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-[#F42A18] transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Website
                </a>
              )}
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 mt-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === "overview"
                  ? "border-[#F42A18] text-[#F42A18] dark:text-[#F42A18]"
                  : "border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              <User className="w-4 h-4" />
              Instructor Overview
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === "edit"
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
              {teacherProfile?.bio ? (
                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                  {teacherProfile.bio}
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
                  <span className="text-neutral-500 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-neutral-400" />
                    User ID
                  </span>
                  <span className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300 truncate max-w-[150px]" title={profileData?.id}>
                    {profileData?.id}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/80">
                  <span className="text-neutral-500 flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-neutral-400" />
                    Profile ID
                  </span>
                  <span className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300 truncate max-w-[150px]" title={teacherProfile?.id || "None"}>
                    {teacherProfile?.id || "None"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/80">
                  <span className="text-neutral-500">Instructor Status</span>
                  <Badge className={teacherProfile?.isApproved ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]" : "bg-amber-500/10 text-amber-600 text-[10px]"}>
                    {teacherProfile?.isApproved ? "Approved" : "Pending Review"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/80">
                  <span className="text-neutral-500">Auth Method</span>
                  <Badge variant="outline" className="text-[10px] font-semibold">
                    {profileData?.authProvider}
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
                  className="rounded-xl"
                  required
                />
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
                  className="rounded-xl"
                />
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
                  max={60}
                  value={formData.experienceYears}
                  onChange={(e) => handleInputChange("experienceYears", parseInt(e.target.value) || 0)}
                  className="rounded-xl"
                />
              </div>

              {/* Avatar Image Input */}
              <div className="sm:col-span-2">
                <ImageUploadInput
                  id="avatar"
                  label="Instructor Profile Picture"
                  value={formData.avatar}
                  onChange={(val) => handleInputChange("avatar", val)}
                  fallbackName={formData.name || profileData?.name}
                  inputRef={fileInputRef}
                />
              </div>

              {/* Headline */}
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="headline" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Headline / Professional Title
                </Label>
                <Input
                  id="headline"
                  value={formData.headline}
                  onChange={(e) => handleInputChange("headline", e.target.value)}
                  placeholder="e.g. Lead Cloud Architect & Distributed Systems Instructor"
                  className="rounded-xl"
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
                  className="rounded-xl"
                />
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-hidden focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18] text-neutral-900 dark:text-white"
                />
              </div>

              {/* LinkedIn URL */}
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  LinkedIn URL
                </Label>
                <Input
                  id="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="rounded-xl"
                />
              </div>

              {/* Twitter / X URL */}
              <div className="space-y-2">
                <Label htmlFor="twitterUrl" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Twitter / X URL
                </Label>
                <Input
                  id="twitterUrl"
                  value={formData.twitterUrl}
                  onChange={(e) => handleInputChange("twitterUrl", e.target.value)}
                  placeholder="https://x.com/..."
                  className="rounded-xl"
                />
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
                  className="rounded-xl"
                />
              </div>

              {/* Expertise Areas */}
              <div className="sm:col-span-2 space-y-3">
                <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Domains of Expertise
                </Label>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 min-h-12 items-center">
                  {formData.expertise.length > 0 ? (
                    formData.expertise.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-300/60 dark:border-neutral-700"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveExpertise(tag)}
                          className="text-neutral-400 hover:text-[#F42A18] cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-neutral-400 italic">No expertise areas added yet.</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddExpertise()
                      }
                    }}
                    placeholder="Add an expertise area (e.g. Distributed Systems, Kubernetes, Rust)"
                    className="rounded-xl flex-1 text-xs"
                  />
                  <Button
                    type="button"
                    onClick={handleAddExpertise}
                    variant="outline"
                    className="rounded-xl gap-1 text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </Button>
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
