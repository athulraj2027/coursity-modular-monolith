import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RotateCcw,
  Star,
  Flame,
  ChevronRight,
  ChevronDown,
  Layers,
  PlayCircle,
  DollarSign,
  User,
  ExternalLink,
  GraduationCap,
  FileText,
  Copy,
  Check,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import {
  useAdminCourse,
  useAdminToggleFeaturedCourse,
  useAdminToggleTrendingCourse,
  useAdminSoftDeleteCourse,
  useAdminRestoreCourse,
  useAdminHardDeleteCourse,
} from "../hooks/useCourses";
import { toast } from "@/lib/toast";

export const AdminCourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"curriculum" | "overview" | "instructor" | "system">("curriculum");
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Modals
  const [showDelistModal, setShowDelistModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showPurgeModal, setShowPurgeModal] = useState(false);

  // Data fetching
  const { data: course, isLoading, isError, error, refetch } = useAdminCourse(id || "");

  const toggleFeaturedMutation = useAdminToggleFeaturedCourse();
  const toggleTrendingMutation = useAdminToggleTrendingCourse();
  const softDeleteMutation = useAdminSoftDeleteCourse();
  const restoreMutation = useAdminRestoreCourse();
  const hardDeleteMutation = useAdminHardDeleteCourse();

  const handleToggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: prev[moduleId] === undefined ? false : !prev[moduleId],
    }));
  };

  const handleExpandAll = () => {
    if (!course?.modules) return;
    const all: Record<string, boolean> = {};
    course.modules.forEach((m) => {
      all[m.id] = true;
    });
    setExpandedModules(all);
  };

  const handleCollapseAll = () => {
    if (!course?.modules) return;
    const all: Record<string, boolean> = {};
    course.modules.forEach((m) => {
      all[m.id] = false;
    });
    setExpandedModules(all);
  };

  const handleCopyId = () => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success("Course ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleConfirmDelist = async () => {
    if (!id) return;
    await softDeleteMutation.mutateAsync(id);
    setShowDelistModal(false);
    refetch();
  };

  const handleConfirmRestore = async () => {
    if (!id) return;
    await restoreMutation.mutateAsync(id);
    setShowRestoreModal(false);
    refetch();
  };

  const handleConfirmPurge = async () => {
    if (!id) return;
    await hardDeleteMutation.mutateAsync(id);
    setShowPurgeModal(false);
    navigate("/admin/courses");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-[#F42A18] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-neutral-500 font-medium">Loading course catalog record...</p>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/courses")}
          className="mb-6 gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses Catalog
        </Button>
        <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Course Not Found</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {error instanceof Error ? error.message : "The requested course could not be loaded."}
          </p>
          <Button onClick={() => refetch()} variant="outline" className="mt-2">
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  const instructor = course.teacherProfile?.profile?.user;
  const teacherProfile = course.teacherProfile;
  const instructorId = instructor?.id || teacherProfile?.userId || teacherProfile?.id;
  const isArchived = course.isDeleted;

  // Format Starting Date
  const startingDateFormatted = course.startingDate
    ? new Date(course.startingDate).toLocaleDateString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Flexible / TBA";

  const startingDateFull = course.startingDate
    ? new Date(course.startingDate).toLocaleString(undefined, {
        dateStyle: "full",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Link
            to="/admin/courses"
            className="hover:text-[#F42A18] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Course Catalog</span>
          </Link>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
          <span className="font-semibold text-neutral-900 dark:text-white truncate max-w-[280px]">
            {course.title}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Featured Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toggleFeaturedMutation.mutate({ id: course.id, isFeatured: !course.isFeatured })
            }
            disabled={toggleFeaturedMutation.isPending}
            className={`gap-1.5 text-xs font-medium rounded-xl cursor-pointer ${
              course.isFeatured
                ? "border-amber-500/30 text-amber-600 bg-amber-500/10 hover:bg-amber-500/20"
                : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${course.isFeatured ? "fill-amber-500 text-amber-500" : ""}`} />
            <span>{course.isFeatured ? "Featured on Home" : "Feature Course"}</span>
          </Button>

          {/* Trending Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toggleTrendingMutation.mutate({ id: course.id, isTrending: !course.isTrending })
            }
            disabled={toggleTrendingMutation.isPending}
            className={`gap-1.5 text-xs font-medium rounded-xl cursor-pointer ${
              course.isTrending
                ? "border-red-500/30 text-red-600 bg-red-500/10 hover:bg-red-500/20"
                : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${course.isTrending ? "fill-red-500 text-red-500" : ""}`} />
            <span>{course.isTrending ? "Trending Spotlight" : "Set Trending"}</span>
          </Button>

          {/* Delist or Relist Moderation */}
          {isArchived ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRestoreModal(true)}
              className="gap-1.5 text-xs font-semibold border-emerald-500/30 text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Relist on Platform
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDelistModal(true)}
              className="gap-1.5 text-xs font-semibold border-red-500/30 text-red-600 hover:bg-red-500/10 rounded-xl cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delist from Platform
            </Button>
          )}

          {/* Permanent Delete (Purge) if already archived */}
          {isArchived && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowPurgeModal(true)}
              className="gap-1.5 text-xs font-semibold rounded-xl cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Purge
            </Button>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white p-6 md:p-8 shadow-xl border border-neutral-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F42A18]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative flex flex-col lg:flex-row gap-6 items-start">
          {/* Media / Thumbnail Preview */}
          <div className="relative w-full lg:w-80 aspect-video rounded-2xl overflow-hidden bg-neutral-800 border border-white/10 shrink-0 group">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                <BookOpen className="w-12 h-12" />
              </div>
            )}

            {/* Promo video play button overlay if available */}
            {course.promoVideoUrl && (
              <button
                type="button"
                onClick={() => setShowVideoModal(true)}
                className="absolute inset-0 bg-black/40 hover:bg-black/20 flex flex-col items-center justify-center gap-1.5 text-white transition-all cursor-pointer group-hover:scale-105"
              >
                <PlayCircle className="w-12 h-12 text-[#F42A18] fill-[#F42A18]/20 drop-shadow-md" />
                <span className="text-xs font-semibold tracking-wide drop-shadow">Watch Trailer Video</span>
              </button>
            )}

            {/* Pricing Badge Overlay */}
            <div className="absolute top-3 right-3">
              <Badge
                className={
                  course.pricingType === "FREE"
                    ? "bg-emerald-500 text-white border-0 text-xs font-bold px-2.5 py-0.5"
                    : "bg-blue-600 text-white border-0 text-xs font-bold px-2.5 py-0.5"
                }
              >
                {course.pricingType === "FREE" ? "FREE COURSE" : `$${course.price}`}
              </Badge>
            </div>
          </div>

          {/* Details & Metadata */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Category & Level */}
              {course.category && (
                <Badge variant="outline" className="text-xs px-2.5 py-0.5 bg-white/10 text-neutral-200 border-white/20">
                  {course.category.name}
                </Badge>
              )}
              {course.subcategory && (
                <Badge variant="outline" className="text-xs px-2.5 py-0.5 bg-white/5 text-neutral-300 border-white/10">
                  {course.subcategory.name}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs px-2.5 py-0.5 bg-[#F42A18]/20 text-red-300 border-red-500/30">
                {course.level}
              </Badge>

              {/* Status Badge */}
              {isArchived ? (
                <Badge variant="destructive" className="text-xs px-2.5 py-0.5 bg-red-500/30 text-red-200 border-red-500/40">
                  Delisted / Archived
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Live & Listed
                </Badge>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              {course.title}
            </h1>

            {course.subtitle && (
              <p className="text-neutral-300 text-sm font-medium leading-relaxed">
                {course.subtitle}
              </p>
            )}

            {/* Starting Date Banner */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-neutral-200">
                <Calendar className="w-4 h-4 text-[#F42A18]" />
                <span className="font-semibold">Live Course Starting Date:</span>
                <span className="font-bold text-white">{startingDateFormatted}</span>
                {startingDateFull && <span className="text-neutral-400">({startingDateFull})</span>}
              </div>

              {instructor && instructorId && (
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400">Taught by:</span>
                  <Link
                    to={`/admin/teachers/${instructorId}`}
                    className="font-semibold text-white hover:text-[#F42A18] transition-colors flex items-center gap-1"
                  >
                    <span>{instructor.name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
          <span className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#F42A18]" />
            Modules
          </span>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {course.totalModules || course.modules?.length || 0}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
          <span className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            Live Topics / Lessons
          </span>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {course.totalLessons || 0}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
          <span className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            Total Duration
          </span>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {Math.round((course.totalDurationSeconds || 0) / 60)} <span className="text-sm font-normal text-neutral-500">mins</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
          <span className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-purple-500" />
            Pricing
          </span>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {course.pricingType === "FREE" ? "Free" : `$${course.price}`}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("curriculum")}
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "curriculum"
              ? "text-[#F42A18] border-b-2 border-[#F42A18] bg-[#F42A18]/5"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Curriculum & Live Topics ({course.modules?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "overview"
              ? "text-[#F42A18] border-b-2 border-[#F42A18] bg-[#F42A18]/5"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Course Description & Media</span>
        </button>

        <button
          onClick={() => setActiveTab("instructor")}
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "instructor"
              ? "text-[#F42A18] border-b-2 border-[#F42A18] bg-[#F42A18]/5"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Instructor Details</span>
        </button>

        <button
          onClick={() => setActiveTab("system")}
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "system"
              ? "text-[#F42A18] border-b-2 border-[#F42A18] bg-[#F42A18]/5"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Platform Audit & System</span>
        </button>
      </div>

      {/* Tab 1: Curriculum */}
      {activeTab === "curriculum" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Course Structure & Syllabus Topics
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpandAll}
                className="text-xs h-7 text-neutral-600 dark:text-neutral-400"
              >
                Expand All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCollapseAll}
                className="text-xs h-7 text-neutral-600 dark:text-neutral-400"
              >
                Collapse All
              </Button>
            </div>
          </div>

          {(!course.modules || course.modules.length === 0) ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <Layers className="w-10 h-10 text-neutral-400 mx-auto" />
              <p className="font-semibold text-neutral-900 dark:text-white">No modules outline created yet</p>
              <p className="text-xs text-neutral-500">The instructor has not added modules or live lesson topics yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {course.modules.map((module, mIdx) => {
                const isExpanded = expandedModules[module.id] !== false; // default expanded
                return (
                  <div
                    key={module.id}
                    className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm"
                  >
                    {/* Module Header */}
                    <button
                      type="button"
                      onClick={() => handleToggleModule(module.id)}
                      className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-bold text-xs flex items-center justify-center text-neutral-700 dark:text-neutral-300 shrink-0">
                          {mIdx + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-bold text-neutral-900 dark:text-white text-sm truncate">
                            {module.title}
                          </h4>
                          {module.description && (
                            <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                              {module.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-neutral-400 font-medium">
                          {module.lessons?.length || 0} topics
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-neutral-400 transition-transform ${
                            isExpanded ? "transform rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {/* Lessons List */}
                    {isExpanded && (
                      <div className="border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 p-3 space-y-2">
                        {(!module.lessons || module.lessons.length === 0) ? (
                          <p className="text-xs text-neutral-400 italic px-3 py-2">
                            No topics specified in this module yet.
                          </p>
                        ) : (
                          module.lessons.map((lesson, lIdx) => (
                            <div
                              key={lesson.id}
                              className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 flex items-start justify-between gap-4"
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                <span className="w-5 h-5 rounded-md bg-[#F42A18]/10 text-[#F42A18] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                  {lIdx + 1}
                                </span>
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h5 className="text-xs font-bold text-neutral-900 dark:text-white">
                                      {lesson.title}
                                    </h5>
                                    {lesson.isFreePreview && (
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                        Free Preview
                                      </Badge>
                                    )}
                                    {lesson.lessonType && (
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-600 border-blue-500/20 font-mono">
                                        {lesson.lessonType}
                                      </Badge>
                                    )}
                                  </div>
                                  {lesson.description && (
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                      {lesson.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="text-right shrink-0 text-xs text-neutral-400 font-mono">
                                {Math.round(lesson.durationSeconds / 60)} mins
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Overview & Description */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Full Description */}
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
              <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                Course Description
              </h3>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                {course.description || "No full description provided."}
              </p>
            </div>

            {/* What you'll learn */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  What Students Will Learn
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {course.learningOutcomes.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites / Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Prerequisites & Requirements
                </h3>
                <ul className="space-y-1.5 list-disc list-inside text-xs text-neutral-700 dark:text-neutral-300">
                  {course.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Target Audience */}
            {course.targetAudience && course.targetAudience.length > 0 && (
              <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-500" />
                  Target Audience
                </h3>
                <div className="flex flex-wrap gap-2">
                  {course.targetAudience.map((aud, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl text-xs bg-purple-500/10 text-purple-600 border border-purple-500/20"
                    >
                      {aud}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Media Assets */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Media & Assets</h3>

              {course.thumbnail && (
                <div className="space-y-1.5">
                  <span className="text-xs text-neutral-400 block">Thumbnail Image</span>
                  <img
                    src={course.thumbnail}
                    alt="Thumbnail"
                    className="w-full aspect-video rounded-xl object-cover border border-neutral-200 dark:border-neutral-800"
                  />
                  <a
                    href={course.thumbnail}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-500 hover:underline flex items-center gap-1 pt-1"
                  >
                    Open Full Resolution Image <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {course.promoVideoUrl && (
                <div className="space-y-1.5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-xs text-neutral-400 block">Trailer Video</span>
                  <Button
                    onClick={() => setShowVideoModal(true)}
                    variant="outline"
                    className="w-full justify-center gap-2 text-xs rounded-xl"
                  >
                    <PlayCircle className="w-4 h-4 text-[#F42A18]" />
                    Play Trailer Video
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Instructor Information */}
      {activeTab === "instructor" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-xl text-neutral-700 dark:text-neutral-200 overflow-hidden">
                {teacherProfile?.profile?.avatar ? (
                  <img
                    src={teacherProfile.profile.avatar}
                    alt="Instructor"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  instructor?.name?.substring(0, 2).toUpperCase() || "IN"
                )}
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white text-lg">
                  {instructor?.name || "Instructor Name Not Found"}
                </h4>
                <p className="text-xs text-neutral-500">{instructor?.email}</p>
                {teacherProfile?.expertise && teacherProfile.expertise.length > 0 && (
                  <p className="text-xs text-[#F42A18] font-medium mt-0.5">
                    {teacherProfile.expertise.join(", ")}
                  </p>
                )}
              </div>
            </div>

            {instructorId && (
              <Button
                variant="outline"
                onClick={() => navigate(`/admin/teachers/${instructorId}`)}
                className="gap-2 text-xs rounded-xl cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                View Full Instructor Profile
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 space-y-1">
              <span className="text-neutral-400 block">Teaching Experience</span>
              <span className="font-bold text-neutral-900 dark:text-white">
                {teacherProfile?.experienceYears ? `${teacherProfile.experienceYears} Years` : "Not specified"}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 space-y-1">
              <span className="text-neutral-400 block">Instructor Verification Status</span>
              <span className="font-bold text-emerald-500">
                {teacherProfile?.approvalStatus || "VERIFIED"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Audit & System Info */}
      {activeTab === "system" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <h3 className="font-bold text-neutral-900 dark:text-white text-base">
            Catalog & System Registry Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">Course ID</span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-neutral-900 dark:text-white truncate font-medium">{course.id}</span>
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
              <span className="text-neutral-400 block">URL Slug</span>
              <span className="font-mono font-medium text-neutral-900 dark:text-white truncate block">
                {course.slug}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">Catalog Visibility</span>
              <span className={`font-semibold ${isArchived ? "text-red-500" : "text-emerald-500"}`}>
                {isArchived ? "DELISTED / ARCHIVED" : "LIVE & LISTED"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">Creation Timestamp</span>
              <span className="font-mono text-neutral-900 dark:text-white">
                {course.createdAt ? new Date(course.createdAt).toLocaleString() : "—"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">Last Updated</span>
              <span className="font-mono text-neutral-900 dark:text-white">
                {course.updatedAt ? new Date(course.updatedAt).toLocaleString() : "—"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-1">
              <span className="text-neutral-400 block">Published Timestamp</span>
              <span className="font-mono text-neutral-900 dark:text-white">
                {course.publishedAt ? new Date(course.publishedAt).toLocaleString() : "—"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Video Trailer Modal */}
      {showVideoModal && course.promoVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl">
            <div className="p-4 flex items-center justify-between border-b border-neutral-800">
              <h3 className="font-bold text-white text-sm truncate">{course.title} - Video Trailer</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVideoModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                Close
              </Button>
            </div>
            <div className="aspect-video w-full bg-black">
              <video
                src={course.promoVideoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showDelistModal}
        onClose={() => setShowDelistModal(false)}
        onConfirm={handleConfirmDelist}
        title="Delist Course from Platform"
        description={`Are you sure you want to delist "${course.title}"? Students will no longer be able to discover or enroll in this course.`}
        confirmText="Delist Course"
        variant="danger"
        isLoading={softDeleteMutation.isPending}
      />

      <ConfirmationModal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        onConfirm={handleConfirmRestore}
        title="Relist Course on Platform"
        description={`Are you sure you want to restore and relist "${course.title}"? The course will become live and discoverable for students immediately.`}
        confirmText="Relist Course"
        variant="success"
        isLoading={restoreMutation.isPending}
      />

      <ConfirmationModal
        isOpen={showPurgeModal}
        onClose={() => setShowPurgeModal(false)}
        onConfirm={handleConfirmPurge}
        title="Permanently Purge Course"
        description={`Are you sure you want to permanently delete "${course.title}" and all of its modules and lessons? This action CANNOT be undone.`}
        confirmText="Permanently Purge"
        variant="danger"
        isLoading={hardDeleteMutation.isPending}
      />
    </div>
  );
};

export default AdminCourseDetailPage;
