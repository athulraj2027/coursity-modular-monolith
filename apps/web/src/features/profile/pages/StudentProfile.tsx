import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
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
  KeyRound,
  FileText,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ImageUploadInput, CountrySelect, PhoneInputWithCountry } from "@/components/common"
import { toast } from "@/lib/toast"
import { useProfile, useUpdateStudentProfile } from "../hooks/useProfile"
import { validateStudentForm } from "../schemas/profile.schema"

interface StudentFormData {
  name: string
  avatar: string
  phone: string
  country: string
  bio: string
}

export const StudentProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"overview" | "edit">("overview")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data: profileData, isLoading, isError, error, refetch } = useProfile()
  const updateMutation = useUpdateStudentProfile()

  const [formData, setFormData] = useState<StudentFormData>({
    name: "",
    avatar: "",
    phone: "",
    country: "",
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
        country: profileData.profile?.country || "",
        bio: profileData.profile?.bio || "",
      })
      setFieldErrors({})
    }
  }, [profileData])

  const handleInputChange = <K extends keyof StudentFormData>(field: K, value: StudentFormData[K]) => {
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
        country: formData.country.trim(),
        bio: formData.bio ? formData.bio.trim() : null,
      })
      setActiveTab("overview")
    } catch (err: unknown) {
      const errorObj = err as { data?: { errors?: { field: string; message: string }[] }; message?: string }
      if (errorObj?.data?.errors && Array.isArray(errorObj.data.errors)) {
        const backendErrors: Partial<Record<keyof StudentFormData, string>> = {}
        errorObj.data.errors.forEach((e: { field: string; message: string }) => {
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
        country: profileData.profile?.country || "",
        bio: profileData.profile?.bio || "",
      })
      setFieldErrors({})
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 w-full">
        <Loader2 className="w-8 h-8 text-[#F42A18] animate-spin" />
        <p className="text-sm font-medium text-neutral-500">Loading student profile...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 w-full">
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          {error instanceof Error ? error.message : "Failed to load student profile"}
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
    <div className="flex flex-1 flex-col w-full text-left space-y-8">
      {/* Profile Header (Single cohesive surface without artificial banners) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-5">
          {/* Avatar with quick edit trigger */}
          <div className="relative group shrink-0">
            <img
              src={avatarUrl}
              alt={profileData?.name || "Student Avatar"}
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

          {/* User info */}
          <div className="space-y-1.5">
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

            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
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
              {profile?.country && (
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-neutral-400" />
                  {profile.country}
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
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
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
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            activeTab === "overview"
              ? "border-[#F42A18] text-[#F42A18]"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          }`}
        >
          <User className="w-4 h-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            activeTab === "edit"
              ? "border-[#F42A18] text-[#F42A18]"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          }`}
        >
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </button>
        {profileData?.authProvider !== "GOOGLE" && (
          <button
            onClick={() => navigate("/students/password")}
            className="flex items-center gap-2 pb-3 text-sm font-semibold transition-all border-b-2 border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            Password & Security
          </button>
        )}
      </div>

      {/* Tab: Overview (Full-width clean single layout) */}
      {activeTab === "overview" && (
        <div className="w-full space-y-10">
          {/* Biography Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800/80">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#F42A18]" />
                Biography
              </h2>
              {!profile?.bio && (
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className="text-xs text-[#F42A18] hover:underline font-medium cursor-pointer"
                >
                  + Add bio
                </button>
              )}
            </div>
            {profile?.bio ? (
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line max-w-4xl">
                {profile.bio}
              </p>
            ) : (
              <p className="text-sm text-neutral-400 italic">
                No biography provided yet. Tell others about your learning goals and background.
              </p>
            )}
          </div>

          {/* Account & Security Details */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800/80">
              <KeyRound className="w-4 h-4 text-[#F42A18]" />
              Account & Profile Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
              <div className="space-y-1">
                <span className="text-xs text-neutral-400 font-medium">Full Name</span>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {profileData?.name || "—"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-neutral-400 font-medium">Email Address</span>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {profileData?.email || "—"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-neutral-400 font-medium">Phone Number</span>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {profile?.phone || "Not specified"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-neutral-400 font-medium">Country</span>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {profile?.country || "Not specified"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-neutral-400 font-medium">Role</span>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {profileData?.role || "STUDENT"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-neutral-400 font-medium">Authentication Provider</span>
                <div className="pt-0.5">
                  <Badge variant="outline" className="text-xs font-semibold">
                    {profileData?.authProvider}
                  </Badge>
                </div>
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
        </div>
      )}

      {/* Tab: Edit Profile Form (Full-width clean layout) */}
      {activeTab === "edit" && (
        <form onSubmit={handleSaveChanges} noValidate className="w-full space-y-8">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Edit Profile Details</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Update your personal profile information. Changes will reflect across your entire account.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Full Name */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="name" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Full Name <span className="text-[#F42A18]">*</span>
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
                placeholder="Your full name"
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
                  Country <span className="text-[#F42A18]">*</span>
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

            {/* Avatar Image Input */}
            <div className="md:col-span-2">
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
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="bio" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Biography <span className="text-[#F42A18]">*</span>
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
                placeholder="Write a brief bio about your background, interests, and learning goals..."
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-hidden focus:ring-2 text-neutral-900 dark:text-white ${
                  fieldErrors.bio
                    ? "border-[#F42A18] focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
                    : "border-neutral-200 dark:border-neutral-800 focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
                }`}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-neutral-200/80 dark:border-neutral-800">
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
        </form>
      )}
    </div>
  )
}

export default StudentProfilePage
