import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMyEnrollments } from "../hooks/use-enrollment";
import { CourseRefundModal } from "../components/CourseRefundModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  PlayCircle,
  Video,
  Clock,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import type { CourseEnrollment } from "../types/enrollment.types";

export function StudentCoursesPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED" | "REFUNDED">("ALL");
  const { data: enrollments = [], isLoading } = useMyEnrollments(
    filter === "ALL" ? undefined : filter
  );

  const [selectedForRefund, setSelectedForRefund] = useState<CourseEnrollment | null>(null);

  const activeCount = enrollments.filter((e) => e.status === "ACTIVE").length;
  const completedCount = enrollments.filter((e) => e.status === "COMPLETED").length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F42A18]/10 text-[#F42A18] text-xs font-bold mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Learning Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            My Enrolled Live Classes
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Access your live classroom cohorts, join scheduled lectures, track syllabus progress, and claim verified certificates.
          </p>
        </div>

        <Button
          onClick={() => navigate("/courses")}
          className="bg-[#F42A18] hover:bg-[#D92212] text-white rounded-2xl text-xs font-bold gap-1.5 shadow-md shadow-[#F42A18]/20 cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Explore More Courses</span>
        </Button>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        {(["ALL", "ACTIVE", "COMPLETED", "REFUNDED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filter === tab
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white bg-transparent"
            }`}
          >
            {tab === "ALL" && "All Enrolled"}
            {tab === "ACTIVE" && `In Progress (${activeCount})`}
            {tab === "COMPLETED" && `Completed (${completedCount})`}
            {tab === "REFUNDED" && "Refunded"}
          </button>
        ))}
      </div>

      {/* 3. Courses Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-xs text-neutral-400">Loading your enrolled classes...</div>
      ) : enrollments.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            {filter === "ALL" ? "You Haven't Enrolled in Any Courses Yet" : `No ${filter.toLowerCase()} enrollments found`}
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
            Browse our catalog of interactive live cohort classes taught by expert verified instructors.
          </p>
          <Button
            onClick={() => navigate("/courses")}
            className="bg-[#F42A18] hover:bg-[#D92212] text-white rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Browse Courses Now</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enr) => {
            const isCompleted = enr.status === "COMPLETED" || enr.progressPercentage >= 100;
            const isRefunded = enr.status === "REFUNDED";

            return (
              <div
                key={enr.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail / Header */}
                  <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    {enr.courseThumbnail ? (
                      <img
                        src={enr.courseThumbnail}
                        alt={enr.courseTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <Video className="w-10 h-10" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge
                        className={
                          isRefunded
                            ? "bg-red-500/90 text-white text-[10px] font-bold"
                            : isCompleted
                            ? "bg-emerald-500/90 text-white text-[10px] font-bold"
                            : "bg-[#F42A18]/90 text-white text-[10px] font-bold"
                        }
                      >
                        {isRefunded ? "REFUNDED" : isCompleted ? "COMPLETED" : "LIVE COHORT"}
                      </Badge>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-base text-neutral-900 dark:text-white line-clamp-1">
                        {enr.courseTitle}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">Instructor: {enr.instructorName}</p>
                    </div>

                    {/* Live Start Date Banner */}
                    {enr.courseStartingDate && (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                        <Calendar className="w-3.5 h-3.5 text-[#F42A18]" />
                        <span>Batch: {new Date(enr.courseStartingDate).toLocaleDateString()}</span>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        <span>Syllabus Progress</span>
                        <span>{enr.progressPercentage}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                        <div
                          className="h-full bg-[#F42A18] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, enr.progressPercentage))}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-neutral-400">
                        <span>{enr.completedLessonsCount} of {enr.totalLessons || 0} lessons done</span>
                        <span>{enr.attendedClassesCount} live sessions attended</span>
                      </div>
                    </div>

                    {/* 20-Day / 4-Classes Refund Badge */}
                    {enr.isRefundEligible && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-[11px]">
                            {enr.daysRemainingForRefund} days left to refund ({enr.classesConductedCount}/4 classes)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedForRefund(enr)}
                          className="text-[11px] font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
                        >
                          Refund
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-5 pt-0 border-t border-neutral-100 dark:border-neutral-800 mt-2">
                  {!isRefunded ? (
                    <Button
                      asChild
                      className="w-full h-10 bg-[#F42A18] hover:bg-[#D92212] text-white rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-[#F42A18]/20 cursor-pointer mt-3"
                    >
                      <Link to={`/learn/${enr.courseSlug || enr.courseId}`}>
                        <PlayCircle className="w-4 h-4" />
                        <span>Go to Classroom</span>
                      </Link>
                    </Button>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-center text-xs text-neutral-500 mt-3 font-semibold">
                      Enrollment Refunded & Cancelled
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Refund Modal */}
      <CourseRefundModal
        isOpen={Boolean(selectedForRefund)}
        onClose={() => setSelectedForRefund(null)}
        enrollment={selectedForRefund}
      />
    </div>
  );
}
