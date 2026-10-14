import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  Radio,
  FileText,
  Loader2,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { toast } from "@/lib/toast";
import { useTeacherCreateLecture, useTeacherUpdateLecture } from "../hooks/useLectures";
import { useTeacherCourses } from "@/features/course/hooks/useCourses";
import type { Lecture, LiveClassStatus } from "../types/lecture.types";

interface LectureFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLecture?: Lecture | null;
  defaultCourseId?: string;
  defaultCourseTitle?: string;
  defaultCourseStartingDate?: string | null;
  onSuccess?: () => void;
}

const formatDateTimeLocal = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const getDefaultScheduledAt = (startingDate?: string | null): string => {
  if (startingDate) {
    const start = new Date(startingDate);
    if (!isNaN(start.getTime()) && start.getTime() > Date.now()) {
      const isDateOnly =
        start.getUTCHours() === 0 &&
        start.getUTCMinutes() === 0 &&
        start.getUTCSeconds() === 0;

      if (isDateOnly) {
        const datePart = startingDate.split("T")[0];
        return `${datePart}T10:00`;
      } else {
        return formatDateTimeLocal(start);
      }
    }
  }

  const nextHour = new Date();
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
  return formatDateTimeLocal(nextHour);
};

const getMinDateTime = (startingDate?: string | null): string => {
  if (startingDate) {
    const start = new Date(startingDate);
    if (!isNaN(start.getTime()) && start.getTime() > Date.now()) {
      const isDateOnly =
        start.getUTCHours() === 0 &&
        start.getUTCMinutes() === 0 &&
        start.getUTCSeconds() === 0;

      if (isDateOnly) {
        const datePart = startingDate.split("T")[0];
        return `${datePart}T00:00`;
      } else {
        return formatDateTimeLocal(start);
      }
    }
  }

  const now = new Date();
  return formatDateTimeLocal(now);
};

