import React, { useState, useEffect, useRef } from "react"
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit3,
  Camera,
  Save,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ImageUploadInput } from "@/components/common"
import { toast } from "@/lib/toast"
import { useProfile, useUpdateStudentProfile } from "../hooks/useProfile"
import { validateStudentForm } from "../schemas/profile.schema"

interface StudentFormData {
  name: string
  avatar: string
  phone: string
  bio: string
}

export const StudentProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "edit">("overview")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data: profileData, isLoading, isError, error, refetch } = useProfile()
  const updateMutation = useUpdateStudentProfile()

  const [formData, setFormData] = useState<StudentFormData>({
    name: "",
    avatar: "",
    phone: "",
    bio: "",
  })

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof StudentFormData, string>>>({})

  // Sync form state when backend profile data is loaded or updated
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        avatar: profileData.profile?.avatar || "",
        phone: profileData.profile?.phone || "",
        bio: profileData.profile?.bio || "",
      })
      setFieldErrors({})
    }
  }, [profileData])

  const handleInputChange = (field: keyof StudentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()

    const clientErrors = validateStudentForm(formData)
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
      })
      setActiveTab("overview")
    } catch (err: any) {
      if (err?.data?.errors && Array.isArray(err.data.errors)) {
        const backendErrors: Partial<Record<keyof StudentFormData, string>> = {}
        err.data.errors.forEach((e: { field: string; message: string }) => {
          if (e.field && e.message) {
            backendErrors[e.field as keyof StudentFormData] = e.message
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
      })
      setFieldErrors({})
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-[#F42A18] animate-spin" />
        <p className="text-sm font-medium text-neutral-500">Loading student profile...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20">
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          {(error as any)?.message || "Failed to load student profile"}
        </p>
        <Button onClick={() => refetch()} variant="outline" className="gap-2 rounded-xl text-xs cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </Button>
      </div>
    )
  }

  const profile = profileData?.profile
  const avatarUrl =
    profile?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.name || "Student")}&background=F42A18&color=fff`

  return (
    <div className="flex flex-1 flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/80 shadow-xs">
        {/* Banner Gradient */}
        <div className="h-36 sm:h-44 w-full bg-linear-to-r from-neutral-950 via-neutral-900 to-[#F42A18]/80 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(244,42,24,0.3),transparent_60%)]" />
        </div>

        {/* Profile Info Section */}
        <div className="px-6 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            {/* Avatar */}
            <div className="relative group">
              <img
                src={avatarUrl}
                alt={profileData?.name || "Student Avatar"}
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

            {/* Actions */}
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
                {profileData?.role || "STUDENT"}
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
              {profile?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  {profile.phone}
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

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 mt-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer ${activeTab === "overview"
                  ? "border-[#F42A18] text-[#F42A18] dark:text-[#F42A18]"
                  : "border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                }`}
            >
              <User className="w-4 h-4" />
              Profile Overview
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

      {/* Tab: Profile Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          {/* Main Info (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[#F42A18]" />
                Biography
              </h2>
              {profile?.bio ? (
                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-xs text-neutral-400 italic">
                  No biography provided yet. Click "Edit Profile" to tell others about yourself.
                </p>
              )}
            </div>
          </div>

          {/* Account Metadata Side Column (1 col) */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Account Details</h2>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/80">
                  <span className="text-neutral-500">Auth Method</span>
                  <Badge variant="outline" className="text-[10px] font-semibold">
                    {profileData?.authProvider}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/80">
                  <span className="text-neutral-500">Role</span>
                  <Badge variant="secondary" className="text-[10px] font-semibold">
                    {profileData?.role}
                  </Badge>
                </div>

                {profileData?.createdAt && (
                  <div className="flex items-center justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800/80">
                    <span className="text-neutral-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      Created
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
                      Last Updated
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

      {/* Tab: Edit Profile Form */}
      {activeTab === "edit" && (
        <form onSubmit={handleSaveChanges} className="space-y-6 text-left">
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Edit Profile Information</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Update your personal profile details. Changes will be saved directly to your account.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Your full name"
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
              <div className="sm:col-span-2 space-y-2">
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

              {/* Avatar Image Input */}
              <div className="sm:col-span-2">
                <ImageUploadInput
                  id="avatar"
                  label="Profile Picture"
                  value={formData.avatar}
                  onChange={(val) => handleInputChange("avatar", val)}
                  fallbackName={formData.name || profileData?.name}
                  inputRef={fileInputRef}
                />
              </div>

              {/* Bio */}
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="bio" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Biography
                </Label>
                <textarea
                  id="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Write a brief bio about your background and interests..."
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

export default StudentProfilePage
