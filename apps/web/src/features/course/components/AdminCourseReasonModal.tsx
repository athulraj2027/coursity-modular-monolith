import React, { useState, useEffect } from "react";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { Button } from "@/components/ui/button";
import { EyeOff, Snowflake, Mail, AlertTriangle, Info, Loader2 } from "lucide-react";
import type { Course } from "../types/course.types";

export interface AdminCourseReasonModalProps {
  isOpen: boolean;
  action: "delist" | "freeze";
  course: Course | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

export const AdminCourseReasonModal: React.FC<AdminCourseReasonModalProps> = ({
  isOpen,
  action,
  course,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError(null);
    }
  }, [isOpen]);

  if (!course) return null;

  const isDelist = action === "delist";
  const teacherEmail = course.teacherProfile?.profile?.user?.email;
  const teacherName = course.teacherProfile?.profile?.user?.name || "Instructor";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (trimmed.length < 5) {
      setError("Please provide a detailed explanation of at least 5 characters.");
      return;
    }
    setError(null);
    await onConfirm(trimmed);
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title={isDelist ? "Delist Unstarted Course" : "Freeze In-Progress Course"}
      description={
        isDelist
          ? "Delist this unstarted cohort from public student discovery. An administrative message and email will be dispatched to the instructor."
          : "Freeze this active cohort. The course content will be locked in read-only mode for the instructor, and an administrative notice email will be sent."
      }
      icon={
        isDelist ? (
          <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-600 border border-red-500/20">
            <EyeOff className="w-5 h-5" />
          </div>
        ) : (
          <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-600 border border-sky-500/20">
            <Snowflake className="w-5 h-5" />
          </div>
        )
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Target Course Summary Pill */}
        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-900 dark:text-white truncate max-w-[260px]">
              {course.title}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              {course.pricingType === "FREE" ? "Free" : `₹${Number(course.price).toLocaleString()}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
            <Mail className="w-3 h-3 text-neutral-400" />
            <span>Instructor:</span>
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {teacherName} ({teacherEmail || "No email"})
            </span>
          </div>
        </div>

        {/* Warning Callout */}
        <div
          className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
            isDelist
              ? "bg-red-500/5 border-red-500/20 text-red-700 dark:text-red-300"
              : "bg-sky-500/5 border-sky-500/20 text-sky-700 dark:text-sky-300"
          }`}
        >
          {isDelist ? (
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <p className="font-semibold">
              {isDelist
                ? "Course has not started yet."
                : "Course is in-progress or past start date."}
            </p>
            <p className="text-[11px] leading-relaxed opacity-90">
              {isDelist
                ? "Delisting removes the course from catalog listings. You must specify a reason below so the instructor understands why it was removed."
                : "Freezing prevents any future modifications to modules, lessons, and pricing. The instructor will retain read-only inspection access."}
            </p>
          </div>
        </div>

        {/* Required Reason Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Administrative Message / Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            placeholder={
              isDelist
                ? "E.g. The course syllabus violates platform guidelines or lacks complete curriculum details before launch..."
                : "E.g. Cohort suspended due to instructor inactivity or ongoing platform compliance review..."
            }
            className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F42A18]/30 focus:border-[#F42A18] resize-none"
          />
          <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-0.5">
            <span>{error ? <span className="text-red-500 font-medium">{error}</span> : "Minimum 5 characters"}</span>
            <span className="font-mono">{reason.length} / 2000</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-200/80 dark:border-neutral-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs rounded-xl cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || reason.trim().length < 5}
            className={`text-xs rounded-xl text-white font-medium cursor-pointer flex items-center gap-1.5 shadow-sm ${
              isDelist
                ? "bg-red-600 hover:bg-red-700"
                : "bg-sky-600 hover:bg-sky-700"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : isDelist ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Confirm Delist & Send Email</span>
              </>
            ) : (
              <>
                <Snowflake className="w-3.5 h-3.5" />
                <span>Confirm Freeze & Send Email</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </ModalTemplate>
  );
};

export default AdminCourseReasonModal;

