import React, { useRef, useState } from "react"
import {
  FileText,
  Upload,
  X,
  Loader2,
  ExternalLink,
  Download,
  CheckCircle2,
  FileUp,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/lib/toast"
import { useUploadFile } from "@/features/dashboard/hooks/useUpload"

export interface ResumeUploadInputProps {
  id?: string
  label?: string
  value?: string | null
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  maxSizeMB?: number
  hint?: string
}

export const ResumeUploadInput: React.FC<ResumeUploadInputProps> = ({
  id = "resume-upload",
  label = "Curriculum Vitae / Resume (PDF)",
  value,
  onChange,
  disabled = false,
  className = "",
  maxSizeMB = 25,
  hint = "Upload your professional resume or CV in PDF format (up to 25MB). Stored securely on AWS S3 for administrative verification.",
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string>("")

  const { uploadFile, isPending: isUploading, progress } = useUploadFile()

  const handleProcessFile = async (file: File) => {
    // 1. Validate file extension and MIME type
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf")

    if (!isPdf) {
      toast.error("Invalid file format. Please upload a PDF document (.pdf)")
      return
    }

    // 2. Validate max size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Resume file size cannot exceed ${maxSizeMB}MB`)
      return
    }

    try {
      setFileName(file.name)
      const uploadedUrl = await uploadFile({
        file,
        options: {
          folder: "documents",
        },
      })

      if (uploadedUrl) {
        onChange(uploadedUrl)
        toast.success("Resume PDF uploaded successfully")
      }
    } catch {
      // Toast error handled in useUpload hook
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleProcessFile(file)
    }
    e.target.value = ""
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !isUploading) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (disabled || isUploading) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleProcessFile(file)
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
    setFileName("")
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!value) return
    const link = document.createElement("a")
    link.href = value
    link.download = fileName || "teacher-resume.pdf"
    link.target = "_blank"
    link.rel = "noopener noreferrer"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const isBusy = disabled || isUploading
  const hasResume = Boolean(value && value.trim() !== "")

  // Extract a readable file name from the URL if not stored in local state
  const displayFileName =
    fileName ||
    (value
      ? decodeURIComponent(value.split("/").pop()?.split("?")[0] || "teacher-resume.pdf")
      : "teacher-resume.pdf")

  return (
    <div className={`space-y-2.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <Label htmlFor={id} className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#F42A18]" />
            {label}
          </Label>
          {hasResume && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              Resume Attached
            </span>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleInputChange}
        disabled={isBusy}
        className="hidden"
      />

      {hasResume ? (
        /* Attached Resume State */
        <div className="p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-500/20 shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                {displayFileName}
              </h4>
              <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                <span className="uppercase font-semibold text-red-600 dark:text-red-400 text-[10px] px-1.5 py-0.2 rounded-md bg-red-500/10 border border-red-500/20">
                  PDF
                </span>
                <span>•</span>
                <span>Saved in S3 Storage</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <a
              href={value!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700/80 transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
              View PDF
            </a>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700/80 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-neutral-500" />
              Download
            </button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={isBusy}
              className="gap-1.5 rounded-xl text-xs font-semibold cursor-pointer border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F42A18]" />
                  <span>{progress > 0 ? `${progress}%` : "Uploading..."}</span>
                </>
              ) : (
                <>
                  <FileUp className="w-3.5 h-3.5 text-[#F42A18]" />
                  Replace
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isBusy}
              className="gap-1 rounded-xl text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        /* Empty / Upload Dropzone State */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isBusy && inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
            isDragging
              ? "border-[#F42A18] bg-[#F42A18]/5 dark:bg-[#F42A18]/10 ring-4 ring-[#F42A18]/10"
              : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50"
          } ${isBusy ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#F42A18]" />
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Uploading Resume PDF...
                </p>
                {progress > 0 && (
                  <div className="w-48 bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#F42A18] h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
                <p className="text-[11px] text-neutral-500">{progress}% complete</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-[#F42A18]/10 text-[#F42A18] flex items-center justify-center border border-[#F42A18]/20 shadow-xs">
                <Upload className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-neutral-900 dark:text-white">
                  Click to upload or drag & drop your resume PDF
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {hint}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  inputRef.current?.click()
                }}
                disabled={isBusy}
                className="gap-2 rounded-xl text-xs font-semibold cursor-pointer border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <FileText className="w-3.5 h-3.5 text-[#F42A18]" />
                Select PDF Document
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ResumeUploadInput
