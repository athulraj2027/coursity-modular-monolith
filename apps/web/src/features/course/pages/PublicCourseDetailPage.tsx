import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  GraduationCap,
  Clock,
  BookOpen,
  Calendar,
  Layers,
  CheckCircle2,
  PlayCircle,
  FileText,
  HelpCircle,
  Radio,
  Share2,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  User,
  Sparkles,
  ShieldCheck,
  Award,
  Smartphone,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCourseBySlug, usePublicCourses } from "../hooks/useCourses";
import { LessonPreviewModal } from "../components/LessonPreviewModal";
import { CourseCard } from "../components/CourseCard";
import { useCurrentUser } from "@/features/auth";
import { toast } from "@/lib/toast";
import type { CourseLesson } from "../types/course.types";

const formatDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return "0 mins";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`;
  }
  return `${minutes} mins`;
};

export const PublicCourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();

  // Fetch current course
  const { data: course, isLoading, isError } = useCourseBySlug(slug || "");

  // Fetch related courses in same category
  const { data: relatedResponse } = usePublicCourses(
    course?.categoryId ? { categoryId: course.categoryId, limit: 3 } : undefined
  );
  const relatedCourses = (relatedResponse?.items || []).filter((c) => c.id !== course?.id).slice(0, 3);

  // States
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [previewLesson, setPreviewLesson] = useState<CourseLesson | null>(null);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Initialize first module expanded
  React.useEffect(() => {
    if (course?.modules && course.modules.length > 0) {
      setExpandedModules({ [course.modules[0].id]: true });
    }
  }, [course?.modules]);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExpandAll = () => {
    if (!course?.modules) return;
    const all: Record<string, boolean> = {};
    course.modules.forEach((m) => (all[m.id] = true));
    setExpandedModules(all);
  };

  const handleCollapseAll = () => {
    if (!course?.modules) return;
    const all: Record<string, boolean> = {};
    course.modules.forEach((m) => (all[m.id] = false));
    setExpandedModules(all);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success("Course link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleEnrollClick = () => {
    if (!currentUser) {
      toast.info("Please sign in or create an account to enroll in this course.");
      navigate(`/signin?redirect=/courses/${course?.slug || slug}`);
      return;
    }
    toast.success(`You are enrolling in "${course?.title}".`);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#F42A18] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-neutral-500 font-medium">Loading course syllabus...</p>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Course Not Found</h2>
        <p className="text-sm text-neutral-500 max-w-md">
          The course you're looking for might have been moved, renamed, or is currently not available.
        </p>
        <Button
          onClick={() => navigate("/courses")}
          className="bg-[#F42A18] hover:bg-[#D92212] text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to All Courses
        </Button>
      </div>
    );
  }

  const instructor = course.teacherProfile?.profile?.user;
  const teacherProfile = course.teacherProfile;
  const isStarted = Boolean(course.startingDate && new Date(course.startingDate).getTime() <= Date.now());

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* 1. Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Link to="/" className="hover:text-[#F42A18] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
          <Link to="/courses" className="hover:text-[#F42A18] transition-colors">
            Courses
          </Link>
          {course.category && (
            <>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
              <Link
                to={`/courses?category=${course.category.id}`}
                className="hover:text-[#F42A18] transition-colors"
              >
                {course.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4 text-neutral-400" />
          <span className="font-semibold text-neutral-900 dark:text-white truncate max-w-[240px] sm:max-w-xs">
            {course.title}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="gap-1.5 text-xs rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copiedLink ? "Copied Link!" : "Share Course"}</span>
        </Button>
      </div>

      {/* 2. Unified Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white p-6 md:p-8 shadow-xl border border-neutral-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F42A18]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative flex flex-col lg:flex-row gap-6 items-start">
          {/* Media / Thumbnail Preview */}
          <div className="relative w-full lg:w-80 aspect-video rounded-2xl overflow-hidden bg-neutral-800 border border-white/10 shrink-0 group">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                <GraduationCap className="w-12 h-12" />
              </div>
            )}

            {/* Promo Video Play Overlay */}
            {course.promoVideoUrl && (
              <button
                type="button"
                onClick={() => setShowTrailerModal(true)}
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
                {course.pricingType === "FREE" ? "FREE COURSE" : `₹${Number(course.price).toLocaleString()}`}
              </Badge>
            </div>
          </div>

          {/* Details & Metadata */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
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
                {course.level.replace("_", " ")}
              </Badge>
              <Badge variant="outline" className="text-xs px-2.5 py-0.5 bg-white/10 text-neutral-200 border-white/20">
                {course.language}
              </Badge>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
              {course.title}
            </h1>

            {course.subtitle && (
              <p className="text-neutral-300 text-sm font-medium leading-relaxed">
                {course.subtitle}
              </p>
            )}

            {/* Instructor & Starting Date Banner */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center border border-white/10 shrink-0">
                  {teacherProfile?.profile?.avatar ? (
                    <img
                      src={teacherProfile.profile.avatar}
                      alt={instructor?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">Created by</span>
                  <span className="font-bold text-white text-xs">
                    {instructor?.name || "Expert Instructor"}
                  </span>
                </div>
              </div>

              {course.startingDate && (
                <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5 text-neutral-200">
                  <Calendar className="w-3.5 h-3.5 text-[#F42A18]" />
                  <span>
                    {isStarted
                      ? "Cohort In-Progress"
                      : `Live Batch Starts ${new Date(course.startingDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}`}
                  </span>
                </div>
              )}
            </div>

            {/* Key Meta Stats Bar */}
            <div className="pt-3 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-neutral-300 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#F42A18]" />
                <span>{formatDuration(course.totalDurationSeconds)} content</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#F42A18]" />
                <span>{course.totalLessons} lectures</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#F42A18]" />
                <span>{course.totalModules} modules</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#F42A18]" />
                <span>Certificate Included</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Details & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Main Content (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* What You'll Learn */}
          {course.learningOutcomes && course.learningOutcomes.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F42A18]" />
                What you'll learn in this course
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {course.learningOutcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      {outcome}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Overview & Description */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
              Course Overview
            </h2>

            <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line font-sans">
              {course.description || "No full description provided for this course yet."}
            </div>

            {/* Tags */}
            {course.tags && course.tags.length > 0 && (
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-neutral-400 font-semibold mr-1">Tags:</span>
                {course.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Curriculum Accordion */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                  Course Curriculum
                </h2>
                <p className="text-xs text-neutral-500">
                  {course.totalModules} modules • {course.totalLessons} lectures • {formatDuration(course.totalDurationSeconds)} total length
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExpandAll}
                  className="text-xs font-semibold text-[#F42A18] hover:underline cursor-pointer"
                >
                  Expand all
                </button>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <button
                  onClick={handleCollapseAll}
                  className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                >
                  Collapse all
                </button>
              </div>
            </div>

            {/* Modules list */}
            {course.modules && course.modules.length > 0 ? (
              <div className="space-y-3">
                {course.modules.map((mod, modIdx) => {
                  const isExpanded = expandedModules[mod.id] || false;
                  const lessons = mod.lessons || [];

                  return (
                    <div
                      key={mod.id}
                      className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden transition-all duration-200"
                    >
                      {/* Module Header */}
                      <div
                        onClick={() => toggleModule(mod.id)}
                        className="p-4 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
                          )}
                          <h4 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white truncate">
                            Section {modIdx + 1}: {mod.title}
                          </h4>
                        </div>

                        <div className="text-xs text-neutral-500 shrink-0">
                          {lessons.length} {lessons.length === 1 ? "lecture" : "lectures"}
                        </div>
                      </div>

                      {/* Lessons List */}
                      {isExpanded && (
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 bg-white dark:bg-neutral-900">
                          {lessons.length === 0 ? (
                            <p className="p-4 text-xs text-neutral-400 italic">No lectures in this module yet.</p>
                          ) : (
                            lessons.map((les, lesIdx) => {
                              const isVideo = les.lessonType === "VIDEO";
                              const isArticle = les.lessonType === "ARTICLE";
                              const isQuiz = les.lessonType === "QUIZ";
                              const isLive = les.lessonType === "LIVE_CLASS";

                              return (
                                <div
                                  key={les.id}
                                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    {isVideo && <PlayCircle className="w-4 h-4 text-blue-500 shrink-0" />}
                                    {isArticle && <FileText className="w-4 h-4 text-emerald-500 shrink-0" />}
                                    {isQuiz && <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />}
                                    {isLive && <Radio className="w-4 h-4 text-red-500 shrink-0" />}

                                    <span className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 truncate">
                                      {lesIdx + 1}. {les.title}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    {les.isFreePreview ? (
                                      <button
                                        type="button"
                                        onClick={() => setPreviewLesson(les)}
                                        className="text-xs font-bold text-[#F42A18] hover:underline flex items-center gap-1 cursor-pointer"
                                      >
                                        <PlayCircle className="w-3.5 h-3.5" />
                                        Preview
                                      </button>
                                    ) : (
                                      <Lock className="w-3.5 h-3.5 text-neutral-400" />
                                    )}

                                    {les.durationSeconds > 0 && (
                                      <span className="text-xs text-neutral-400 font-mono">
                                        {Math.round(les.durationSeconds / 60)}m
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic">Curriculum outline is currently being updated.</p>
            )}
          </div>

          {/* Prerequisites & Target Audience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-6 shadow-sm space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">Requirements</h3>
              {course.requirements && course.requirements.length > 0 ? (
                <ul className="space-y-2">
                  {course.requirements.map((req, i) => (
                    <li key={i} className="text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F42A18] shrink-0 mt-1.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-neutral-400">No prior prerequisites needed. Beginners are welcome!</p>
              )}
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-6 shadow-sm space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">Who this course is for</h3>
              {course.targetAudience && course.targetAudience.length > 0 ? (
                <ul className="space-y-2">
                  {course.targetAudience.map((aud, i) => (
                    <li key={i} className="text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                      <span>{aud}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-neutral-400">Anyone enthusiastic about mastering this domain.</p>
              )}
            </div>
          </div>

          {/* Meet Your Instructor */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
              Meet Your Instructor
            </h2>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex items-center justify-center border border-neutral-200 dark:border-neutral-700 shrink-0">
                {teacherProfile?.profile?.avatar ? (
                  <img
                    src={teacherProfile.profile.avatar}
                    alt={instructor?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-neutral-400" />
                )}
              </div>

              <div className="space-y-2 flex-1 min-w-0">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
                    {instructor?.name || "Expert Instructor"}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {teacherProfile?.experienceYears
                      ? `${teacherProfile.experienceYears}+ years industry experience`
                      : "Verified Coursity Instructor"}
                  </p>
                </div>

                {teacherProfile?.expertise && teacherProfile.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {teacherProfile.expertise.map((exp, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[11px] font-medium"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                )}

                {teacherProfile?.profile?.bio && (
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed pt-1">
                    {teacherProfile.profile.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Enrollment Card */}
        <div className="lg:col-span-1 sticky top-24 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-6 shadow-xl space-y-5">
            {/* Price Header */}
            <div>
              {course.pricingType === "FREE" ? (
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    FREE
                  </span>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-semibold">
                    Open Access
                  </Badge>
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-neutral-900 dark:text-white font-mono">
                    ${course.price}
                  </span>
                  <span className="text-xs text-neutral-400 line-through font-mono">
                    ${(Number(course.price) * 1.6).toFixed(2)}
                  </span>
                  <Badge className="bg-[#F42A18]/10 text-[#F42A18] border-red-500/20 text-[10px] font-bold">
                    38% OFF
                  </Badge>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <Button
              onClick={handleEnrollClick}
              className="w-full h-12 bg-[#F42A18] hover:bg-[#D92212] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#F42A18]/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{course.pricingType === "FREE" ? "Enroll for Free" : "Buy & Enroll Now"}</span>
            </Button>

            {/* Checklist */}
            <div className="space-y-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <p className="text-xs font-bold text-neutral-900 dark:text-white">This course includes:</p>
              <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span>{formatDuration(course.totalDurationSeconds)} on-demand content</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span>{course.totalLessons} lectures and downloadable resources</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span>Access on mobile, tablet and desktop</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Full lifetime access to updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Related Courses Section */}
      {relatedCourses.length > 0 && (
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                Related Courses in {course.category?.name || "this topic"}
              </h2>
              <p className="text-xs text-neutral-500">
                Students who viewed this course also explored these learning tracks
              </p>
            </div>

            <Link
              to={`/courses?category=${course.categoryId}`}
              className="text-xs font-bold text-[#F42A18] hover:underline hidden sm:block"
            >
              View all in category →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedCourses.map((rel) => (
              <CourseCard key={rel.id} course={rel} />
            ))}
          </div>
        </div>
      )}

      {/* 5. Free Lesson Preview Modal */}
      <LessonPreviewModal
        isOpen={Boolean(previewLesson)}
        onClose={() => setPreviewLesson(null)}
        lesson={previewLesson}
        course={course}
        onEnrollClick={handleEnrollClick}
      />

      {/* 6. Video Trailer Preview Modal */}
      {showTrailerModal && course.promoVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-neutral-800">
            <button
              onClick={() => setShowTrailerModal(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
            >
              ✕
            </button>
            <div className="aspect-video w-full">
              {course.promoVideoUrl.includes("youtube.com") || course.promoVideoUrl.includes("youtu.be") ? (
                <iframe
                  src={course.promoVideoUrl.replace("watch?v=", "embed/")}
                  title="Course Trailer"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={course.promoVideoUrl} controls autoPlay className="w-full h-full object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
