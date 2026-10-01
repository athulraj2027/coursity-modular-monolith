import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  X,
  Loader2,
  FileUp,
  AlertCircle,
  Presentation,
  CheckCircle2,
} from "lucide-react";
import { ModalTemplate as Modal } from "@/components/common/ModalTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { useUploadFile } from "@/features/dashboard/hooks/useUpload";
import { useCreateNote } from "../hooks/useNotes";
import { resolveMimeType } from "@/features/dashboard/api/upload.api";

interface NoteUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lectureId: string;
  lectureTitle?: string;
  courseTitle?: string;
}

const ALLOWED_EXTENSIONS = [".pdf", ".ppt", ".pptx", ".doc", ".docx", ".txt"];
const MAX_FILE_SIZE_MB = 50;

export const NoteUploadModal: React.FC<NoteUploadModalProps> = ({
  isOpen,
  onClose,
  lectureId,
  lectureTitle,
  courseTitle,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [uploadedKey, setUploadedKey] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isPending: isUploading, progress } = useUploadFile();
  const createMutation = useCreateNote();

  const resetForm = () => {
    setName("");
    setDescription("");
    setSelectedFile(null);
    setUploadedUrl("");
    setUploadedKey("");
  };

  const handleClose = () => {
    if (isUploading || createMutation.isPending) return;
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
    if (!name.trim()) {
      // Auto-populate note title from filename without extension
      const defaultName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setName(defaultName);
    }

    try {
      const fileUrl = await uploadFile({
        file,
        options: {
          folder: "notes",
        },
      });

      if (fileUrl) {
        setUploadedUrl(fileUrl);
        // Extract key from fileUrl or generate unique identifier
        const key = fileUrl.split("/uploads/")[1] || fileUrl.split(".amazonaws.com/")[1] || file.name;
        setUploadedKey(key);
        toast.success("Document uploaded to storage");
      }
    } catch {
      setSelectedFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isUploading || !e.dataTransfer.files?.[0]) return;
    handleFileProcess(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a note name");
      return;
    }

    if (!uploadedUrl || !selectedFile) {
      toast.error("Please select and upload a note document");
      return;
    }

    const ext = selectedFile.name.split(".").pop()?.toLowerCase() || "pdf";
    const mimeType = resolveMimeType(selectedFile);

    createMutation.mutate(
      {
        lectureId,
        name: name.trim(),
        description: description.trim() || undefined,
        fileUrl: uploadedUrl,
        fileKey: uploadedKey || `notes/${Date.now()}-${selectedFile.name}`,
        fileType: mimeType,
        fileExtension: ext,
        fileSizeBytes: selectedFile.size,
      },
      {
        onSuccess: () => {
          resetForm();
          onClose();
        },
      }
    );
  };

  const isBusy = isUploading || createMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Lecture Notes"
      description={
        lectureTitle
          ? `Attach lecture slides, PDFs, or materials to "${lectureTitle}"`
          : "Attach learning materials to this lecture for enrolled students"
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {courseTitle && (
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 flex items-center justify-between">
            <span className="font-medium">Course:</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-200">{courseTitle}</span>
          </div>
        )}

        {/* Note Name */}
        <div className="space-y-1.5">
          <Label htmlFor="note-name" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Note Title / Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="note-name"
            placeholder="e.g. Lecture 04 Slide Deck & Reference Guide"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isBusy}
            className="text-xs h-10 rounded-xl"
            required
          />
        </div>

        {/* Note Description */}
        <div className="space-y-1.5">
          <Label htmlFor="note-desc" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
            <span>Description / Instructions</span>
            <span className="text-[10px] text-neutral-400 font-normal">Optional</span>
          </Label>
          <Textarea
            id="note-desc"
            placeholder="Optional summary, highlights, or reading instructions for students..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isBusy}
            className="text-xs min-h-[80px] rounded-xl resize-none"
          />
        </div>

        {/* File Upload Dropzone */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Document File (PDF, PPT, PPTX, DOCX) <span className="text-red-500">*</span>
          </Label>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileProcess(file);
              e.target.value = "";
            }}
            disabled={isBusy}
            className="hidden"
          />

          {selectedFile && uploadedUrl ? (
            /* Uploaded Success State */
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <h5 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {selectedFile.name}
                  </h5>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Ready to attach • {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
                className="text-xs rounded-xl h-8 cursor-pointer"
              >
                Change
              </Button>
            </div>
          ) : (
            /* Empty / Uploading State */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isBusy) setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
              onClick={() => !isBusy && fileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                isDragging
                  ? "border-[#F42A18] bg-[#F42A18]/5 ring-4 ring-[#F42A18]/10"
                  : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 hover:border-neutral-300 dark:hover:border-neutral-700"
              } ${isBusy ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 py-1">
                  <Loader2 className="w-7 h-7 animate-spin text-[#F42A18]" />
                  <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Uploading document to S3...
                  </p>
                  {progress > 0 && (
                    <div className="w-48 bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#F42A18] h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                  <span className="text-[10px] text-neutral-500">{progress}% complete</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto border border-orange-500/20">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-neutral-900 dark:text-white">
                      Click to choose or drag & drop files
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      PDF, PPT, PPTX, DOCX up to {MAX_FILE_SIZE_MB}MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isBusy}
            className="text-xs h-9 rounded-xl cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isBusy || !uploadedUrl || !name.trim()}
            className="text-xs h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-semibold cursor-pointer"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Saving Note...
              </>
            ) : (
              <>
                <FileUp className="w-3.5 h-3.5 mr-1.5" />
                Create Note
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
