import React, { useRef, useState } from "react"
import {
  CreditCard,
  X,
  Loader2,
  ExternalLink,
  Download,
  CheckCircle2,
  FileUp,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/lib/toast"
import { useUploadFile } from "@/features/dashboard/hooks/useUpload"

export interface IdentityCardUploadInputProps {
  id?: string
  label?: string
  value?: string | null
  onChange: (value: string) => void
  onFileSelect?: (file: File | null, previewUrl: string) => void
  disabled?: boolean
  className?: string
  maxSizeMB?: number
  hint?: string
}

export const IdentityCardUploadInput: React.FC<IdentityCardUploadInputProps> = ({
  id = "identity-card-upload",
  label = "Government Identity Document (PAN Card / National ID / Passport)",
  value,
  onChange,
  onFileSelect,
  disabled = false,
  className = "",
  maxSizeMB = 25,
  hint = "Upload a government-issued photo ID such as a PAN Card, Passport, Aadhaar, or Driver's License (PDF or image up to 25MB). Stored securely for administrator verification only.",
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string>("")

  const { uploadFile, isPending: isUploading, progress } = useUploadFile()

  const handleProcessFile = async (file: File) => {
    const isAllowed =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf") ||
      file.type.startsWith("image/")

    if (!isAllowed) {
      toast.error("Invalid file format. Please upload a PDF document or image (.pdf, .png, .jpg, .webp)")
      return
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Identity card file size cannot exceed ${maxSizeMB}MB`)
      return
    }

    if (onFileSelect) {
      setFileName(file.name)
      const localUrl = URL.createObjectURL(file)
      onFileSelect(file, localUrl)
      onChange(localUrl)
      toast.success("Identity document selected")
      return
    }

    try {
      setFileName(file.name)
      const uploadedUrl = await uploadFile({
        file,
        options: {
          folder: "identity",
        },
      })

      if (uploadedUrl) {
        onChange(uploadedUrl)
        toast.success("Identity document uploaded successfully")
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
    if (onFileSelect) {
      onFileSelect(null, "")
    }
    onChange("")
    setFileName("")
    toast.info("Identity document removed")
  }

  const isPdf = value ? value.toLowerCase().includes(".pdf") : false

  return (
    <div className={`space-y-2 text-left ${className}`}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-blue-500" />
          <span>{label}</span>
          <span className="text-[10px] text-neutral-400 font-normal">(PAN, Passport, Aadhaar, National ID)</span>
        </Label>
        {value && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Document Attached
          </span>
        )}
      </div>

      {value ? (
        /* Attached Identity Card Preview Card */
        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                isPdf
                  ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
              }`}
            >
              {isPdf ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                  {fileName || "Identity Card / PAN Document"}
                </h4>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" /> Verified Secure
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                <span className="uppercase font-bold text-neutral-700 dark:text-neutral-300 text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                  {isPdf ? "PDF Document" : "Image ID"}
                </span>
                <span>•</span>
                <span>Stored in Protected Storage</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View ID
            </a>

            <a
              href={value}
              download="identity-card-document"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>

            {!disabled && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
                className="text-xs rounded-xl cursor-pointer"
              >
                Replace ID
              </Button>
            )}

            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                title="Remove ID"
                className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Empty Upload Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
            isDragging
              ? "border-[#F42A18] bg-[#F42A18]/5 scale-[1.005]"
              : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/30"
          } ${disabled ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <Loader2 className="w-7 h-7 text-[#F42A18] animate-spin" />
              <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Uploading identity card... {progress}%
              </p>
              <div className="w-48 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-[#F42A18] rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 py-1">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                <FileUp className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 text-center sm:text-left">
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  <span className="text-[#F42A18] hover:underline font-bold">Click to upload</span> or drag and drop your Identity Card / PAN
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  PAN Card, Aadhaar, Passport, Driver's License, or National ID (PDF, PNG, JPG up to {maxSizeMB}MB)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept=".pdf,application/pdf,image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleInputChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {hint && (
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  )
}

export default IdentityCardUploadInput
