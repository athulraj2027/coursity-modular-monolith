import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useCourseClassroom,
  useMarkAttendance,
  useUpdateProgress,
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
  ExternalLink,
  ShieldCheck,
  Award,
  ChevronRight,
  ChevronLeft,
  Clock,
  Sparkles,
  Radio,
  BookOpen,
  Calendar,
  Lock,
} from "lucide-react";
import type { ClassroomLesson } from "../types/enrollment.types";

export function CourseClassroomPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: classroomData, isLoading, isError } = useCourseClassroom(slug || "");
  const markAttendanceMutation = useMarkAttendance();
  const updateProgressMutation = useUpdateProgress();
  const claimCertificateMutation = useClaimCertificate();

  const [activeLesson, setActiveLesson] = useState<ClassroomLesson | null>(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  // Initialize first lesson
  useEffect(() => {
    if (classroomData && classroomData.modules.length > 0 && !activeLesson) {
      // Find first uncompleted lesson, or first lesson
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
        <p className="text-xs text-neutral-500 font-medium">Entering Live Classroom...</p>
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
          You must have an active enrollment in this live cohort to enter the classroom.
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

  const handleToggleCompleted = (lesson: ClassroomLesson) => {
    updateProgressMutation.mutate({
      enrollmentId: enrollment.id,
      lessonId: lesson.id,
      isCompleted: !lesson.isCompleted,
    });
  };

  const handleClaimCertificate = () => {
    claimCertificateMutation.mutate(enrollment.id);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col">
      {/* 1. Classroom Top Navigation Header */}
      <header className="h-16 border-b border-neutral-800 px-4 md:px-6 flex items-center justify-between bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30">
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
          {/* Progress Indicator */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-neutral-400">Progress:</span>
            <span className="font-bold text-emerald-400">{enrollment.progressPercentage}%</span>
            <div className="w-20 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${enrollment.progressPercentage}%` }}
              />
            </div>
          </div>

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
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{enrollment.daysRemainingForRefund}d left to refund ({enrollment.classesConductedCount}/4 held)</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Player & Active Content (8 cols) */}
        <main className="lg:col-span-8 p-4 md:p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {activeLesson ? (
            <div className="space-y-6">
              {/* Live Session Banner */}
              {activeLesson.lessonType === "LIVE_CLASS" && (
                <div className="p-5 rounded-3xl bg-gradient-to-r from-[#F42A18]/20 via-neutral-900 to-neutral-900 border border-[#F42A18]/30 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#F42A18]">
                        Interactive Live Class Session
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
                    <h2 className="text-lg font-bold text-white">{activeLesson.title}</h2>
                    {activeLesson.description && (
                      <p className="text-xs text-neutral-400 mt-1">{activeLesson.description}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {activeLesson.isLiveNow || activeLesson.liveStatus === "LIVE_NOW" ? (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                        <Radio className="w-4 h-4 animate-pulse" />
                        <span>Live Session In Progress</span>
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
                  </div>
                </div>
              )}

              {/* Video Player (If recordingUrl or videoUrl available) */}
              {(activeLesson.videoUrl || activeLesson.recordingUrl) && (
                <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl">
                  <video
                    key={activeLesson.videoUrl || activeLesson.recordingUrl || ""}
                    src={activeLesson.videoUrl || activeLesson.recordingUrl || ""}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Lesson Body / Reading Notes */}
              {activeLesson.articleBody && (
                <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#F42A18]" />
                    <span>Lecture Notes & Curriculum Guide</span>
                  </h3>
                  <div className="prose prose-invert prose-sm max-w-none text-neutral-300 leading-relaxed whitespace-pre-wrap">
                    {activeLesson.articleBody}
                  </div>
                </div>
              )}

              {/* Downloadable Attachments */}
              {Array.isArray(activeLesson.attachments) && activeLesson.attachments.length > 0 && (
                <div className="p-5 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-3">
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
                        className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 flex items-center justify-between text-xs text-neutral-300 transition-colors group"
                      >
                        <span className="font-semibold truncate max-w-[200px]">{att.name || "Resource File"}</span>
                        <Download className="w-4 h-4 text-neutral-500 group-hover:text-white" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Navigation & Completion Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-neutral-800">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => prevLesson && setActiveLesson(prevLesson)}
                    disabled={!prevLesson}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-neutral-800 text-xs gap-1.5 cursor-pointer disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
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

                <Button
                  onClick={() => handleToggleCompleted(activeLesson)}
                  className={`rounded-2xl text-xs font-bold gap-2 cursor-pointer ${
                    activeLesson.isCompleted
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-neutral-800 hover:bg-neutral-700 text-white"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{activeLesson.isCompleted ? "Completed ✓" : "Mark as Completed"}</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-neutral-500">Select a lesson from the curriculum sidebar</div>
          )}
        </main>

        {/* Right Column: Sticky Curriculum Playlist (4 cols) */}
        <aside className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-neutral-800 bg-neutral-950 p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-4rem)] space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#F42A18]" />
              <span>Live Course Syllabus</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {enrollment.completedLessonsCount} of {enrollment.totalLessons} lectures completed
            </p>
          </div>

          <div className="space-y-4">
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
                        className={`w-full text-left p-3 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#F42A18]/15 border border-[#F42A18]/40 text-white"
                            : "bg-neutral-900/60 hover:bg-neutral-900 border border-transparent text-neutral-300"
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
        </aside>
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
          originalPrice: 0,
          discountAmount: 0,
          finalAmount: 0,
          currency: "INR",
          paymentMethod: "PAID",
          razorpayOrderId: null,
          razorpayPaymentId: null,
          invoiceNumber: null,
          teacherCouponId: null,
          appliedCouponCode: null,
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
    </div>
  );
}