export const LectureFormModal: React.FC<LectureFormModalProps> = ({
  isOpen,
  onClose,
  initialLecture,
  defaultCourseId,
  defaultCourseTitle,
  defaultCourseStartingDate,
  onSuccess,
}) => {
  const isEditing = Boolean(initialLecture?.id);
  const createMutation = useTeacherCreateLecture();
  const updateMutation = useTeacherUpdateLecture();
  const { data: coursesData, isLoading: isLoadingCourses } = useTeacherCourses({ limit: 100 });

  const [courseId, setCourseId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number | string>(60);
  const [liveStatus, setLiveStatus] = useState<LiveClassStatus>("SCHEDULED");

  const teacherCourses = coursesData?.items || [];
  const selectedCourse = teacherCourses.find((c) => c.id === courseId);

  // Determine effective course starting date
  const effectiveCourseStartingDate =
    selectedCourse?.startingDate ??
    (courseId === defaultCourseId ? defaultCourseStartingDate : null) ??
    initialLecture?.courseStartingDate ??
    null;

  const effectiveCourseTitle =
    (courseId === defaultCourseId ? defaultCourseTitle : null) ??
    selectedCourse?.title ??
    initialLecture?.courseTitle ??
    "";

  const courseStartDate = effectiveCourseStartingDate
    ? new Date(effectiveCourseStartingDate)
    : null;
  const isCourseStartDateInFuture = Boolean(
    courseStartDate && !isNaN(courseStartDate.getTime()) && courseStartDate.getTime() > Date.now()
  );
  const formattedCourseStartDate =
    courseStartDate && !isNaN(courseStartDate.getTime())
      ? courseStartDate.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;

  // Initialize form state
  useEffect(() => {
    if (!isOpen) return;

    if (initialLecture) {
      setTitle(initialLecture.title || "");
      setDescription(initialLecture.description || "");
      setCourseId(initialLecture.courseId || defaultCourseId || "");
      setDurationMinutes(Math.round((initialLecture.durationSeconds || 3600) / 60));
      setLiveStatus(initialLecture.liveStatus || "SCHEDULED");

      if (initialLecture.scheduledAt) {
        setScheduledAt(formatDateTimeLocal(new Date(initialLecture.scheduledAt)));
      } else {
        setScheduledAt("");
      }
    } else {
      setTitle("");
      setDescription("");
      const initialCourseId = defaultCourseId || "";
      setCourseId(initialCourseId);
      setDurationMinutes(60);
      setLiveStatus("SCHEDULED");

      const matchedCourse = teacherCourses.find((c) => c.id === initialCourseId);
      const startingDate = matchedCourse?.startingDate ?? defaultCourseStartingDate;
      setScheduledAt(getDefaultScheduledAt(startingDate));
    }
  }, [isOpen, initialLecture, defaultCourseId, defaultCourseStartingDate]);

  // When courses finish loading, if in create mode with a future start date, ensure scheduledAt defaults to it
  useEffect(() => {
    if (!isOpen || isEditing || !courseId || isLoadingCourses) return;
    const matched = teacherCourses.find((c) => c.id === courseId);
    if (matched?.startingDate) {
      const start = new Date(matched.startingDate);
      if (start.getTime() > Date.now()) {
        const currentScheduledTime = scheduledAt ? new Date(scheduledAt).getTime() : 0;
        if (currentScheduledTime < start.getTime()) {
          setScheduledAt(getDefaultScheduledAt(matched.startingDate));
        }
      }
    }
  }, [isOpen, isEditing, courseId, isLoadingCourses, teacherCourses]);

  const handleCourseChange = (newCourseId: string) => {
    setCourseId(newCourseId);
    if (!isEditing) {
      const matched = teacherCourses.find((c) => c.id === newCourseId);
      setScheduledAt(getDefaultScheduledAt(matched?.startingDate));
    }
  };

  // Validation
  const scheduleError = useMemo(() => {
    if (!scheduledAt) return "Please choose a date and start time for this lecture.";
    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return "Invalid date and time selected.";
    }

    if (effectiveCourseStartingDate) {
      const start = new Date(effectiveCourseStartingDate);
      if (!isNaN(start.getTime())) {
        const isDateOnly =
          start.getUTCHours() === 0 &&
          start.getUTCMinutes() === 0 &&
          start.getUTCSeconds() === 0;

        let minAllowedTimestamp: number;
        if (isDateOnly) {
          const datePart = effectiveCourseStartingDate.split("T")[0];
          minAllowedTimestamp = new Date(`${datePart}T00:00:00`).getTime();
        } else {
          minAllowedTimestamp = start.getTime();
        }

        if (scheduledDate.getTime() < minAllowedTimestamp) {
          const formatted = start.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          return `Lecture cannot be scheduled before the course start date (${formatted}).`;
        }
      }
    }

    // Past time check (allow 5-minute leeway)
    if (scheduledDate.getTime() < Date.now() - 5 * 60 * 1000) {
      return "Lecture start time cannot be in the past.";
    }

    return null;
  }, [scheduledAt, effectiveCourseStartingDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseId) return;

    if (scheduleError) {
      toast.error(scheduleError);
      return;
    }

    const payload = {
      courseId,
      title: title.trim(),
      description: description.trim() || null,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      durationSeconds: (Number(durationMinutes) || 60) * 60,
      liveStatus,
    };

    if (isEditing && initialLecture?.id) {
      updateMutation.mutate(
        { id: initialLecture.id, payload },
        {
          onSuccess: () => {
            onSuccess?.();
            onClose();
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Live Class Lecture" : "Schedule New Live Lecture"}
      description={
        isEditing
          ? "Update details or schedule for this live class."
          : "Create a live class lecture associated with your course."
      }
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* 1. Associated Course Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#F42A18]" />
            <span>Associated Course *</span>
          </label>
          {defaultCourseTitle ? (
            <div className="px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
              <span>{defaultCourseTitle}</span>
              {formattedCourseStartDate && (
                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                  Batch: {formattedCourseStartDate}
                </span>
              )}
            </div>
          ) : (
            <select
              value={courseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              disabled={isEditing || isLoadingCourses}
              required
              className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-medium text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18] disabled:opacity-60 cursor-pointer"
            >
              <option value="">Select a course...</option>
              {teacherCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}{" "}
                  {c.startingDate
                    ? `(Starts ${new Date(c.startingDate).toLocaleDateString()})`
                    : "(Flexible)"}
                </option>
              ))}
            </select>
          )}

          {/* Course Start Date Visual Indication Banner */}
          {courseId && (
            <div className="pt-1">
              {isCourseStartDateInFuture && formattedCourseStartDate ? (
                <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 dark:bg-blue-950/20 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        Course Batch Starts: {formattedCourseStartDate}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        Live Cohort
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5 leading-relaxed">
                      Lectures for this course cannot be scheduled before the batch commencement date. The earliest available slot has been prefilled below.
                    </p>
                  </div>
                </div>
              ) : formattedCourseStartDate ? (
                <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs text-neutral-700 dark:text-neutral-300">
                    Course started on{" "}
                    <strong className="text-neutral-900 dark:text-white">
                      {formattedCourseStartDate}
                    </strong>{" "}
                    (Active Batch). Lectures can be scheduled starting from now.
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">
                    Flexible / Self-Paced Course. Lectures can be scheduled at any future time.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Lecture Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Lecture Name / Title *
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Masterclass: System Design Architecture"
            required
            className="h-10 text-xs"
          />
        </div>

        {/* 3. Start Time & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Start Time *</span>
              </label>
              {isCourseStartDateInFuture && formattedCourseStartDate && (
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                  Starts {formattedCourseStartDate}
                </span>
              )}
            </div>
            <Input
              type="datetime-local"
              value={scheduledAt}
              min={getMinDateTime(effectiveCourseStartingDate)}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              className={`h-10 text-xs transition-colors ${
                scheduleError
                  ? "border-red-500 focus-visible:ring-red-500/20 text-red-600 dark:text-red-400"
                  : ""
              }`}
            />
            {scheduleError ? (
              <p className="text-[11px] text-red-500 font-medium flex items-center gap-1.5 pt-0.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{scheduleError}</span>
              </p>
            ) : isCourseStartDateInFuture && formattedCourseStartDate ? (
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 pt-0.5">
                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Defaulted to course start date ({formattedCourseStartDate})</span>
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <span>Duration (Minutes) *</span>
            </label>
            <Input
              type="number"
              min={15}
              max={360}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              required
              className="h-10 text-xs"
            />
          </div>
        </div>

        {/* 4. Status (If Editing) */}
        {isEditing && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Live Session Status
            </label>
            <select
              value={liveStatus}
              onChange={(e) => setLiveStatus(e.target.value as LiveClassStatus)}
              className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-medium text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18] cursor-pointer"
            >
              <option value="SCHEDULED">Scheduled</option>
              <option value="LIVE_NOW">Live Now</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        )}

        {/* 5. Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-neutral-500" />
            <span>Lecture Description / Agenda</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Brief overview of topics, preparation notes, or agenda for this live session..."
            className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18] resize-none"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs rounded-xl cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !title.trim() || !courseId || Boolean(scheduleError)}
            size="sm"
            className="bg-[#F42A18] hover:bg-[#D92212] text-white text-xs font-semibold rounded-xl px-5 h-9 cursor-pointer gap-1.5 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isEditing ? "Save Changes" : "Schedule Lecture"}</span>
          </Button>
        </div>
      </form>
    </ModalTemplate>
  );
};
