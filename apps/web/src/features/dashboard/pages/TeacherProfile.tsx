import React, { useState } from "react"
import {
  User,
  Mail,
  GraduationCap,
  Sparkles,
  MapPin,
  Award,
  BookOpen,
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
  DollarSign,
  Star,
  Users,
  Briefcase,
  ArrowUpRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface TeacherProfileState {
  name: string
  email: string
  phone: string
  headline: string
  bio: string
  qualifications: string
  experienceYears: number
  location: string
  avatar: string
  linkedinUrl: string
  twitterUrl: string
  websiteUrl: string
  expertise: string[]
}

const INITIAL_TEACHER_DATA: TeacherProfileState = {
  name: "Ada Lovelace",
  email: "ada@coursity.io",
  phone: "+1 (555) 948-2041",
  headline: "Lead Cloud Architect & Principal Distributed Systems Instructor",
  bio: "Ex-Senior Staff Engineer at CloudScale with 12+ years designing mission-critical distributed consensus layers, real-time streaming engines, and low-latency Kubernetes microservices. Mentored 1,400+ engineers into staff-level infrastructure roles.",
  qualifications: "Ph.D. in Computer Science (Distributed Systems) • MIT • 12+ Years Industry Leadership",
  experienceYears: 12,
  location: "Boston, MA",
  avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop",
  linkedinUrl: "https://linkedin.com/in/ada-lovelace",
  twitterUrl: "https://x.com/adalovelace_dev",
  websiteUrl: "https://adalovelace.io",
  expertise: [
    "Distributed Systems",
    "Go",
    "Rust",
    "Kubernetes",
    "Microservices",
    "PostgreSQL",
    "Raft & Paxos",
    "High-Throughput Streaming",
    "Event-Driven Architecture",
    "Kafka",
  ],
}

export const TeacherProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "edit" | "courses" | "payouts">("overview")
  const [profile, setProfile] = useState<TeacherProfileState>(INITIAL_TEACHER_DATA)
  const [formData, setFormData] = useState<TeacherProfileState>(INITIAL_TEACHER_DATA)
  const [newTag, setNewTag] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleInputChange = (field: keyof TeacherProfileState, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddExpertise = () => {
    if (!newTag.trim()) return
    if (!formData.expertise.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        expertise: [...prev.expertise, newTag.trim()],
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

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault()
    setProfile(formData)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
    setActiveTab("overview")
  }

  const handleResetForm = () => {
    setFormData(profile)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 w-full max-w-6xl mx-auto">
      {/* Toast Notification for Dummy Save */}
      {saveSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-xl shadow-emerald-900/20 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Teacher Studio Profile Updated</p>
            <p className="text-xs text-emerald-100">Profile data saved locally in demo mode.</p>
          </div>
        </div>
      )}

      {/* Hero Teacher Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/80 shadow-sm">
        {/* Banner Cover Pattern */}
        <div className="h-44 sm:h-56 w-full bg-linear-to-r from-neutral-950 via-neutral-900 to-[#F42A18]/90 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(244,42,24,0.4),transparent_65%)]" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Verified Instructor
            </span>
          </div>
        </div>

        {/* Profile Info Header */}
        <div className="px-6 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            {/* Avatar with Camera Icon */}
            <div className="relative group">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white dark:border-neutral-900 shadow-xl bg-neutral-100 dark:bg-neutral-800"
              />
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                title="Change Avatar"
                className="absolute bottom-2 right-2 p-2 rounded-xl bg-neutral-900/80 hover:bg-[#F42A18] text-white shadow-md backdrop-blur-xs transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Button
                variant={activeTab === "edit" ? "secondary" : "default"}
                onClick={() => setActiveTab(activeTab === "edit" ? "overview" : "edit")}
                className="flex-1 sm:flex-none gap-2 bg-[#F42A18] hover:bg-[#d92212] text-white cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                {activeTab === "edit" ? "View Public Profile" : "Edit Instructor Profile"}
              </Button>
            </div>
          </div>

          {/* User Details Headline */}
          <div className="space-y-1.5 text-left">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {profile.name}
              </h1>
              <Badge variant="secondary" className="bg-[#F42A18]/10 text-[#F42A18] border-[#F42A18]/20 font-semibold uppercase text-[11px] px-2.5 py-0.5">
                Instructor Studio
              </Badge>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                4.9 (280 reviews)
              </div>
            </div>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {profile.headline}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                {profile.email}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                {profile.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
                {profile.experienceYears}+ Years Industry Exp.
              </span>
            </div>
          </div>

          {/* Social Links Bar */}
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-[#F42A18] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                LinkedIn
              </a>
            )}
            {profile.twitterUrl && (
              <a
                href={profile.twitterUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-[#F42A18] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Twitter / X
              </a>
            )}
            {profile.websiteUrl && (
              <a
                href={profile.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-[#F42A18] transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                Portfolio Website
              </a>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 mt-6 overflow-x-auto no-scrollbar">
            {[
              { id: "overview", label: "Studio Overview", icon: User },
              { id: "edit", label: "Edit Instructor Profile", icon: Edit3 },
              { id: "courses", label: "Courses & Telemetry", icon: BookOpen },
              { id: "payouts", label: "Payouts & Verification", icon: DollarSign },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "border-[#F42A18] text-[#F42A18] dark:text-[#F42A18]"
                      : "border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          {/* Left 2 Cols: Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Card */}
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[#F42A18]" />
                Instructor Biography & Pedagogy
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {profile.bio}
              </p>
            </div>

            {/* Qualifications Card */}
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#F42A18]" />
                Qualifications & Credentials
              </h2>
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800">
                <div className="p-2.5 rounded-lg bg-[#F42A18]/10 text-[#F42A18]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {profile.qualifications}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Verified by Coursity Instructor Quality Board
                  </p>
                </div>
              </div>
            </div>

            {/* Core Technical Expertise Tags */}
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 shadow-xs space-y-4">
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
              <div className="flex flex-wrap gap-2">
                {profile.expertise.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-neutral-700/60 hover:border-[#F42A18]/40 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Instructor Stats & Performance */}
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F42A18]" />
                Instructor Telemetry
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 text-center">
                  <span className="text-2xl font-bold text-neutral-900 dark:text-white">1,420</span>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Active Students</p>
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 text-center">
                  <span className="text-2xl font-bold text-amber-500">4.9 ★</span>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Average Rating</p>
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 text-center">
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$14.2k</span>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Monthly Payout</p>
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 text-center">
                  <span className="text-2xl font-bold text-neutral-900 dark:text-white">5</span>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Live Cohorts</p>
                </div>
              </div>
            </div>

            {/* Instructor Details Card */}
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 shadow-xs space-y-3.5">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Profile & Contact Details</h2>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/80">
                  <span className="text-neutral-500">Studio Email</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{profile.email}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/80">
                  <span className="text-neutral-500">Direct Phone</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{profile.phone}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/80">
                  <span className="text-neutral-500">Location</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{profile.location}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-neutral-500">Instructor Status</span>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                    Verified & Active
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Edit Instructor Profile Form */}
      {activeTab === "edit" && (
        <form onSubmit={handleSaveChanges} className="space-y-6 text-left">
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Edit Instructor Profile</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Manage your public teaching studio, credentials, domains of expertise, and social links.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Instructor Display Name
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
                  Studio Email
                </Label>
                <Input
                  id="email"
                  value={formData.email}
                  disabled
                  className="rounded-xl bg-neutral-100 dark:bg-neutral-800 cursor-not-allowed text-neutral-500"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Direct Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="rounded-xl"
                />
              </div>

              {/* Experience (Years) */}
              <div className="space-y-2">
                <Label htmlFor="experienceYears" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Experience (Years)
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

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Location / City
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="e.g. Boston, MA"
                  className="rounded-xl"
                />
              </div>

              {/* Avatar URL */}
              <div className="space-y-2">
                <Label htmlFor="avatar" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Profile Photo URL
                </Label>
                <Input
                  id="avatar"
                  value={formData.avatar}
                  onChange={(e) => handleInputChange("avatar", e.target.value)}
                  placeholder="https://..."
                  className="rounded-xl"
                />
              </div>

              {/* Headline */}
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="headline" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Instructor Headline / Professional Title
                </Label>
                <Input
                  id="headline"
                  value={formData.headline}
                  onChange={(e) => handleInputChange("headline", e.target.value)}
                  placeholder="e.g. Lead Cloud Architect & Principal Distributed Systems Instructor"
                  className="rounded-xl"
                />
              </div>

              {/* Qualifications */}
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="qualifications" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Academic & Professional Qualifications
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
                  Detailed Bio & Background
                </Label>
                <textarea
                  id="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Share your industry experience, achievements, and teaching philosophy..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-hidden focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18] text-neutral-900 dark:text-white"
                />
              </div>

              {/* Social URLs */}
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

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="websiteUrl" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Personal / Portfolio Website URL
                </Label>
                <Input
                  id="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                  placeholder="https://yourportfolio.io"
                  className="rounded-xl"
                />
              </div>

              {/* Expertise Tags Manager */}
              <div className="sm:col-span-2 space-y-3">
                <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Domains of Expertise & Tech Stack
                </Label>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 min-h-12 items-center">
                  {formData.expertise.map((tag, idx) => (
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
                  ))}
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
                    placeholder="Add an expertise area (e.g. Distributed Systems, Kubernetes)"
                    className="rounded-xl flex-1 text-xs"
                  />
                  <Button
                    type="button"
                    onClick={handleAddExpertise}
                    variant="outline"
                    className="rounded-xl gap-1 text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Skill
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
                className="gap-2 rounded-xl text-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </Button>
              <Button
                type="submit"
                className="gap-2 rounded-xl text-xs bg-[#F42A18] hover:bg-[#d92212] text-white cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 3: Courses & Telemetry */}
      {activeTab === "courses" && (
        <div className="space-y-6 text-left">
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#F42A18]" />
                Authored Courses & Cohort Telemetry
              </h2>
              <Badge variant="outline" className="text-xs">3 Active Tracks</Badge>
            </div>
            <div className="space-y-4">
              {[
                {
                  title: "Mastering Distributed Consensus with Raft & Go",
                  students: 620,
                  rating: 4.9,
                  revenue: "$6,200/mo",
                  level: "Advanced",
                },
                {
                  title: "Production Kubernetes & Service Mesh at Scale",
                  students: 480,
                  rating: 4.95,
                  revenue: "$4,800/mo",
                  level: "Intermediate",
                },
                {
                  title: "High-Performance Systems Programming with Rust",
                  students: 320,
                  rating: 4.85,
                  revenue: "$3,250/mo",
                  level: "Advanced",
                },
              ].map((course, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-neutral-200/60 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{course.title}</h3>
                      <Badge variant="secondary" className="text-[10px] font-semibold">{course.level}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {course.students} enrolled</span>
                      <span className="flex items-center gap-1 text-amber-500 font-semibold"><Star className="w-3.5 h-3.5 fill-amber-500" /> {course.rating}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{course.revenue}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 cursor-pointer">
                    Studio Analytics
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Payouts & Verification */}
      {activeTab === "payouts" && (
        <div className="space-y-6 text-left">
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Instructor Payouts & Stripe Connect</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Your monthly creator revenue is deposited automatically on the 1st of every month.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-neutral-200/60 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
                <span className="text-xs text-neutral-500">Next Estimated Payout</span>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">$14,250.00</p>
                <span className="text-[11px] text-neutral-400 mt-1 block">Scheduled for Oct 1, 2026</span>
              </div>
              <div className="p-4 rounded-xl border border-neutral-200/60 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500">Connected Bank Account</span>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-0.5">Silicon Valley Bank •••• 4912</p>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Active & Verified</span>
                </div>
                <Badge variant="outline" className="text-xs">Stripe Connect</Badge>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherProfilePage
