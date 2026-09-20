import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadApi } from "@/features/dashboard/api/upload.api";
import { toast } from "@/lib/toast";

interface CourseMediaUploadProps {
  label: string;
  type: "image" | "video";
  value: string;
  onChange: (url: string) => void;
  folder?: "thumbnails" | "videos" | "courses" | "general";
  placeholder?: string;
  hint?: string;
  error?: string;
  className?: string;
}

export const CourseMediaUpload: React.FC<CourseMediaUploadProps> = ({
  label,
  type,
  value,
  onChange,
  folder = type === "image" ? "thumbnails" : "videos",
  placeholder = type === "image"
    ? "https://images.unsplash.com/... or upload image"
    : "https://youtube.com/... or upload video (MP4/WebM)",
  hint,
  error,
  className = "",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [inputMode, setInputMode] = useState<"upload" | "url">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate type
    if (type === "image" && !file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPEG, PNG, WebP, SVG).");
      return;
    }
    if (type === "video" && !file.type.startsWith("video/")) {
      toast.error("Please upload a valid video file (MP4, WebM, MOV, MKV).");
      return;
    }

    // Validate size
    const maxSizeBytes = type === "image" ? 15 * 1024 * 1024 : 500 * 1024 * 1024;
    const maxSizeStr = type === "image" ? "15MB" : "500MB";
    if (file.size > maxSizeBytes) {
      toast.error(`File size exceeds maximum limit of ${maxSizeStr}.`);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const publicUrl = await uploadApi.uploadFile(file, {
        folder,
        maxDimension: type === "image" ? 1600 : undefined,
        quality: 0.9,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      onChange(publicUrl);
      toast.success(`${type === "image" ? "Image" : "Video"} uploaded successfully to S3!`);
    } catch (err: any) {
      const msg = err?.message || `Failed to upload ${type}`;
      toast.error(msg);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and mode toggle */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
          {type === "image" ? (
            <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <VideoIcon className="w-3.5 h-3.5 text-purple-500" />
          )}
          <span>{label}</span>
        </label>

        <div className="flex items-center gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setInputMode("upload")}
            className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              inputMode === "upload"
                ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium"
                : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            Upload File
          </button>
          <span className="text-neutral-400">•</span>
          <button
            type="button"
            onClick={() => setInputMode("url")}
            className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              inputMode === "url"
                ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium"
                : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            Paste URL
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={type === "image" ? "image/*" : "video/*"}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Upload Zone or URL Input */}
      {inputMode === "upload" && !value ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragOver
              ? "border-blue-500 bg-blue-500/10"
              : error
              ? "border-red-500 bg-red-500/5"
              : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 hover:border-neutral-300 dark:hover:border-neutral-700"
          }`}
        >
          {isUploading ? (
            <div className="w-full space-y-2 py-2">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading {type} to S3... {uploadProgress}%</span>
              </div>
              <div className="w-48 mx-auto bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-150 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Click to upload or drag and drop
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {type === "image"
                    ? "PNG, JPG, WebP, SVG (up to 15MB)"
                    : "MP4, WebM, MOV, MKV (up to 500MB)"}
                </p>
              </div>
            </>
          )}
        </div>
      ) : inputMode === "url" && !value ? (
        <div className="space-y-1">
          <Input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`text-xs rounded-xl ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
          />
        </div>
      ) : null}

      {/* Active Value / Preview Card */}
      {value ? (
        <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                {value}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                title="Open in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-7 w-7 p-0 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                title="Remove file"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Visual Preview */}
          {type === "image" ? (
            <div className="w-full h-32 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
              <img
                src={value}
                alt="Uploaded thumbnail"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-black/90">
              {value.includes("youtube.com") || value.includes("youtu.be") ? (
                <div className="p-3 text-center text-xs text-neutral-300 flex items-center justify-center gap-2">
                  <Film className="w-4 h-4 text-red-500" />
                  <span>YouTube Video URL Linked</span>
                </div>
              ) : (
                <video
                  src={value}
                  controls
                  className="w-full max-h-48 object-contain bg-black"
                />
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* Error / Hint */}
      {error ? (
        <p className="text-[11px] text-red-500 font-medium">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-neutral-400">{hint}</p>
      ) : null}
    </div>
  );
};

export default CourseMediaUpload;
