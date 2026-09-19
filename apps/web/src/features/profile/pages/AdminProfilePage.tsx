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
  Loader2,
  RefreshCw,
  AlertCircle,
  KeyRound,
  FileText,
  Shield,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ImageUploadInput, CountrySelect, PhoneInputWithCountry } from "@/components/common"
import { useConfirmDialog } from "@/hooks/useConfirmDialog"
import { toast } from "@/lib/toast"
import { useProfile, useUpdateStudentProfile } from "../hooks/useProfile"

interface AdminFormData {
  name: string
  avatar: string
  phone: string
  country: string
  bio: string
}

export const AdminProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { confirm, ConfirmDialog } = useConfirmDialog()
  const [activeTab, setActiveTab] = useState<"overview" | "edit">("overview")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data: profileData, isLoading, isError, error, refetch } = useProfile()
  const updateMutation = useUpdateStudentProfile()

  const [formData, setFormData] = useState<AdminFormData>({
    name: "",
    avatar: "",
    phone: "",
    country: "",
    bio: "",
  })

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof AdminFormData, string>>>({})

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

  const handleInputChange = <K extends keyof AdminFormData>(field: K, value: AdminFormData[K]) => {
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

    const errors: Partial<Record<keyof AdminFormData, string>> = {}
    if (!formData.name.trim()) {
      errors.name = "Full name is required"
    } else if (formData.name.trim().length < 2) {
      errors.name = "Full name must be at least 2 characters"
    }

    if (!formData.country.trim()) {
      errors.country = "Country is required"
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required"
    } else if (formData.phone.trim().length < 5) {
      errors.phone = "Phone number must be at least 5 digits"
    }

    if (!formData.bio.trim()) {
      errors.bio = "Biography & Notes is required"
    } else if (formData.bio.trim().length < 10) {
      errors.bio = "Biography must be at least 10 characters"
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      const first = Object.values(errors)[0]
      if (first) toast.error(first)
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
      toast.error(err instanceof Error ? err.message : "Failed to update admin profile")
    }
  }

  const handleResetForm = async () => {
    if (profileData) {
      const isDirty =
        formData.name !== (profileData.name || "") ||
        formData.avatar !== (profileData.profile?.avatar || "") ||
        formData.phone !== (profileData.profile?.phone || "") ||
        formData.country !== (profileData.profile?.country || "") ||
        formData.bio !== (profileData.profile?.bio || "")

      if (isDirty) {
        const confirmed = await confirm({
          actionType: "discard",
          title: "Discard Unsaved Changes?",
          description: "Are you sure you want to revert all changes made to your administrator profile?",
        })
        if (!confirmed) return
      }

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
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#F42A18]" />
        <p className="text-xs font-medium text-neutral-500">Loading administrator profile...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-6 text-center space-y-4 max-w-md mx-auto">
        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">Unable to Load Profile</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            {error instanceof Error ? error.message : "An unexpected error occurred while fetching your administrator account."}
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="gap-2 rounded-xl text-xs font-semibold cursor-pointer border-neutral-300 dark:border-neutral-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </Button>
      </div>
    )
  }

  const avatarUrl =
    formData.avatar ||
    profileData?.profile?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.name || "Admin")}&background=F42A18&color=fff`

  return (
    <div className="flex flex-1 flex-col w-full text-left space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-5">
          <div className="relative group shrink-0">
            <img
              src={avatarUrl}
              alt={profileData?.name || "Admin Avatar"}
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

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {profileData?.name}
              </h1>
              <Badge variant="secondary" className="bg-[#F42A18]/10 text-[#F42A18] border-[#F42A18]/20 font-semibold uppercase text-[11px] px-2.5 py-0.5 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Root Administrator
              </Badge>
              <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Superuser Access
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                {profileData?.email}
              </span>
              {profileData?.profile?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  {profileData.profile.phone}
                </span>
              )}
              {profileData?.profile?.country && (
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-neutral-400" />
                  {profileData.profile.country}
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

      {/* Tabs */}
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
          Administrator Overview
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
            onClick={() => navigate("/admin/password")}
            className="flex items-center gap-2 pb-3 text-sm font-semibold transition-all border-b-2 border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            Password & Security
          </button>
        )}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="w-full space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-6 space-y-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#F42A18]" />
                Administrator Biography
              </h2>
              {formData.bio ? (
                <p className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
                  {formData.bio}
                </p>
              ) : (
                <p className="text-xs text-neutral-400 italic">
                  No biography provided. Click "Edit Profile" to add details about your role and responsibilities.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-6 space-y-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Security & Platform Permissions
              </h2>
              <ul className="text-xs space-y-2 text-neutral-600 dark:text-neutral-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Full access to teacher vetting, interview reviews, and course approvals
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Student management and moderation permissions
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  AI Model Configuration & system cluster telemetry
                </li>
              </ul>
              {profileData?.authProvider !== "GOOGLE" && (
                <div className="pt-2">
                  <Button
                    onClick={() => navigate("/admin/password")}
                    variant="outline"
                    className="gap-2 rounded-xl text-xs font-semibold cursor-pointer border-neutral-200 dark:border-neutral-700"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#F42A18]" />
                    Change Password & Security
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Tab */}
      {activeTab === "edit" && (
        <form onSubmit={handleSaveChanges} noValidate className="space-y-6">
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-6 space-y-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Profile Avatar
              </Label>
              <ImageUploadInput
                id="adminAvatar"
                label="Admin Avatar"
                value={formData.avatar}
                onChange={(url) => handleInputChange("avatar", url)}
                fallbackName={formData.name || profileData?.name}
                inputRef={fileInputRef}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="adminName" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Full Name <span className="text-[#F42A18]">*</span>
                  </Label>
                  {fieldErrors.name && (
                    <span className="text-[11px] font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                      {fieldErrors.name}
                    </span>
                  )}
                </div>
                <Input
                  id="adminName"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Administrator Name"
                  className={`rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800/50 ${
                    fieldErrors.name ? "border-[#F42A18] focus-visible:ring-[#F42A18]/25" : ""
                  }`}
                  required
                />
              </div>

              {/* Country Selection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="adminCountry" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Country <span className="text-[#F42A18]">*</span>
                  </Label>
                  {fieldErrors.country && (
                    <span className="text-[11px] font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                      {fieldErrors.country}
                    </span>
                  )}
                </div>
                <CountrySelect
                  id="adminCountry"
                  value={formData.country}
                  onChange={(countryName) => handleInputChange("country", countryName)}
                  error={Boolean(fieldErrors.country)}
                  placeholder="Select country"
                />
              </div>

              {/* Phone with Country Code */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="adminPhone" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Contact Phone <span className="text-[#F42A18]">*</span>
                  </Label>
                  {fieldErrors.phone && (
                    <span className="text-[11px] font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                      {fieldErrors.phone}
                    </span>
                  )}
                </div>
                <PhoneInputWithCountry
                  id="adminPhone"
                  value={formData.phone}
                  country={formData.country}
                  onChange={(val) => handleInputChange("phone", val)}
                  onCountryChange={(countryName) => handleInputChange("country", countryName)}
                  error={Boolean(fieldErrors.phone)}
                  placeholder="555 000 0000"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="adminBio" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Administrator Bio & Notes <span className="text-[#F42A18]">*</span>
                </Label>
                {fieldErrors.bio && (
                  <span className="text-[11px] font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
                    {fieldErrors.bio}
                  </span>
                )}
              </div>
              <textarea
                id="adminBio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Write a brief overview of your role and responsibilities..."
                rows={4}
                className={`w-full rounded-xl text-xs p-3 bg-neutral-50 dark:bg-neutral-800/50 border ${
                  fieldErrors.bio
                    ? "border-[#F42A18] focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
                    : "border-neutral-200 dark:border-neutral-700 focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
                } focus:outline-none focus:ring-2`}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetForm}
              disabled={updateMutation.isPending}
              className="gap-1.5 rounded-xl text-xs font-semibold cursor-pointer border-neutral-200 dark:border-neutral-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Form
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="gap-2 rounded-xl text-xs font-semibold bg-[#F42A18] hover:bg-[#d92212] text-white cursor-pointer shadow-md shadow-[#F42A18]/20"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
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

      {/* Confirmation Dialog for Discarding Changes */}
      <ConfirmDialog />
    </div>
  )
}

export default AdminProfilePage
