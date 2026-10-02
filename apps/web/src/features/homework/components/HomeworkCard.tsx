import React, { useState } from "react";
import {
  Calendar,
  Award,
  Link as LinkIcon,
  Download,
  FileText,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  Send,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Homework } from "../types/homework.types";
import { HomeworkStatusBadge } from "./HomeworkStatusBadge";

interface HomeworkCardProps {
  homework: Homework;
  userRole?: string; // "STUDENT" | "TEACHER" | "ADMIN" | "SUPERADMIN"
  isInstructor?: boolean; // True if current user created / instructs the course
  onEdit?: (homework: Homework) => void;
  onDelete?: (homework: Homework) => void;
  onSubmitHomework?: (homework: Homework) => void;
  onViewSubmissions?: (homework: Homework) => void;
}

export const HomeworkCard: React.FC<HomeworkCardProps> = ({
  homework,
  userRole,
  isInstructor,
  onEdit,
  onDelete,
  onSubmitHomework,
  onViewSubmissions,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const canManage = isInstructor || userRole === "ADMIN" || userRole === "SUPERADMIN";
  const mySubmission = homework.mySubmission;

  // Deadline formatting
  const dueDateObj = homework.dueDate ? new Date(homework.dueDate) : null;
  const isPastDue = dueDateObj ? new Date().getTime() > dueDateObj.getTime() : false;

  const formattedDueDate = dueDateObj
    ? dueDateObj.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 hover:border-slate-700/80 transition-all space-y-3.5 group">
      {/* Top Header: Title & Badges */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-semibold text-slate-100 group-hover:text-white transition-colors truncate">
              {homework.title}
            </h4>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              <Award className="w-3 h-3" />
              {homework.maxScore} pts
            </span>
          </div>

          {homework.lectureTitle && (
            <p className="text-xs text-slate-400 truncate">
              Lecture: {homework.lectureTitle}
            </p>
          )}
        </div>

        {/* Action Menu (for Teacher/Admin) or Submission Status (for Student) */}
        <div className="flex items-center gap-2">
          {!canManage && (
            <HomeworkStatusBadge
              submissionStatus={mySubmission?.status || "NOT_DONE"}
              verificationStatus={mySubmission?.verificationStatus || null}
              isLate={mySubmission?.isLate || false}
            />
          )}

          {canManage && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>

              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-36 bg-slate-950 border border-slate-800 rounded-lg shadow-xl z-20 py-1 text-xs">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onEdit(homework);
                        }}
                        className="w-full px-3 py-1.5 text-left text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                        Edit Assignment
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onDelete(homework);
                        }}
                        className="w-full px-3 py-1.5 text-left text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description & Task Content */}
      {homework.description && (
        <div className="text-xs text-slate-300 leading-relaxed">
          <p className={isExpanded ? "" : "line-clamp-2"}>
            {homework.description}
          </p>
          {homework.description.length > 150 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[#F42A18] hover:underline font-medium text-[11px] mt-1"
            >
              {isExpanded ? "Show Less" : "Read Full Instructions"}
            </button>
          )}
        </div>
      )}

      {/* Embedded Markdown / Text Task (if present) */}
      {homework.taskContent && (
        <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs text-slate-300 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Task Specifications:
          </span>
          <p className="whitespace-pre-wrap font-sans text-slate-200">
            {homework.taskContent}
          </p>
        </div>
      )}

      {/* Resource Badges (External URL & Attachment Download) */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {homework.taskUrl && (
          <a
            href={homework.taskUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Open Starter / Template Link</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </a>
        )}

        {homework.attachmentUrl && (
          <a
            href={homework.attachmentUrl}
            download
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            <Download className="w-3.5 h-3.5 text-[#F42A18]" />
            <span className="truncate max-w-[200px]">
              {homework.attachmentName || "Download Attachment"}
            </span>
            {homework.attachmentSize ? (
              <span className="text-[10px] text-slate-400">
                ({(homework.attachmentSize / (1024 * 1024)).toFixed(1)} MB)
              </span>
            ) : null}
          </a>
        )}
      </div>

      {/* Due Date & Deadline Info */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60 text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#F42A18]" />
          {formattedDueDate ? (
            <span>
              Due: <strong className={isPastDue ? "text-rose-400" : "text-slate-200"}>{formattedDueDate}</strong>
            </span>
          ) : (
            <span className="text-slate-500">No strict deadline</span>
          )}
        </div>

        {/* Teacher/Admin Stats Pill */}
        {canManage && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              {homework.totalSubmissions || 0} Submissions
              {homework.pendingCount ? (
                <span className="text-amber-400 font-semibold">
                  ({homework.pendingCount} pending)
                </span>
              ) : null}
            </span>
          </div>
        )}

        {/* Student Score Awarded (if verified) */}
        {!canManage && mySubmission?.score !== null && mySubmission?.score !== undefined && (
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Score: {mySubmission.score} / {homework.maxScore}
          </div>
        )}
      </div>

      {/* Redo Feedback Notice for Student */}
      {!canManage && mySubmission?.verificationStatus === "REDO" && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-rose-400">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Redo Requested by Instructor:</span>
          </div>
          <p className="text-slate-300 whitespace-pre-wrap">
            {mySubmission.feedback || "Please revise and resubmit your solution."}
          </p>
        </div>
      )}

      {/* Card Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-1">
        {/* Teacher Action: View Submissions */}
        {canManage && onViewSubmissions && (
          <Button
            type="button"
            size="sm"
            onClick={() => onViewSubmissions(homework)}
            className="bg-slate-800 hover:bg-[#F42A18] text-slate-200 hover:text-white text-xs font-medium px-3.5 transition-colors"
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            View Submissions ({homework.totalSubmissions || 0})
          </Button>
        )}

        {/* Student Action: Submit / Resubmit */}
        {!canManage && onSubmitHomework && (
          <Button
            type="button"
            size="sm"
            onClick={() => onSubmitHomework(homework)}
            className={`text-xs font-medium px-4 transition-colors ${
              mySubmission?.verificationStatus === "REDO"
                ? "bg-rose-600 hover:bg-rose-500 text-white"
                : mySubmission
                ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                : "bg-[#F42A18] hover:bg-[#d92212] text-white"
            }`}
          >
            {mySubmission?.verificationStatus === "REDO" ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Resubmit Solution
              </>
            ) : mySubmission ? (
              <>
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                Update / View Submission
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Submit Solution
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
