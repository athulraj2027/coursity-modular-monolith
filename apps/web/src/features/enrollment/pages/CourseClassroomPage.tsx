import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useCourseClassroom,
  useMarkAttendance,
  useClaimCertificate,
} from "../hooks/use-enrollment";
import { CourseRefundModal } from "../components/CourseRefundModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Video,
  PlayCircle,
  CheckCircle2,
  Circle,
  FileText,
  Download,
  ShieldCheck,
  Award,
  ChevronRight,
  ChevronLeft,
  Clock,
  Radio,
  BookOpen,
  Calendar,
  Lock,
  FileCheck,
  User,
  Tag,
  Receipt,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import type { ClassroomLesson } from "../types/enrollment.types";
import { LectureNotesDrawer } from "@/features/note";
import { LectureHomeworkDrawer } from "@/features/homework";

export function CourseClassroomPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: classroomData, isLoading, isError } = useCourseClassroom(slug || "");
  const markAttendanceMutation = useMarkAttendance();
  const claimCertificateMutation = useClaimCertificate();

  const [activeLesson, setActiveLesson] = useState<ClassroomLesson | null>(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);
  const [isHomeworkDrawerOpen, setIsHomeworkDrawerOpen] = useState(false);

  // Initialize first lesson
  useEffect(() => {
    if (classroomData && classroomData.modules.length > 0 && !activeLesson) {
      for (const mod of classroomData.modules) {
        const uncompleted = mod.lessons.find((l) => !l.isCompleted);
        if (uncompleted) {
          setActiveLesson(uncompleted);
          return;
        }
      }
      if (classroomData.modules[0].lessons.length > 0) {
        setActiveLesson(classroomData.modules[0].lessons[0]);
      }
    }
  }, [classroomData]);

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#F42A18] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-neutral-500 font-medium">Loading enrolled course classroom...</p>
      </div>
    );
  }

  if (isError || !classroomData) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Classroom Access Gated</h2>
        <p className="text-xs text-neutral-500 max-w-md">
          You must have an active enrollment in this live cohort to view course details and join classroom lectures.
        </p>
        <Button
          onClick={() => navigate("/courses")}
          className="bg-[#F42A18] hover:bg-[#D92212] text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          Browse Courses & Enroll
        </Button>
      </div>
    );
  }

  const { enrollment, course, modules } = classroomData;

  // Flatten lessons for next/prev navigation
  const allLessons = modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleMarkAttendance = (lesson: ClassroomLesson) => {
    markAttendanceMutation.mutate({
      enrollmentId: enrollment.id,
      lessonId: lesson.id,
    });
  };

  const handleClaimCertificate = () => {
    claimCertificateMutation.mutate(enrollment.id);
  };

  const isCompleted = enrollment.status === "COMPLETED" || enrollment.progressPercentage >= 100;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col pb-16">
      
      {/* Top Header Navigation */}
      <header className="h-16 border-b border-neutral-800 px-4 md:px-8 flex items-center justify-between bg-neutral-900/90 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-9 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 gap-1.5 cursor-pointer text-xs"
          >
            <Link to="/students/courses">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">My Courses</span>
            </Link>
          </Button>
          <div className="h-4 w-px bg-neutral-800" />
          <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
            {course.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Certificate Action */}
          {enrollment.progressPercentage >= 90 && (
            <Button
              onClick={handleClaimCertificate}
              disabled={claimCertificateMutation.isPending}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>
                {enrollment.isCertificateClaimed ? "View Certificate" : "Claim Certificate"}
              </span>
            </Button>
          )}

          {/* 20-Day / 4-Classes Refund Trigger */}
          {enrollment.isRefundEligible && (
            <button
              type="button"
              onClick={() => setIsRefundModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{enrollment.daysRemainingForRefund}d refund window ({enrollment.classesConductedCount}/4 held)</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. COURSE DETAILS SECTION                                                 */}
        {/* ========================================================================= */}
        <section className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            
            {/* Thumbnail preview */}
            <div className="relative w-full lg:w-80 aspect-video rounded-2xl overflow-hidden bg-neutral-800 border border-neutral-700/80 shrink-0">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-500">
                  <GraduationCap className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge className="bg-[#F42A18] text-white text-[10px] font-bold border-0">
                  LIVE COHORT
                </Badge>
              </div>
            </div>

            {/* Course Title & Overview */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {course.category && (
                  <Badge variant="outline" className="text-xs px-2.5 py-0.5 bg-neutral-800 text-neutral-300 border-neutral-700">
                    {course.category}
                  </Badge>
                )}
                {course.level && (
                  <Badge variant="outline" className="text-xs px-2.5 py-0.5 bg-red-500/10 text-red-400 border-red-500/20">
                    {course.level.replace("_", " ")}
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                {course.title}
              </h1>

              {course.subtitle && (
                <p className="text-neutral-400 text-sm leading-relaxed">
                  {course.subtitle}
                </p>
              )}

              {/* Instructor Card */}
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 overflow-hidden flex items-center justify-center shrink-0">
                  {course.instructor?.avatar ? (
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-neutral-400" />
                  )}
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 block">Instructor</span>
                  <span className="text-xs sm:text-sm font-bold text-white">
                    {course.instructor?.name || "Verified Instructor"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Course Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-neutral-800/80">
            <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/60">
              <Radio className="w-4 h-4 text-[#F42A18] mb-1.5" />
              <span className="text-[11px] text-neutral-500 block">Delivery Format</span>
              <span className="text-xs font-bold text-neutral-200">Live Interactive</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/60">
              <BookOpen className="w-4 h-4 text-[#F42A18] mb-1.5" />
              <span className="text-[11px] text-neutral-500 block">Curriculum</span>
              <span className="text-xs font-bold text-neutral-200">{enrollment.totalLessons} Lectures</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/60">
              <Calendar className="w-4 h-4 text-[#F42A18] mb-1.5" />
              <span className="text-[11px] text-neutral-500 block">Batch Start</span>
              <span className="text-xs font-bold text-neutral-200">
                {course.startingDate ? new Date(course.startingDate).toLocaleDateString() : "Immediate Access"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/60">
              <Award className="w-4 h-4 text-[#F42A18] mb-1.5" />
              <span className="text-[11px] text-neutral-500 block">Certification</span>
              <span className="text-xs font-bold text-neutral-200">Verified Credential</span>
            </div>
          </div>

          {course.description && (
            <div className="pt-2 border-t border-neutral-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Course Description & Syllabus Overview
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {course.description}
              </p>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 2. ENROLLMENT DETAILS SECTION                                             */}
        {/* ========================================================================= */}
        <section className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Enrollment & Learning Status
                </span>
                <Badge
                  className={
                    isCompleted
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-bold"
                      : "bg-[#F42A18]/20 text-[#F42A18] border-red-500/30 text-xs font-bold"
                  }
                >
                  {isCompleted ? "COMPLETED" : "ACTIVE LEARNER"}
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Enrolled on {new Date(enrollment.enrolledAt).toLocaleDateString(undefined, { dateStyle: "long" })}
                {enrollment.invoiceNumber && ` • Invoice: #${enrollment.invoiceNumber}`}
              </p>
            </div>

            {/* Refund Action if eligible */}
            {enrollment.isRefundEligible && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRefundModalOpen(true)}
                className="rounded-xl text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                <span>Request 100% Refund ({enrollment.daysRemainingForRefund}d left)</span>
              </Button>
            )}
          </div>

          {/* Progress & Telemetry Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Progress Card */}
            <div className="p-5 rounded-2xl bg-neutral-950/60 border border-neutral-800/60 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-400">Syllabus Completion</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">
                  {enrollment.progressPercentage}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, enrollment.progressPercentage))}%` }}
                />
              </div>
              <p className="text-[11px] text-neutral-500">
                {enrollment.completedLessonsCount} of {enrollment.totalLessons} lectures finished
              </p>
            </div>

            {/* Attendance Card */}
            <div className="p-5 rounded-2xl bg-neutral-950/60 border border-neutral-800/60 space-y-1.5">
              <span className="text-xs font-semibold text-neutral-400">Live Attendance</span>
              <p className="text-2xl font-black text-blue-400 font-mono">
                {enrollment.attendedClassesCount} Classes
              </p>
              <p className="text-[11px] text-neutral-500">
                {enrollment.classesConductedCount} total live sessions conducted so far
              </p>
            </div>

            {/* Financial & Tuition Summary */}
            <div className="p-5 rounded-2xl bg-neutral-950/60 border border-neutral-800/60 space-y-1.5">
              <span className="text-xs font-semibold text-neutral-400">Tuition & Billing</span>
              <p className="text-2xl font-black text-white font-mono">
                {enrollment.finalAmount !== undefined
                  ? `₹${Number(enrollment.finalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                  : "Paid"}
              </p>
              <p className="text-[11px] text-neutral-500 capitalize">
                Via {enrollment.paymentMethod ? enrollment.paymentMethod.toLowerCase() : "Verified Payment"}
                {enrollment.appliedCouponCode && ` • Coupon: ${enrollment.appliedCouponCode}`}
              </p>
            </div>
          </div>

          {/* Guarantee & Certificate Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-xs text-emerald-300">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-emerald-200">20-Day Full Refund Guarantee:</strong>
                <span>Eligible for 100% money-back refund within 20 days or before 4 classes held.</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3 text-xs text-blue-300">
              <Award className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-blue-200">Verified Certificate:</strong>
                <span>
                  {enrollment.isCertificateClaimed
                    ? `Credential issued with certificate ID: ${enrollment.certificateCode || "Verified"}`
                    : "Achieve 90%+ progress to claim your verified course completion certificate."}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. LECTURES & CLASSROOM WORKSPACE SECTION                                 */}
        {/* ========================================================================= */}
        <section className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-[#F42A18]" />
              <h2 className="text-lg font-bold text-white">Classroom Lectures & Study Materials</h2>
            </div>
            <span className="text-xs text-neutral-400">
              {allLessons.length} total sessions
            </span>
          </div>

          {/* 2-Column Classroom Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Player & Active Lecture (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {activeLesson ? (
                <div className="space-y-6">
                  
                  {/* Live Session Banner */}
                  {activeLesson.lessonType === "LIVE_CLASS" && (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-[#F42A18]/20 via-neutral-900 to-neutral-900 border border-[#F42A18]/30 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-xs font-bold uppercase tracking-wider text-[#F42A18]">
                            Live Cohort Session
                          </span>
                        </div>
                        {activeLesson.scheduledAt && (
                          <span className="text-xs text-neutral-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(activeLesson.scheduledAt).toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-white">{activeLesson.title}</h3>
                        {activeLesson.description && (
                          <p className="text-xs text-neutral-400 mt-1">{activeLesson.description}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        {activeLesson.isLiveNow || activeLesson.liveStatus === "LIVE_NOW" ? (
                          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                            <Radio className="w-4 h-4 animate-pulse" />
                            <span>Live Class In Progress</span>
                          </div>
                        ) : null}

                        {activeLesson.attendedLive ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs py-1 px-3">
                            ✓ Attendance Verified
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleMarkAttendance(activeLesson)}
                            disabled={markAttendanceMutation.isPending}
                            className="bg-[#F42A18] hover:bg-[#D92212] text-white rounded-xl text-xs font-semibold px-4 h-9 cursor-pointer"
                          >
                            Mark Attended
                          </Button>
                        )}

                        {/* Quick Access Drawers */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsNotesDrawerOpen(true)}
                          className="border-neutral-800 hover:border-neutral-700 bg-neutral-900 text-xs rounded-xl h-9 gap-1.5 cursor-pointer text-neutral-200"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#F42A18]" />
                          <span>Class Notes</span>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsHomeworkDrawerOpen(true)}
                          className="border-neutral-800 hover:border-neutral-700 bg-neutral-900 text-xs rounded-xl h-9 gap-1.5 cursor-pointer text-neutral-200"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-amber-500" />
                          <span>Homework</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Video Player (If recording or video available) */}
                  {(activeLesson.videoUrl || activeLesson.recordingUrl) && (
                    <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl">
                      <video
                        key={activeLesson.videoUrl || activeLesson.recordingUrl || ""}
                        src={activeLesson.videoUrl || activeLesson.recordingUrl || ""}
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  {/* Lesson Notes & Text Body */}
                  {activeLesson.articleBody && (
                    <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#F42A18]" />
                        <span>Lecture Notes & Guide</span>
                      </h4>
                      <div className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
                        {activeLesson.articleBody}
                      </div>
                    </div>
                  )}

                  {/* Downloadable Resources */}
                  {Array.isArray(activeLesson.attachments) && activeLesson.attachments.length > 0 && (
                    <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        Class Resources & Downloads
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeLesson.attachments.map((att: any, idx: number) => (
                          <a
                            key={idx}
                            href={att.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 flex items-center justify-between text-xs text-neutral-300 transition-colors group"
                          >
                            <span className="font-semibold truncate max-w-[200px]">{att.name || "Resource File"}</span>
                            <Download className="w-4 h-4 text-neutral-500 group-hover:text-white" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Previous / Next Lesson Navigation (Mark as Completed button is removed) */}
                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-neutral-800">
                    <Button
                      onClick={() => prevLesson && setActiveLesson(prevLesson)}
                      disabled={!prevLesson}
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-neutral-800 text-xs gap-1.5 cursor-pointer disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous Lesson</span>
                    </Button>

                    <Button
                      onClick={() => nextLesson && setActiveLesson(nextLesson)}
                      disabled={!nextLesson}
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-neutral-800 text-xs gap-1.5 cursor-pointer disabled:opacity-30"
                    >
                      <span>Next Lesson</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-16 text-center text-neutral-500 bg-neutral-950/40 rounded-2xl border border-neutral-800">
                  Select a lecture from the curriculum sidebar to start learning.
                </div>
              )}
            </div>

            {/* Right Column: Syllabus Playlist (4 cols) */}
            <div className="lg:col-span-4 border border-neutral-800 rounded-2xl bg-neutral-950/70 p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#F42A18]" />
                  <span>Syllabus Curriculum</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {enrollment.completedLessonsCount} of {enrollment.totalLessons} lectures finished
                </p>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {modules.map((mod, modIdx) => (
                  <div key={mod.id} className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      Module {modIdx + 1}: {mod.title}
                    </span>

                    <div className="space-y-1.5">
                      {mod.lessons.map((les) => {
                        const isActive = activeLesson?.id === les.id;

                        return (
                          <button
                            key={les.id}
                            type="button"
                            onClick={() => setActiveLesson(les)}
                            className={`w-full text-left p-3 rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                              isActive
                                ? "bg-[#F42A18]/20 border border-[#F42A18]/50 text-white"
                                : "bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/50 text-neutral-300"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              {les.isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-neutral-600 shrink-0" />
                              )}
                              <span className="text-xs font-semibold truncate">{les.title}</span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {les.lessonType === "LIVE_CLASS" ? (
                                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[9px]">
                                  LIVE
                                </Badge>
                              ) : (
                                <Video className="w-3.5 h-3.5 text-neutral-500" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Refund Modal */}
      <CourseRefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        enrollment={{
          id: enrollment.id,
          studentId: "",
          courseId: course.id,
          courseTitle: course.title,
          status: enrollment.status,
          originalPrice: enrollment.originalPrice || 0,
          discountAmount: enrollment.discountAmount || 0,
          finalAmount: enrollment.finalAmount || 0,
          currency: "INR",
          paymentMethod: enrollment.paymentMethod || "PAID",
          razorpayOrderId: null,
          razorpayPaymentId: null,
          invoiceNumber: enrollment.invoiceNumber || null,
          teacherCouponId: null,
          appliedCouponCode: enrollment.appliedCouponCode || null,
          refundEligibleUntil: enrollment.refundEligibleUntil,
          enrolledAt: enrollment.enrolledAt,
          firstAccessedAt: null,
          completedAt: null,
          progressPercentage: enrollment.progressPercentage,
          attendedClassesCount: enrollment.attendedClassesCount,
          completedLessonsCount: enrollment.completedLessonsCount,
          lastAccessedLessonId: null,
          createdAt: "",
          updatedAt: "",
          daysRemainingForRefund: enrollment.daysRemainingForRefund,
          classesConductedCount: enrollment.classesConductedCount,
        }}
      />

      {/* Classroom Notes Drawer */}
      {isNotesDrawerOpen && activeLesson && (
        <LectureNotesDrawer
          isOpen={isNotesDrawerOpen}
          onClose={() => setIsNotesDrawerOpen(false)}
          lectureId={activeLesson.id}
          lectureTitle={activeLesson.title}
          courseTitle={course.title}
          canManage={false}
        />
      )}

      {/* Classroom Homework Drawer */}
      {isHomeworkDrawerOpen && activeLesson && (
        <LectureHomeworkDrawer
          isOpen={isHomeworkDrawerOpen}
          onClose={() => setIsHomeworkDrawerOpen(false)}
          lectureId={activeLesson.id}
          lectureTitle={activeLesson.title}
          courseTitle={course.title}
          userRole="STUDENT"
          canManage={false}
        />
      )}
    </div>
  );
}

export default CourseClassroomPage;
