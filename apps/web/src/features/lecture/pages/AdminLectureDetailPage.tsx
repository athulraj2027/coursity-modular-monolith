import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LectureStatusBadge } from "../components/LectureStatusBadge";
import { useAdminLectureDetail } from "../hooks/useLectures";

export const AdminLectureDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: lecture, isLoading, isError } = useAdminLectureDetail(id || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (isError || !lecture) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
          Lecture Not Found
        </h2>
        <p className="text-xs text-neutral-500">The requested lecture does not exist.</p>
        <Button
          onClick={() => navigate("/admin/lectures")}
          size="sm"
          className="rounded-xl text-xs"
        >
          Back to Directory
        </Button>
      </div>
    );
  }

  const scheduledDate = lecture.scheduledAt ? new Date(lecture.scheduledAt) : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/lectures")}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Lectures Directory
          </button>

          <LectureStatusBadge status={lecture.liveStatus} isLiveNow={lecture.isLiveNow} />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {lecture.title}
            </h1>
            <p className="text-xs text-neutral-500 flex items-center gap-2">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                Course: {lecture.courseTitle}
              </span>
              <span>•</span>
              <span>Instructor: {lecture.teacherName || "Instructor"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-6">
          <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Schedule & Timing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800 space-y-1">
                <span className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  Scheduled Start Time
                </span>
                <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  {scheduledDate
                    ? scheduledDate.toLocaleString(undefined, {
                        dateStyle: "full",
                        timeStyle: "short",
                      })
                    : "Not scheduled"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800 space-y-1">
                <span className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Duration
                </span>
                <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  {Math.round(lecture.durationSeconds / 60)} Minutes
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Lecture Description
            </h3>
            {lecture.description ? (
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {lecture.description}
              </p>
            ) : (
              <p className="text-xs text-neutral-400 italic">No description provided.</p>
            )}
          </div>
        </div>

        <div className="md:col-span-4 space-y-6">
          <div className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Instructor & Course
            </h3>
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4 text-neutral-600" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {lecture.teacherName || "Instructor"}
                    </span>
                    <p className="text-[10px] text-neutral-500">Course Creator</p>
                  </div>
                </div>
              </div>

              {lecture.courseId && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full text-xs rounded-xl h-8 cursor-pointer"
                >
                  <Link to={`/admin/courses/${lecture.courseId}`}>View Course Overview</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
