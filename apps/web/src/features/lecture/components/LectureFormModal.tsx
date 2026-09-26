import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Radio,
  FileText,
  Loader2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { useTeacherCreateLecture, useTeacherUpdateLecture } from "../hooks/useLectures";
import { useTeacherCourses } from "@/features/course/hooks/useCourses";
import type { Lecture, LiveClassStatus } from "../types/lecture.types";

interface LectureFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLecture?: Lecture | null;
  defaultCourseId?: string;
  defaultCourseTitle?: string;
  onSuccess?: () => void;
}

export const LectureFormModal: React.FC<LectureFormModalProps> = ({
  isOpen,
  onClose,
  initialLecture,
  defaultCourseId,
  defaultCourseTitle,
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

  useEffect(() => {
    if (initialLecture) {
      setTitle(initialLecture.title || "");
      setDescription(initialLecture.description || "");
      setCourseId(initialLecture.courseId || defaultCourseId || "");
      setDurationMinutes(Math.round((initialLecture.durationSeconds || 3600) / 60));
      setLiveStatus(initialLecture.liveStatus || "SCHEDULED");

      if (initialLecture.scheduledAt) {
        const date = new Date(initialLecture.scheduledAt);
        const pad = (n: number) => n.toString().padStart(2, "0");
        const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
        setScheduledAt(formatted);
      } else {
        setScheduledAt("");
      }
    } else {
      setTitle("");
      setDescription("");
      setCourseId(defaultCourseId || "");
      setDurationMinutes(60);
      setLiveStatus("SCHEDULED");

      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      const pad = (n: number) => n.toString().padStart(2, "0");
      const formatted = `${nextHour.getFullYear()}-${pad(nextHour.getMonth() + 1)}-${pad(nextHour.getDate())}T${pad(nextHour.getHours())}:${pad(nextHour.getMinutes())}`;
      setScheduledAt(formatted);
    }
  }, [initialLecture, defaultCourseId, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseId) return;

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
  const teacherCourses = coursesData?.items || [];

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
            <div className="px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              {defaultCourseTitle}
            </div>
          ) : (
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              disabled={isEditing || isLoadingCourses}
              required
              className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-medium text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/20 focus:border-[#F42A18] disabled:opacity-60 cursor-pointer"
            >
              <option value="">Select a course...</option>
              {teacherCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
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
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>Start Time *</span>
            </label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              className="h-10 text-xs"
            />
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
            disabled={isSubmitting || !title.trim() || !courseId}
            size="sm"
            className="bg-[#F42A18] hover:bg-[#D92212] text-white text-xs font-semibold rounded-xl px-5 h-9 cursor-pointer gap-1.5"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isEditing ? "Save Changes" : "Schedule Lecture"}</span>
          </Button>
        </div>
      </form>
    </ModalTemplate>
  );
};
