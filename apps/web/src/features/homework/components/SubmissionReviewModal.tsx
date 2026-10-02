import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  RotateCcw,
  ExternalLink,
  Download,
  Loader2,
  FileText,
  User,
  Clock,
  Award,
  AlertTriangle,
} from "lucide-react";
import { ModalTemplate as Modal } from "@/components/common/ModalTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { useReviewSubmission } from "../hooks/useHomework";
import type { HomeworkSubmission } from "../types/homework.types";
import { HomeworkStatusBadge } from "./HomeworkStatusBadge";

interface SubmissionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: HomeworkSubmission | null;
  maxScore?: number;
}

export const SubmissionReviewModal: React.FC<SubmissionReviewModalProps> = ({
  isOpen,
  onClose,
  submission,
  maxScore = 100,
}) => {
  const [verificationStatus, setVerificationStatus] = useState<"VERIFIED" | "REDO">("VERIFIED");
  const [score, setScore] = useState<number | string>("");
  const [feedback, setFeedback] = useState("");

  const reviewMutation = useReviewSubmission();

  useEffect(() => {
    if (submission) {
      setVerificationStatus(
        submission.verificationStatus === "REDO" ? "REDO" : "VERIFIED"
      );
      setScore(submission.score !== null && submission.score !== undefined ? submission.score : "");
      setFeedback(submission.feedback || "");
    }
  }, [submission, isOpen]);

  if (!submission) return null;

  const handleClose = () => {
    if (reviewMutation.isPending) return;
    onClose();
  };

  const handleSubmit = async (status: "VERIFIED" | "REDO") => {
    if (status === "REDO" && !feedback.trim()) {
      toast.error("Please provide feedback explaining why a redo is requested");
      return;
    }

    const numScore = score !== "" ? Number(score) : null;
    if (numScore !== null && (isNaN(numScore) || numScore < 0 || numScore > maxScore)) {
      toast.error(`Score must be between 0 and ${maxScore}`);
      return;
    }

    await reviewMutation.mutateAsync({
      submissionId: submission.id,
      payload: {
        verificationStatus: status,
        score: numScore,
        feedback: feedback.trim() || null,
      },
    });

    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Review & Grade Student Submission"
      maxWidth="lg"
    >
      <div className="space-y-4 text-slate-200">
        {/* Student Info Card */}
        <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex items-center gap-3">
            {submission.studentAvatar ? (
              <img
                src={submission.studentAvatar}
                alt={submission.studentName || "Student"}
                className="w-10 h-10 rounded-full object-cover border border-slate-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                <User className="w-5 h-5" />
              </div>
            )}
            <div>
              <h4 className="text-sm font-semibold text-slate-100">
                {submission.studentName || "Student"}
              </h4>
              <p className="text-xs text-slate-400">{submission.studentEmail}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <HomeworkStatusBadge
              submissionStatus={submission.status}
              verificationStatus={submission.verificationStatus}
              isLate={submission.isLate}
            />
            <span className="text-[11px] text-slate-500">
              Submitted: {new Date(submission.submittedAt).toLocaleString(undefined, {
                dateStyle: "short",
                timeStyle: "short",
              })} (Attempt #{submission.attemptCount})
            </span>
          </div>
        </div>

        {/* Student Submission Contents */}
        <div className="space-y-3 p-3.5 bg-slate-900/60 border border-slate-800 rounded-lg">
          <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Student Submission Deliverables
          </h5>

          {/* Written Text */}
          {submission.submissionText ? (
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400">Written Response:</span>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 whitespace-pre-wrap font-sans max-h-48 overflow-y-auto">
                {submission.submissionText}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No written response provided</p>
          )}

          {/* External Link */}
          {submission.submissionUrl && (
            <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-md text-xs">
              <span className="text-slate-400 truncate max-w-md">
                🔗 {submission.submissionUrl}
              </span>
              <a
                href={submission.submissionUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[#F42A18] hover:text-[#d92212] font-medium"
              >
                Open Link <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Attachment File */}
          {submission.fileUrl && (
            <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-md text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-200 truncate">
                  {submission.fileName || "Submitted Attachment"}
                </span>
                {submission.fileSizeBytes ? (
                  <span className="text-slate-500 text-[11px]">
                    ({(submission.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                ) : null}
              </div>
              <a
                href={submission.fileUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            </div>
          )}
        </div>

        {/* Grading & Feedback Form */}
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="review-score" className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Score Awarded (Optional)
              </span>
              <span className="text-slate-500 text-[11px]">Out of {maxScore} points</span>
            </Label>
            <Input
              id="review-score"
              type="number"
              min={0}
              max={maxScore}
              placeholder={`e.g. ${Math.round(maxScore * 0.9)}`}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              disabled={reviewMutation.isPending}
              className="bg-slate-900 border-slate-800 text-slate-100 focus:border-[#F42A18]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="review-feedback" className="text-xs font-semibold text-slate-300">
              Instructor Feedback & Revision Notes
            </Label>
            <Textarea
              id="review-feedback"
              placeholder="Provide constructive feedback, praise, or detail requirements for revision..."
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={reviewMutation.isPending}
              className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-[#F42A18] text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={reviewMutation.isPending}
            className="text-slate-400 hover:text-slate-200"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit("REDO")}
              disabled={reviewMutation.isPending}
              className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
            >
              {reviewMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  Request Redo
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={() => handleSubmit("VERIFIED")}
              disabled={reviewMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
            >
              {reviewMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Verify & Pass
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
