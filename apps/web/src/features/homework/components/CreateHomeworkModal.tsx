import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  X,
  Loader2,
  FileUp,
  AlertCircle,
  Link as LinkIcon,
  Calendar,
  Award,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { ModalTemplate as Modal } from "@/components/common/ModalTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { useUploadFile } from "@/features/dashboard/hooks/useUpload";
import { useCreateHomework, useUpdateHomework } from "../hooks/useHomework";
import { resolveMimeType } from "@/features/dashboard/api/upload.api";
import type { Homework } from "../types/homework.types";

interface CreateHomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  lectureId: string;
  lectureTitle?: string;
  courseTitle?: string;
  homeworkToEdit?: Homework | null;
}

const ALLOWED_EXTENSIONS = [".pdf", ".zip", ".rar", ".7z", ".doc", ".docx", ".ppt", ".pptx", ".txt"];
const MAX_FILE_SIZE_MB = 100;

export const CreateHomeworkModal: React.FC<CreateHomeworkModalProps> = ({
  isOpen,
  onClose,
  lectureId,
  lectureTitle,
  courseTitle,
  homeworkToEdit,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskContent, setTaskContent] = useState("");
  const [taskUrl, setTaskUrl] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxScore, setMaxScore] = useState<number>(100);

  // File Attachment State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [uploadedKey, setUploadedKey] = useState<string>("");
  const [uploadedName, setUploadedName] = useState<string>("");
  const [uploadedType, setUploadedType] = useState<string>("");
  const [uploadedSize, setUploadedSize] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isPending: isUploading, progress } = useUploadFile();
  const createMutation = useCreateHomework();
  const updateMutation = useUpdateHomework();

  const isEditing = Boolean(homeworkToEdit);

  useEffect(() => {
    if (homeworkToEdit) {
      setTitle(homeworkToEdit.title || "");
      setDescription(homeworkToEdit.description || "");
      setTaskContent(homeworkToEdit.taskContent || "");
      setTaskUrl(homeworkToEdit.taskUrl || "");
      setMaxScore(homeworkToEdit.maxScore || 100);
      if (homeworkToEdit.dueDate) {
        // Convert to local datetime-local string
        const d = new Date(homeworkToEdit.dueDate);
        const isoLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setDueDate(isoLocal);
      } else {
        setDueDate("");
      }
      setUploadedUrl(homeworkToEdit.attachmentUrl || "");
      setUploadedKey(homeworkToEdit.attachmentKey || "");
      setUploadedName(homeworkToEdit.attachmentName || "");
      setUploadedType(homeworkToEdit.attachmentType || "");
      setUploadedSize(homeworkToEdit.attachmentSize || 0);
    } else {
      resetForm();
    }
  }, [homeworkToEdit, isOpen]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTaskContent("");
    setTaskUrl("");
    setDueDate("");
    setMaxScore(100);
    setSelectedFile(null);
    setUploadedUrl("");
    setUploadedKey("");
    setUploadedName("");
    setUploadedType("");
    setUploadedSize(0);
  };

  const handleClose = () => {
    if (isUploading || createMutation.isPending || updateMutation.isPending) return;
    resetForm();
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
    if (!title.trim()) {
      const defaultTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTitle(`Assignment: ${defaultTitle}`);
    }

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
        toast.success("Attachment file uploaded to storage");
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

    if (!title.trim()) {
      toast.error("Please enter an assignment title");
      return;
    }

    const hasInstructions = Boolean(description.trim());
    const hasContent = Boolean(taskContent.trim());
    const hasLink = Boolean(taskUrl.trim());
    const hasFile = Boolean(uploadedUrl);

    if (!hasInstructions && !hasContent && !hasLink && !hasFile) {
      toast.error(
        "Please provide instructions, markdown task content, an external link, or upload an attachment"
      );
      return;
    }

    let parsedDueDate: string | null = null;
    if (dueDate) {
      parsedDueDate = new Date(dueDate).toISOString();
    }

    if (isEditing && homeworkToEdit) {
      await updateMutation.mutateAsync({
        id: homeworkToEdit.id,
        payload: {
          title: title.trim(),
          description: description.trim() || null,
          taskContent: taskContent.trim() || null,
          taskUrl: taskUrl.trim() || null,
          attachmentUrl: uploadedUrl || null,
          attachmentKey: uploadedKey || null,
          attachmentName: uploadedName || null,
          attachmentType: uploadedType || null,
          attachmentSize: uploadedSize || 0,
          dueDate: parsedDueDate,
          maxScore: Number(maxScore) || 100,
        },
      });
      handleClose();
    } else {
      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        taskContent: taskContent.trim() || null,
        taskUrl: taskUrl.trim() || null,
        attachmentUrl: uploadedUrl || null,
        attachmentKey: uploadedKey || null,
        attachmentName: uploadedName || null,
        attachmentType: uploadedType || null,
        attachmentSize: uploadedSize || 0,
        dueDate: parsedDueDate,
        maxScore: Number(maxScore) || 100,
        lectureId,
      });
      handleClose();
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Edit Homework Assignment" : "Assign New Homework"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Context Banner */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-medium text-slate-200">
            <BookOpen className="w-4 h-4 text-[#F42A18]" />
            <span>Target Lecture: {lectureTitle || "Selected Lecture"}</span>
          </div>
          {courseTitle && (
            <span className="text-slate-500 pl-5.5">Course: {courseTitle}</span>
          )}
        </div>

        {/* Assignment Title */}
        <div className="space-y-1.5">
          <Label htmlFor="homework-title" className="text-xs font-semibold text-slate-300">
            Assignment Title <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="homework-title"
            placeholder="e.g. Build an Asynchronous Web Crawler in Node.js"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSaving || isUploading}
            className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-[#F42A18]"
            required
          />
        </div>

        {/* Due Date & Max Score Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="homework-due-date" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#F42A18]" />
              Due Date & Time (Optional)
            </Label>
            <Input
              id="homework-due-date"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isSaving || isUploading}
              className="bg-slate-900 border-slate-800 text-slate-100 focus:border-[#F42A18]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="homework-max-score" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Maximum Score / Points
            </Label>
            <Input
              id="homework-max-score"
              type="number"
              min={1}
              max={1000}
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              disabled={isSaving || isUploading}
              className="bg-slate-900 border-slate-800 text-slate-100 focus:border-[#F42A18]"
            />
          </div>
        </div>

        {/* Instructions / Description */}
        <div className="space-y-1.5">
          <Label htmlFor="homework-description" className="text-xs font-semibold text-slate-300">
            Overview & Requirements (Markdown or Plain Text)
          </Label>
          <Textarea
            id="homework-description"
            placeholder="Outline the goals, steps, deliverables, and acceptance criteria for students..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSaving || isUploading}
            className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-[#F42A18] text-sm"
          />
        </div>

        {/* External Link (GitHub, Figma, Colab, etc.) */}
        <div className="space-y-1.5">
          <Label htmlFor="homework-url" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-sky-400" />
            External Starter URL / Project Link (Optional)
          </Label>
          <Input
            id="homework-url"
            type="url"
            placeholder="https://github.com/org/repo or https://www.figma.com/..."
            value={taskUrl}
            onChange={(e) => setTaskUrl(e.target.value)}
            disabled={isSaving || isUploading}
            className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-[#F42A18]"
          />
        </div>

        {/* Direct-to-S3 Attachment File Upload */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-[#F42A18]" />
              Assignment Handout / Starter Archive File (Optional)
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              PDF, ZIP, RAR, PPTX, DOCX (Max {MAX_FILE_SIZE_MB}MB)
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
                    Uploading attachment to S3... {progress}%
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
                    Upload templates, problem sets, or codebases
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
                    {uploadedName || selectedFile?.name || "Uploaded Attachment"}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {uploadedSize
                      ? `${(uploadedSize / (1024 * 1024)).toFixed(2)} MB`
                      : "Ready for download"}
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

        {/* Footer Actions */}
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
            disabled={isSaving || isUploading || !title.trim()}
            className="bg-[#F42A18] hover:bg-[#d92212] text-white font-medium px-5"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Assign Homework"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
