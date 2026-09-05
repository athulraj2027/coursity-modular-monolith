import React, { useState } from "react"
import {
  User,
  Mail,
  GraduationCap,
  Sparkles,
  MapPin,
  Calendar,
  Flame,
  Award,
  BookOpen,
  CheckCircle2,
  Edit3,
  Camera,
  Plus,
  X,
  Save,
  RotateCcw,
  Shield,
  Code2,
  Layers,
  ArrowUpRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface StudentProfileState {
  name: string
  email: string
  phone: string
  headline: string
  bio: string
  education: string
  location: string
  avatar: string
  interests: string[]
}

const INITIAL_STUDENT_DATA: StudentProfileState = {
  name: "Alex Turing",
  email: "alex@example.com",
  phone: "+1 (555) 382-9102",
  headline: "Aspiring Distributed Systems & Full-Stack Engineer",
  bio: "Computer Science undergraduate eager to master scalable backend architectures, distributed protocols like Raft, and modern web application development. Currently enrolled in the Distributed Systems and Kubernetes cohorts.",
  education: "Stanford University • B.S. in Computer Science (2024 – 2028)",
  location: "San Francisco, CA",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
  interests: [
    "Distributed Systems",
    "TypeScript",
    "React",
    "Rust",
    "Docker",
    "PostgreSQL",
    "Next.js",
    "Kubernetes",
    "GraphQL",
    "System Design",
  ],
}

export const StudentProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "edit" | "achievements" | "security">("overview")
  const [profile, setProfile] = useState<StudentProfileState>(INITIAL_STUDENT_DATA)
  const [formData, setFormData] = useState<StudentProfileState>(INITIAL_STUDENT_DATA)
  const [newTag, setNewTag] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleInputChange = (field: keyof StudentProfileState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddInterest = () => {
    if (!newTag.trim()) return
    if (!formData.interests.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, newTag.trim()],
      }))
    }
    setNewTag("")
  }

  const handleRemoveInterest = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((t) => t !== tagToRemove),
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
            <p className="text-sm font-semibold">Changes Saved Successfully</p>
            <p className="text-xs text-emerald-100">Profile data updated locally in demo mode.</p>
          </div>
        </div>
      )}

      {/* Hero Profile Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/80 shadow-sm">
        {/* Banner Cover Gradient */}
        <div className="h-40 sm:h-52 w-full bg-linear-to-r from-neutral-900 via-neutral-800 to-[#F42A18]/80 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(244,42,24,0.35),transparent_60%)]" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-white border border-white/20">
              <Flame className="w-3.5 h-3.5 text-[#F42A18]" />
              14-Day Streak
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

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Button
                variant={activeTab === "edit" ? "secondary" : "default"}
                onClick={() => setActiveTab(activeTab === "edit" ? "overview" : "edit")}
                className="flex-1 sm:flex-none gap-2 bg-[#F42A18] hover:bg-[#d92212] text-white cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                {activeTab === "edit" ? "View Overview" : "Edit Profile"}
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
                Student
              </Badge>
              <Badge variant="outline" className="text-neutral-500 dark:text-neutral-400 text-xs">
                Class of 2028
              </Badge>
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
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                Member since Sep 2025
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 mt-6 overflow-x-auto no-scrollbar">
            {[
              { id: "overview", label: "Overview & Bio", icon: User },
              { id: "edit", label: "Edit Profile", icon: Edit3 },
              { id: "achievements", label: "Learning & Badges", icon: Award },
              { id: "security", label: "Account & Security", icon: Shield },
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
                About Me
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {profile.bio}
              </p>
            </div>

            {/* Education & Academic Card */}
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#F42A18]" />
                Education & Academic Institution
              </h2>
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800">
                <div className="p-2.5 rounded-lg bg-[#F42A18]/10 text-[#F42A18]">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {profile.education}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Verified Student Credentials • GPA 3.9 / 4.0
                  </p>
                </div>
              </div>
            </div>

            {/* Interests & Technical Skills Card */}
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#F42A18]" />
                  Interests & Topic Focus
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className="text-xs text-[#F42A18] hover:underline font-semibold cursor-pointer"
                >
                  Manage tags
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60 hover:border-[#F42A18]/40 transition-colors"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Quick Metrics & Learning Summary */}
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F42A18]" />
                Learning Telemetry
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 text-center">
                  <span className="text-2xl font-bold text-neutral-900 dark:text-white">38.5h</span>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Hours Studied</p>
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 text-center">
                  <span className="text-2xl font-bold text-neutral-900 dark:text-white">6 / 8</span>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Labs Completed</p>
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 text-center">
                  <span className="text-2xl font-bold text-[#F42A18]">14</span>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Day Streak</p>
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 text-center">
                  <span className="text-2xl font-bold text-neutral-900 dark:text-white">4</span>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Certificates</p>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 shadow-xs space-y-3.5">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Contact & Profile Data</h2>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/80">
                  <span className="text-neutral-500">Email</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{profile.email}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/80">
                  <span className="text-neutral-500">Phone</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{profile.phone}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/80">
                  <span className="text-neutral-500">Location</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{profile.location}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-neutral-500">Auth Method</span>
                  <Badge variant="outline" className="text-[10px] font-semibold">Local Password</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Edit Profile Form */}
      {activeTab === "edit" && (
        <form onSubmit={handleSaveChanges} className="space-y-6 text-left">
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Edit Student Profile</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Update your public student credentials, bio, and academic background.
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
                  placeholder="e.g. Alex Turing"
                  className="rounded-xl"
                  required
                />
              </div>

              {/* Email (Readonly) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Email Address
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

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Location / City
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="rounded-xl"
                />
              </div>

              {/* Avatar URL */}
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="avatar" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Avatar Image URL
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
                  Profile Headline / Subtitle
                </Label>
                <Input
                  id="headline"
                  value={formData.headline}
                  onChange={(e) => handleInputChange("headline", e.target.value)}
                  placeholder="e.g. Aspiring Distributed Systems Engineer"
                  className="rounded-xl"
                />
              </div>

              {/* Education */}
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="education" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Education / University
                </Label>
                <Input
                  id="education"
                  value={formData.education}
                  onChange={(e) => handleInputChange("education", e.target.value)}
                  placeholder="e.g. Stanford University • B.S. in Computer Science"
                  className="rounded-xl"
                />
              </div>

              {/* Bio */}
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="bio" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  About Bio
                </Label>
                <textarea
                  id="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell instructors and fellow students about your goals..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-hidden focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18] text-neutral-900 dark:text-white"
                />
              </div>

              {/* Interests Tag Input */}
              <div className="sm:col-span-2 space-y-3">
                <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Interests & Topics
                </Label>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 min-h-12 items-center">
                  {formData.interests.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-300/60 dark:border-neutral-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(tag)}
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
                        handleAddInterest()
                      }
                    }}
                    placeholder="Type an interest and press Add (e.g. Rust, Docker)"
                    className="rounded-xl flex-1 text-xs"
                  />
                  <Button
                    type="button"
                    onClick={handleAddInterest}
                    variant="outline"
                    className="rounded-xl gap-1 text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Tag
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

      {/* Tab 3: Learning Journey & Achievements */}
      {activeTab === "achievements" && (
        <div className="space-y-6 text-left">
          {/* Enrolled Courses / Tracks */}
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#F42A18]" />
              Enrolled Tracks & Course Progress
            </h2>
            <div className="space-y-4">
              {[
                {
                  title: "Distributed Consensus with Raft & Go",
                  instructor: "Prof. Ada Lovelace",
                  progress: 78,
                  status: "In Progress",
                  badge: "Advanced",
                },
                {
                  title: "Full-Stack TypeScript & React Architecture",
                  instructor: "Sarah Jenkins",
                  progress: 100,
                  status: "Completed",
                  badge: "Certificate Earned",
                },
                {
                  title: "Production Kubernetes & Docker Sandboxing",
                  instructor: "David Miller",
                  progress: 45,
                  status: "In Progress",
                  badge: "Intermediate",
                },
              ].map((course, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-neutral-200/60 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{course.title}</h3>
                      <Badge variant="secondary" className="text-[10px] font-semibold">
                        {course.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Instructor: {course.instructor}</p>
                    {/* Progress Bar */}
                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 max-w-md mt-2">
                      <div
                        className="bg-[#F42A18] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">{course.progress}%</span>
                    <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 cursor-pointer">
                      Continue
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges and Honors */}
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#F42A18]" />
              Earned Badges & Milestones
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Speed Coder", desc: "Completed 50+ sandboxed labs in record time", icon: Code2, color: "text-amber-500 bg-amber-500/10" },
                { title: "Raft Pioneer", desc: "Passed all leader election & log replication tests", icon: Layers, color: "text-blue-500 bg-blue-500/10" },
                { title: "14-Day Streak", desc: "Consistently coded every single day for two weeks", icon: Flame, color: "text-[#F42A18] bg-[#F42A18]/10" },
                { title: "Peer Helper", desc: "Answered 20+ discussion threads in cohort", icon: Sparkles, color: "text-purple-500 bg-purple-500/10" },
              ].map((badge, idx) => {
                const Icon = badge.icon
                return (
                  <div key={idx} className="p-4 rounded-xl border border-neutral-200/60 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-left space-y-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${badge.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-bold text-neutral-900 dark:text-white">{badge.title}</h3>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">{badge.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security & Preferences */}
      {activeTab === "security" && (
        <div className="space-y-6 text-left">
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Security & Password</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Manage your student account authentication credentials and session security.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-xs font-semibold">Current Password</Label>
                <Input type="password" placeholder="••••••••••••" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">New Password</Label>
                <Input type="password" placeholder="••••••••••••" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Confirm Password</Label>
                <Input type="password" placeholder="••••••••••••" className="rounded-xl" />
              </div>
              <div className="sm:col-span-2 pt-2">
                <Button type="button" className="bg-[#F42A18] hover:bg-[#d92212] text-white rounded-xl text-xs cursor-pointer">
                  Update Password
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentProfilePage
