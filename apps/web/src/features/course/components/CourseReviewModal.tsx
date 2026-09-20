import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Layers,
  Video,
  FileText,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { useAdminReviewCourse } from "../hooks/useCourses";
import type { Course } from "../types/course.types";

interface CourseReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onSuccess?: () => void;
}

export const CourseReviewModal: React.FC<CourseReviewModalProps> = ({
  isOpen,
  onClose,
  course,
  onSuccess,
}) => {
  const reviewMutation = useAdminReviewCourse();
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectMode, setIsRejectMode] = useState(false);

  if (!course) return null;

  const handleApprove = () => {
    reviewMutation.mutate(
      { id: course.id, action: "APPROVE" },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      }
    );
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) return;
    reviewMutation.mutate(
      { id: course.id, action: "REJECT", rejectionReason: rejectionReason.trim() },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      }
    );
  };

  const isPending = reviewMutation.isPending;

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title={`Review Submission: ${course.title}`}
      description="Audit curriculum quality, verify course details, and decide on publishing."
      maxWidth="xl"
      showCloseButton={!isPending}
      closeOnOverlayClick={!isPending}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="text-xs rounded-xl border-neutral-200 dark:border-neutral-800"
          >
            Close
          </Button>

          <div className="flex items-center gap-2">
            {!isRejectMode ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRejectMode(true)}
                  disabled={isPending}
                  className="text-xs rounded-xl text-red-600 border-red-500/20 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Reject Course...
                </Button>
                <Button
                  type="button"
                  onClick={handleApprove}
                  disabled={isPending}
                  className="text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve & Publish</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsRejectMode(false)}
                  disabled={isPending}
                  className="text-xs rounded-xl"
                >
                  Back to Review
                </Button>
                <Button
                  type="button"
                  onClick={handleReject}
                  disabled={isPending || !rejectionReason.trim()}
                  className="text-xs rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Rejection</span>
                </Button>
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-1">
        {/* Rejection input when in reject mode */}
        {isRejectMode && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 uppercase">
              <AlertTriangle className="w-4 h-4" />
              Rejection Reason & Required Changes
            </div>
            <textarea
              placeholder="Explain to the instructor why this course was rejected (e.g. low audio quality, missing prerequisite details, or incomplete curriculum)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              required
              className="w-full px-3 py-2 text-xs rounded-lg border border-red-300 dark:border-red-900 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-red-500"
            />
          </div>
        )}

        {/* Course Summary Card */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base">
                {course.title}
              </h3>
              {course.subtitle && (
                <p className="text-xs text-neutral-500 mt-0.5">{course.subtitle}</p>
              )}
            </div>
            <Badge
              variant="outline"
              className={
                course.status === "PUBLISHED"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs"
                  : course.status === "PENDING_REVIEW"
                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs"
                  : "bg-neutral-500/10 text-neutral-600 border-neutral-500/20 text-xs"
              }
            >
              {course.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800 text-xs">
            <div>
              <span className="text-neutral-500 block">Instructor</span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate block">
                {course.teacherProfile?.profile?.user?.name || "Teacher"}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block">Category</span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate block">
                {course.category?.name || "Uncategorized"}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block">Start Date</span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-500" />
                {course.startingDate
                  ? new Date(course.startingDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  : "Self-Paced"}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block">Level</span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                {course.level}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block">Price</span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                {course.pricingType === "FREE" ? "Free" : `$${course.price}`}
              </span>
            </div>
          </div>
        </div>

        {/* Description & Outcomes */}
        {course.description && (
          <div className="space-y-1 text-xs">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 uppercase">
              Description
            </span>
            <p className="text-neutral-600 dark:text-neutral-400 whitespace-pre-line bg-white dark:bg-neutral-950 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
              {course.description}
            </p>
          </div>
        )}

        {/* Learning Outcomes */}
        {(course.learningOutcomes || []).length > 0 && (
          <div className="space-y-1 text-xs">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 uppercase">
              Learning Outcomes
            </span>
            <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400 p-3 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800">
              {course.learningOutcomes.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Curriculum Structure */}
        <div className="space-y-2">
          <span className="font-semibold text-neutral-700 dark:text-neutral-300 uppercase text-xs flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            Curriculum Breakdown ({course.modules?.length || 0} Modules, {course.totalLessons} Lessons)
          </span>

          <div className="space-y-2">
            {(course.modules || []).map((mod, idx) => (
              <div
                key={mod.id}
                className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 space-y-2"
              >
                <div className="flex items-center justify-between font-semibold text-xs text-neutral-800 dark:text-neutral-200">
                  <span>
                    #{idx + 1}. {mod.title}
                  </span>
                  <span className="text-neutral-400 font-normal">
                    {mod.lessons?.length || 0} lessons
                  </span>
                </div>

                <div className="space-y-1 pl-2 border-l-2 border-neutral-200 dark:border-neutral-800">
                  {(mod.lessons || []).map((les) => (
                    <div
                      key={les.id}
                      className="flex items-center justify-between text-xs py-1 text-neutral-600 dark:text-neutral-400"
                    >
                      <div className="flex items-center gap-2 truncate">
                        {les.lessonType === "VIDEO" ? (
                          <Video className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        )}
                        <span className="truncate">{les.title}</span>
                        {les.isFreePreview && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 bg-blue-500/10 text-blue-600 border-blue-500/20">
                            Free Preview
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-neutral-400 shrink-0">
                        {Math.round(les.durationSeconds / 60)} min
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModalTemplate>
  );
};

export default CourseReviewModal;
