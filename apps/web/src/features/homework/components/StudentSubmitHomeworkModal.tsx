import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  X,
  Loader2,
  FileUp,
  AlertCircle,
  Link as LinkIcon,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Award,
  ExternalLink,
} from "lucide-react";
import { ModalTemplate as Modal } from "@/components/common/ModalTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { useUploadFile } from "@/features/dashboard/hooks/useUpload";
import { useSubmitHomework } from "../hooks/useHomework";
import { resolveMimeType } from "@/features/dashboard/api/upload.api";
import type { Homework, HomeworkSubmission } from "../types/homework.types";
import { HomeworkStatusBadge } from "./HomeworkStatusBadge";

interface StudentSubmitHomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  homework: Homework;
  existingSubmission?: HomeworkSubmission | null;
}

const ALLOWED_EXTENSIONS = [".pdf", ".zip", ".rar", ".7z", ".doc", ".docx", ".ppt", ".pptx", ".txt"];
const MAX_FILE_SIZE_MB = 100;

export const StudentSubmitHomeworkModal: React.FC<StudentSubmitHomeworkModalProps> = ({
  isOpen,
  onClose,
  homework,
  existingSubmission,
}) => {
  const [submissionText, setSubmissionText] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [uploadedKey, setUploadedKey] = useState<string>("");
  const [uploadedName, setUploadedName] = useState<string>("");
  const [uploadedType, setUploadedType] = useState<string>("");
  const [uploadedSize, setUploadedSize] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isPending: isUploading, progress } = useUploadFile();
  const submitMutation = useSubmitHomework();

  const isResubmission = Boolean(existingSubmission);

  useEffect(() => {
    if (existingSubmission) {
      setSubmissionText(existingSubmission.submissionText || "");
      setSubmissionUrl(existingSubmission.submissionUrl || "");
      setUploadedUrl(existingSubmission.fileUrl || "");
      setUploadedKey(existingSubmission.fileKey || "");
      setUploadedName(existingSubmission.fileName || "");
      setUploadedType(existingSubmission.fileType || "");
      setUploadedSize(existingSubmission.fileSizeBytes || 0);
    } else {
      resetForm();
    }
  }, [existingSubmission, isOpen]);

  const resetForm = () => {
    setSubmissionText("");
    setSubmissionUrl("");
    setSelectedFile(null);
    setUploadedUrl("");
    setUploadedKey("");
    setUploadedName("");
    setUploadedType("");
    setUploadedSize(0);
  };

  const handleClose = () => {
    if (isUploading || submitMutation.isPending) return;
    onClose();
  };

  const handleFileProcess = async (file: File) => {
    const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "");
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error(
        `Invalid file format. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File size cannot exceed ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    setSelectedFile(file);

    try {
      const fileUrl = await uploadFile({
        file,
        options: {
          folder: "homework",
        },
      });

      if (fileUrl) {
        setUploadedUrl(fileUrl);
        const key =
          fileUrl.split("/uploads/")[1] ||
          fileUrl.split(".amazonaws.com/")[1] ||
          file.name;
        setUploadedKey(key);
        setUploadedName(file.name);
        setUploadedType(resolveMimeType(file.name));
        setUploadedSize(file.size);
        toast.success("Submission file uploaded to storage");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload file to storage");
      setSelectedFile(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadedUrl("");
    setUploadedKey("");
    setUploadedName("");
    setUploadedType("");
    setUploadedSize(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasText = Boolean(submissionText.trim());
    const hasUrl = Boolean(submissionUrl.trim());
    const hasFile = Boolean(uploadedUrl);

    if (!hasText && !hasUrl && !hasFile) {
      toast.error(
        "Please provide a written response, a project URL, or upload a solution file"
      );
      return;
    }

    await submitMutation.mutateAsync({
      homeworkId: homework.id,
      payload: {
        submissionText: submissionText.trim() || null,
        submissionUrl: submissionUrl.trim() || null,
        fileUrl: uploadedUrl || null,
        fileKey: uploadedKey || null,
        fileName: uploadedName || null,
        fileType: uploadedType || null,
        fileSizeBytes: uploadedSize || 0,
      },
    });

    handleClose();
  };

  const isSaving = submitMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isResubmission ? "Resubmit Homework Solution" : "Submit Homework Solution"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Homework Header Context */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-100">{homework.title}</h4>
              {homework.lectureTitle && (
                <span className="text-xs text-slate-400">
                  Lecture: {homework.lectureTitle}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                <Award className="w-3.5 h-3.5" />
                Max: {homework.maxScore} pts
              </span>
            </div>
          </div>

          {homework.dueDate && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-[#F42A18]" />
              <span>
                Deadline:{" "}
                {new Date(homework.dueDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>

        {/* Feedback Banner if Redo was requested */}
        {existingSubmission?.verificationStatus === "REDO" && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-rose-400">
              <RotateCcw className="w-4 h-4" />
              <span>Instructor Feedback (Redo Requested):</span>
            </div>
            <p className="text-slate-200 pl-5.5 whitespace-pre-wrap">
              {existingSubmission.feedback || "Please revise your solution based on course standards."}
            </p>
          </div>
        )}

        {/* Existing Submission Status Alert */}
        {existingSubmission && (
          <div className="flex items-center justify-between p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Current Status:</span>
              <HomeworkStatusBadge
                submissionStatus={existingSubmission.status}
                verificationStatus={existingSubmission.verificationStatus}
                isLate={existingSubmission.isLate}
              />
            </div>
            <span className="text-slate-500">
              Attempt #{existingSubmission.attemptCount}
            </span>
          </div>
        )}

        {/* Written Response / Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="submission-text" className="text-xs font-semibold text-slate-300">
            Written Answer & Explanation (Markdown / Text)
          </Label>
          <Textarea
            id="submission-text"
            placeholder="Write your explanation, reflection, steps taken, or paste your solution code here..."
            rows={4}
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            disabled={isSaving || isUploading}
            className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-[#F42A18] text-sm"
          />
        </div>

        {/* External Link (GitHub, Colab, Figma) */}
        <div className="space-y-1.5">
          <Label htmlFor="submission-url" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-sky-400" />
            Project Link / Repository URL
          </Label>
          <Input
            id="submission-url"
            type="url"
            placeholder="https://github.com/username/project or https://colab.research.google.com/..."
            value={submissionUrl}
            onChange={(e) => setSubmissionUrl(e.target.value)}
            disabled={isSaving || isUploading}
            className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-[#F42A18]"
          />
        </div>

        {/* Direct S3 File Upload */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-[#F42A18]" />
              Solution File (ZIP, RAR, PDF, DOCX)
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              Max {MAX_FILE_SIZE_MB}MB
            </span>
          </Label>

          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS.join(",")}
            onChange={handleFileInputChange}
            className="hidden"
          />

          {!uploadedUrl ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-[#F42A18] bg-[#F42A18]/5"
                  : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70"
              } ${isUploading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-2 gap-2">
                  <Loader2 className="w-6 h-6 text-[#F42A18] animate-spin" />
                  <span className="text-xs text-slate-300 font-medium">
                    Uploading solution to S3... {progress}%
                  </span>
                  <div className="w-48 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#F42A18] h-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2 gap-1.5">
                  <FileUp className="w-6 h-6 text-slate-500" />
                  <span className="text-xs text-slate-300">
                    <span className="font-semibold text-[#F42A18]">Click to upload</span> or drag and drop
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Upload zip archive, pdf writeup, or solution document
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-slate-200 truncate">
                    {uploadedName || selectedFile?.name || "Uploaded Solution File"}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {uploadedSize
                      ? `${(uploadedSize / (1024 * 1024)).toFixed(2)} MB`
                      : "Ready"}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={isSaving || isUploading}
                className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSaving || isUploading}
            className="text-slate-400 hover:text-slate-200"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving || isUploading}
            className="bg-[#F42A18] hover:bg-[#d92212] text-white font-medium px-5"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : isResubmission ? (
              "Submit Revision"
            ) : (
              "Submit Homework"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
