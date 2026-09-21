import React, { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Shield,
  ShieldCheck,
  GraduationCap,
  Globe,
  Mail,
  Calendar,
  Clock,
  Ban,
  Phone,
  Briefcase,
  Award,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  UserX,
  RotateCcw,
  MessageSquare,
  SlidersHorizontal,
  ChevronRight,
  Check,
  BookOpen,
  FileText,
  Eye,
  FileCheck,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser, useBlockUser, useApproveTeacher } from "../hooks/useUsers";
import { useAdminCourses } from "@/features/course/hooks/useCourses";
import { VerifyTeacherModal } from "@/components/common/VerifyTeacherModal";
import { BlockUserModal } from "@/components/common/BlockUserModal";
import { FileDocumentCard, FilePreviewModal } from "@/components/common/FileDocumentCard";
import type { ApprovalStatus } from "../types/user-management.types";
import { normalizeQualifications } from "@/features/profile/types/profile.types";
import { toast } from "@/lib/toast";

interface FilePreviewState {
  isOpen: boolean;
  title: string;
  url: string;
  type?: "pdf" | "image" | "document";
}

export const AdminUserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "qualifications" | "system">("overview");
  const [copiedId, setCopiedId] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [targetApprovalStatus, setTargetApprovalStatus] = useState<ApprovalStatus | undefined>(undefined);

  // In-app file viewer modal state
  const [filePreview, setFilePreview] = useState<FilePreviewState>({
    isOpen: false,
    title: "",
    url: "",
    type: "document",
  });

  // Fetch User Details
  const { data: user, isLoading, isError, error, refetch } = useUser(id || "");

  // Fetch Courses (if user is teacher or to see catalog)
  const { data: allCoursesData } = useAdminCourses({
    includeDeleted: true,
    limit: 150,
  });

  const blockUserMutation = useBlockUser();
  const approveTeacherMutation = useApproveTeacher();

  const handleCopyId = () => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success("User ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleConfirmBlock = async () => {
    if (!id) return;
    await blockUserMutation.mutateAsync(id);
    setIsBlockModalOpen(false);
    refetch();
  };

  const handleConfirmApprove = async (data: {
    approvalStatus: ApprovalStatus;
    isApproved: boolean;
    rejectionReason?: string | null;
  }) => {
    if (!id) return;
    await approveTeacherMutation.mutateAsync({
      id,
      approvalStatus: data.approvalStatus,
      isApproved: data.isApproved,
      rejectionReason: data.rejectionReason || null,
    });
    setIsVerifyModalOpen(false);
    refetch();
  };

  const openFileViewer = (url: string, title: string) => {
    const isPdf = url.toLowerCase().includes(".pdf");
    const isImg =
      url.toLowerCase().includes(".jpg") ||
      url.toLowerCase().includes(".jpeg") ||
      url.toLowerCase().includes(".png") ||
      url.toLowerCase().includes(".webp") ||
      url.toLowerCase().includes(".gif") ||
      url.includes("image");

    setFilePreview({
      isOpen: true,
      title,
      url,
      type: isPdf ? "pdf" : isImg ? "image" : "document",
    });
  };

  // Find instructor's courses if role is TEACHER
  const instructorCourses = useMemo(() => {
    if (!allCoursesData?.items || !user) return [];
    return allCoursesData.items.filter(
      (course) =>
        course.teacherProfileId === user.profile?.teacherProfile?.id
    );
  }, [allCoursesData, user]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-[#F42A18] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-neutral-500 font-medium">Loading user profile details...</p>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Button>
        <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">User Record Not Found</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {error instanceof Error ? error.message : "The requested user record could not be loaded."}
          </p>
          <Button onClick={() => refetch()} variant="outline" className="mt-2">
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  const profile = user.profile;
  const teacherProfile = profile?.teacherProfile;
  const isTeacher = user.role === "TEACHER";
  const approvalStatus: ApprovalStatus =
    teacherProfile?.approvalStatus ||
    (teacherProfile?.isApproved ? "VERIFIED" : "PENDING");

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "UR";

  const qualifications = normalizeQualifications(teacherProfile?.qualifications);
  const credentials = teacherProfile?.credentials || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Link
            to={isTeacher ? "/admin/teachers" : "/admin/users"}
            className="hover:text-[#F42A18] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isTeacher ? "Instructors Directory" : "Learners Directory"}</span>
          </Link>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
          <span className="font-semibold text-neutral-900 dark:text-white truncate max-w-[200px]">
            {user.name || "User Details"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Block / Unblock Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsBlockModalOpen(true)}
            className={`gap-1.5 text-xs font-medium rounded-xl cursor-pointer ${
              user.isBlocked
                ? "border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                : "border-red-500/30 text-red-600 hover:bg-red-500/10"
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            {user.isBlocked ? "Unblock Account" : "Block User"}
          </Button>

          {/* Teacher Status & Verification Action */}
          {isTeacher && (
            <Button
              size="sm"
              onClick={() => {
                setTargetApprovalStatus(undefined);
                setIsVerifyModalOpen(true);
              }}
              className="gap-1.5 text-xs font-semibold bg-[#F42A18] hover:bg-[#D92212] text-white rounded-xl shadow-sm cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Manage Verification
            </Button>
          )}
        </div>
      </div>

      {/* Main Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white p-6 md:p-8 shadow-xl border border-neutral-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F42A18]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={user.name}
                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-2 border-white/20 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-neutral-800 border-2 border-white/20 flex items-center justify-center font-bold text-3xl text-neutral-300">
                {initials}
              </div>
            )}
            <span
              className={`absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full border-2 border-neutral-900 flex items-center justify-center ${
                user.isBlocked ? "bg-red-500" : "bg-emerald-500"
              }`}
              title={user.isBlocked ? "Account Blocked" : "Active Account"}
            >
              {user.isBlocked ? (
                <Ban className="w-3 h-3 text-white" />
              ) : (
                <Check className="w-3 h-3 text-white" />
              )}
            </span>
          </div>

          {/* User Bio & Badges */}
          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white truncate">
                {user.name}
              </h1>

              {/* Role Badge */}
              <Badge
                variant="outline"
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  isTeacher
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                    : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                }`}
              >
                {isTeacher ? "Instructor" : "Learner"}
              </Badge>

              {/* Blocked Badge */}
              {user.isBlocked && (
                <Badge variant="destructive" className="text-xs px-2.5 py-0.5 bg-red-500/20 text-red-300 border border-red-500/30">
                  Account Blocked
                </Badge>
              )}

              {/* Teacher Verification Badge */}
              {isTeacher && (
                <Badge
                  variant="outline"
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                    approvalStatus === "VERIFIED"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : approvalStatus === "IN_PROGRESS"
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      : approvalStatus === "REDO"
                      ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                      : approvalStatus === "REVOKED"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {approvalStatus === "VERIFIED" && <CheckCircle2 className="w-3 h-3" />}
                  {approvalStatus === "IN_PROGRESS" && <Clock className="w-3 h-3" />}
                  {approvalStatus === "REDO" && <RotateCcw className="w-3 h-3" />}
                  {approvalStatus === "REVOKED" && <UserX className="w-3 h-3" />}
                  {approvalStatus === "PENDING" && <AlertCircle className="w-3 h-3" />}
                  {approvalStatus === "VERIFIED"
                    ? "Verified Instructor"
                    : approvalStatus === "IN_PROGRESS"
                    ? "In Evaluation"
                    : approvalStatus === "REDO"
                    ? "Needs Revision"
                    : approvalStatus === "REVOKED"
                    ? "Revoked"
                    : "Pending Verification"}
                </Badge>
              )}
            </div>

            {/* Bio */}
            {profile?.bio ? (
              <p className="text-neutral-300 text-sm line-clamp-2">{profile.bio}</p>
            ) : (
              <p className="text-neutral-400 text-sm italic">No profile bio specified.</p>
            )}

            {/* Quick Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 pt-1">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-neutral-300">{user.email}</span>
              </div>
              {profile?.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-neutral-300">{profile.phone}</span>
                </div>
              )}
              {profile?.country && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-neutral-300">{profile.country}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>
                  Joined{" "}
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "overview"
              ? "text-[#F42A18] border-b-2 border-[#F42A18] bg-[#F42A18]/5"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Overview</span>
        </button>

        {isTeacher && (
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "courses"
                ? "text-[#F42A18] border-b-2 border-[#F42A18] bg-[#F42A18]/5"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Courses ({instructorCourses.length})</span>
          </button>
        )}

        {isTeacher && (
          <button
            onClick={() => setActiveTab("qualifications")}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "qualifications"
                ? "text-[#F42A18] border-b-2 border-[#F42A18] bg-[#F42A18]/5"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Credentials & File Documents</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("system")}
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "system"
              ? "text-[#F42A18] border-b-2 border-[#F42A18] bg-[#F42A18]/5"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Account & Security</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Professional Background */}
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
              <h3 className="font-bold text-neutral-900 dark:text-white text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#F42A18]" />
                Professional Summary & Bio
              </h3>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                {profile?.bio || "No expanded bio provided by the user."}
              </p>

              {isTeacher && teacherProfile && (
                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
                    <p className="text-xs text-neutral-500 font-medium">Teaching Experience</p>
                    <p className="text-base font-bold text-neutral-900 dark:text-white mt-1">
                      {teacherProfile.experienceYears ? `${teacherProfile.experienceYears} Years` : "Not specified"}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
                    <p className="text-xs text-neutral-500 font-medium">Verification State</p>
                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      {approvalStatus}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Expertise Tags (Teacher) */}
            {isTeacher && teacherProfile?.expertise && teacherProfile.expertise.length > 0 && (
              <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Primary Subject Expertise
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {teacherProfile.expertise.map((exp, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl text-xs font-semibold bg-red-500/10 text-[#F42A18] border border-red-500/20"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rejection / Feedback Note if present */}
            {isTeacher && teacherProfile?.rejectionReason && (
              <div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/30 space-y-2">
                <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
                  <MessageSquare className="w-4 h-4" />
                  <span>Admin Feedback / Verification Notes:</span>
                </div>
                <p className="text-xs text-orange-800 dark:text-orange-300 pl-6 leading-relaxed">
                  {teacherProfile.rejectionReason}
                </p>
              </div>
            )}
          </div>

          {/* Right Col: Quick Info Sidebar */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
              <h3 className="font-bold text-neutral-900 dark:text-white text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-neutral-500" />
                Contact & Identity
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-neutral-400 block">Full Name</span>
                  <span className="font-medium text-neutral-900 dark:text-white">{user.name}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block">Email Address</span>
                  <span className="font-medium text-neutral-900 dark:text-white break-all">{user.email}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block">Contact Phone</span>
                  <span className="font-medium text-neutral-900 dark:text-white">{profile?.phone || "—"}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block">Country / Region</span>
                  <span className="font-medium text-neutral-900 dark:text-white">{profile?.country || "—"}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block">Sign-in Provider</span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {user.authProvider === "GOOGLE" ? "Google OAuth" : "Email & Password"}
                  </span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            {isTeacher && (teacherProfile?.linkedinUrl || teacherProfile?.twitterUrl || teacherProfile?.websiteUrl) && (
              <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
                <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Online Presence</h3>
                <div className="space-y-2">
                  {teacherProfile.linkedinUrl && (
                    <a
                      href={teacherProfile.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between text-xs text-blue-500 hover:underline p-2 rounded-lg bg-blue-500/5"
                    >
                      <span>LinkedIn Profile</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {teacherProfile.websiteUrl && (
                    <a
                      href={teacherProfile.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between text-xs text-emerald-500 hover:underline p-2 rounded-lg bg-emerald-500/5"
                    >
                      <span>Personal Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {teacherProfile.twitterUrl && (
                    <a
                      href={teacherProfile.twitterUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between text-xs text-sky-500 hover:underline p-2 rounded-lg bg-sky-500/5"
                    >
                      <span>Twitter / X</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Courses (Teacher) */}
      {activeTab === "courses" && isTeacher && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Published & Catalog Courses ({instructorCourses.length})
            </h3>
          </div>

          {instructorCourses.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
              <BookOpen className="w-10 h-10 text-neutral-400 mx-auto" />
              <p className="font-semibold text-neutral-900 dark:text-white">No courses created yet</p>
              <p className="text-xs text-neutral-500">This instructor has not created any courses on the platform.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {instructorCourses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <BookOpen className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute top-2.5 right-2.5">
                      <Badge
                        variant="outline"
                        className={
                          course.pricingType === "FREE"
                            ? "bg-emerald-500/90 text-white border-0 text-[10px] font-bold"
                            : "bg-blue-600/90 text-white border-0 text-[10px] font-bold"
                        }
                      >
                        {course.pricingType === "FREE" ? "FREE" : `$${course.price}`}
                      </Badge>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-medium mb-1">
                        <span>{course.category?.name || "General"}</span>
                        <span>•</span>
                        <span>{course.level}</span>
                      </div>
                      <h4 className="font-bold text-neutral-900 dark:text-white text-sm line-clamp-1">
                        {course.title}
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1">
                        {course.subtitle || course.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                      <span className="text-[11px] text-neutral-400 font-medium">
                        {course.totalModules} modules • {course.totalLessons} topics
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/courses/${course.id}`)}
                        className="h-7 text-xs px-2.5 rounded-lg border-neutral-200 dark:border-neutral-800 hover:border-[#F42A18] hover:text-[#F42A18] cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View Course
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Credentials, Documents & Education (Teacher) */}
      {activeTab === "qualifications" && isTeacher && (
        <div className="space-y-6">
          {/* Primary Teacher Files: Resume & Identity Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h3 className="font-bold text-neutral-900 dark:text-white text-base flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#F42A18]" />
              Official Verification Documents & Resume
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Resume / CV Document File Card */}
              {teacherProfile?.resume ? (
                <FileDocumentCard
                  title="Resume / Curriculum Vitae"
                  url={teacherProfile.resume}
                  category="resume"
                  subtitle="Official Instructor CV"
                  onPreview={(url, title) => openFileViewer(url, title)}
                />
              ) : (
                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 text-xs text-neutral-400 italic flex items-center justify-center min-h-[140px]">
                  No resume document uploaded by instructor.
                </div>
              )}

              {/* Government ID Document File Card */}
              {teacherProfile?.identityCard ? (
                <FileDocumentCard
                  title="Government ID / PAN Card"
                  url={teacherProfile.identityCard}
                  category="identity"
                  subtitle="Official Identity Document"
                  onPreview={(url, title) => openFileViewer(url, title)}
                />
              ) : (
                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 text-xs text-neutral-400 italic flex items-center justify-center min-h-[140px]">
                  No government identity document attached.
                </div>
              )}
            </div>
          </div>

          {/* Accreditation Certificates & Credentials (Files) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 dark:text-white text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                Accreditation Certificates & Degrees ({credentials.length})
              </h3>
              {credentials.length > 0 && (
                <span className="text-xs font-bold text-neutral-500">
                  {credentials.length} {credentials.length === 1 ? "document" : "documents"} attached
                </span>
              )}
            </div>

            {credentials.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                <Award className="w-8 h-8 text-neutral-400 mx-auto" />
                <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-xs">No certificate documents uploaded</p>
                <p className="text-[11px] text-neutral-400">The instructor has not uploaded credential certificate files.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {credentials.map((certUrl, i) => (
                  <FileDocumentCard
                    key={i}
                    title={`Certificate #${i + 1}`}
                    url={certUrl}
                    category="certificate"
                    subtitle="Accreditation Credential"
                    onPreview={(url, title) => openFileViewer(url, title)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Academic Degrees & Education */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h3 className="font-bold text-neutral-900 dark:text-white text-base flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#F42A18]" />
              Academic Degrees & Formal Education ({qualifications.length})
            </h3>

            {qualifications.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">No formal degrees submitted.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {qualifications.map((qual, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#F42A18]">{qual.title}</span>
                      {qual.year && (
                        <span className="text-[10px] text-neutral-400 font-mono">Class of {qual.year}</span>
                      )}
                    </div>
                    {qual.institution && (
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{qual.institution}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: System & Security */}
      {activeTab === "system" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <h3 className="font-bold text-neutral-900 dark:text-white text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#F42A18]" />
            System Audit & Platform Attributes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">Unique User ID</span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-neutral-900 dark:text-white truncate font-medium">{user.id}</span>
                <button
                  onClick={handleCopyId}
                  className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                  title="Copy ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">Account Role</span>
              <span className="font-semibold text-neutral-900 dark:text-white">{user.role}</span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">Authentication Mechanism</span>
              <span className="font-semibold text-neutral-900 dark:text-white">{user.authProvider}</span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">Registration Timestamp</span>
              <span className="font-mono text-neutral-900 dark:text-white">
                {user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">Last Profile Update</span>
              <span className="font-mono text-neutral-900 dark:text-white">
                {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "—"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">Account Moderation Flag</span>
              <span className={`font-semibold ${user.isBlocked ? "text-red-500" : "text-emerald-500"}`}>
                {user.isBlocked ? "BLOCKED (Access Denied)" : "ACTIVE (Good Standing)"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* In-App Interactive File Preview Modal */}
      <FilePreviewModal
        isOpen={filePreview.isOpen}
        title={filePreview.title}
        url={filePreview.url}
        fileType={filePreview.type}
        onClose={() => setFilePreview((p) => ({ ...p, isOpen: false }))}
      />

      {/* Confirmation Modals */}
      <BlockUserModal
        user={user}
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onConfirm={handleConfirmBlock}
        isLoading={blockUserMutation.isPending}
      />

      <VerifyTeacherModal
        user={user}
        targetStatus={targetApprovalStatus}
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onConfirm={handleConfirmApprove}
        isLoading={approveTeacherMutation.isPending}
      />
    </div>
  );
};

export default AdminUserDetailPage;
