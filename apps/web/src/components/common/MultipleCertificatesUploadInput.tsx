import React, { useRef, useState } from "react"
import {
  Award,
  Loader2,
  ExternalLink,
  Download,
  FileUp,
  FileText,
  Image as ImageIcon,
  Trash2,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { toast } from "@/lib/toast"
import { useUploadFile } from "@/features/dashboard/hooks/useUpload"

export interface MultipleCertificatesUploadInputProps {
  id?: string
  label?: string
  values?: string[]
  onChange: (values: string[]) => void
  onFilesSelect?: (stagedFiles: Array<{ file: File; previewUrl: string; name: string }>) => void
  disabled?: boolean
  className?: string
  maxCount?: number
  maxSizeMB?: number
  hint?: string
}

export const MultipleCertificatesUploadInput: React.FC<MultipleCertificatesUploadInputProps> = ({
  id = "credentials-upload",
  label = "Professional Certificates & Degrees (Credentials)",
  values = [],
  onChange,
  onFilesSelect,
  disabled = false,
  className = "",
  maxCount = 20,
  maxSizeMB = 25,
  hint = "Upload academic degrees, teaching licenses, and industry certifications (PDF or images up to 25MB each). Multiple certificates are supported and recommended for verification.",
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingCount, setUploadingCount] = useState<number>(0)

  const { uploadFile } = useUploadFile()

  const safeValues = Array.isArray(values) ? values : []

  const handleProcessFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList)
    if (files.length === 0) return

    if (safeValues.length + files.length > maxCount) {
      toast.error(`You can upload a maximum of ${maxCount} certificates (currently ${safeValues.length})`)
      return
    }

    if (onFilesSelect) {
      const stagedList: Array<{ file: File; previewUrl: string; name: string }> = []
      const previewUrls: string[] = []

      for (const file of files) {
        const isAllowed =
          file.type === "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf") ||
          file.type.startsWith("image/")

        if (!isAllowed) {
          toast.error(`"${file.name}" is not supported. Please upload PDF or image files.`)
          continue
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
          toast.error(`"${file.name}" exceeds maximum allowed size of ${maxSizeMB}MB`)
          continue
        }

        const previewUrl = URL.createObjectURL(file)
        stagedList.push({ file, previewUrl, name: file.name })
        previewUrls.push(previewUrl)
      }

      if (stagedList.length > 0) {
        onFilesSelect(stagedList)
        onChange([...safeValues, ...previewUrls])
        toast.success(
          stagedList.length === 1
            ? "Certificate selected"
            : `${stagedList.length} certificates selected`
        )
      }
      return
    }

    setUploadingCount(files.length)
    const newUrls: string[] = []

    for (const file of files) {
      const isAllowed =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf") ||
        file.type.startsWith("image/")

      if (!isAllowed) {
        toast.error(`"${file.name}" is not supported. Please upload PDF or image files.`)
        continue
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds maximum allowed size of ${maxSizeMB}MB`)
        continue
      }

      try {
        const uploadedUrl = await uploadFile({
          file,
          options: {
            folder: "certificates",
          },
        })

        if (uploadedUrl) {
          newUrls.push(uploadedUrl)
        }
      } catch {
        toast.error(`Failed to upload "${file.name}"`)
      }
    }

    setUploadingCount(0)

    if (newUrls.length > 0) {
      onChange([...safeValues, ...newUrls])
      toast.success(
        newUrls.length === 1
          ? "Certificate uploaded successfully"
          : `${newUrls.length} certificates uploaded successfully`
      )
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleProcessFiles(files)
    }
    e.target.value = ""
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && uploadingCount === 0) setIsDragging(true)
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
    if (disabled || uploadingCount > 0) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleProcessFiles(files)
    }
  }

  const handleRemove = (indexToRemove: number) => {
    const updated = safeValues.filter((_, idx) => idx !== indexToRemove)
    onChange(updated)
    toast.info("Certificate removed")
  }

  const isUploading = uploadingCount > 0

  const getFileNameFromUrl = (url: string, index: number) => {
    try {
      const parts = url.split("/")
      const rawName = parts[parts.length - 1]
      const cleanName = rawName.replace(/^[a-f0-9-]+_?/, "")
      return cleanName || `Certificate #${index + 1}`
    } catch {
      return `Certificate #${index + 1}`
    }
  }

  const isPdfUrl = (url: string) => url.toLowerCase().includes(".pdf")

  return (
    <div className={`space-y-3 text-left ${className}`}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>{label}</span>
          {safeValues.length > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {safeValues.length} {safeValues.length === 1 ? "certificate" : "certificates"}
            </span>
          )}
        </Label>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center transition-all cursor-pointer ${
          isDragging
            ? "border-[#F42A18] bg-[#F42A18]/5 scale-[1.005]"
            : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/30"
        } ${disabled ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept=".pdf,application/pdf,image/png,image/jpeg,image/jpg,image/webp"
          multiple
          onChange={handleInputChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-2">
            <Loader2 className="w-7 h-7 text-[#F42A18] animate-spin" />
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Uploading {uploadingCount} {uploadingCount === 1 ? "certificate" : "certificates"}...
            </p>
            <p className="text-[11px] text-neutral-500">Securely uploading to S3 storage</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-1">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <FileUp className="w-5 h-5" />
            </div>
            <div className="space-y-0.5 text-center sm:text-left">
              <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                <span className="text-[#F42A18] hover:underline font-bold">Click to upload</span> or drag and drop certificates
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                PDF, PNG, JPG, WebP up to {maxSizeMB}MB each (upload as many certificates as you have)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* List of Uploaded Certificates */}
      {safeValues.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center justify-between">
            <span>Uploaded Credentials ({safeValues.length}/{maxCount})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {safeValues.map((url, idx) => {
              const isPdf = isPdfUrl(url)
              const displayName = getFileNameFromUrl(url, idx)

              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between gap-2 shadow-xs group hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        isPdf
                          ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                      }`}
                    >
                      {isPdf ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate" title={displayName}>
                        {displayName}
                      </p>
                      <p className="text-[10px] text-neutral-400 flex items-center gap-1.5">
                        <span className="uppercase font-bold text-[9px] px-1 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                          {isPdf ? "PDF" : "IMAGE"}
                        </span>
                        <span>•</span>
                        <span>Certificate #{idx + 1}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View certificate"
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={url}
                      download={`certificate_${idx + 1}.${isPdf ? "pdf" : "png"}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Download certificate"
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>

                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        title="Delete certificate"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {hint && (
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  )
}

export default MultipleCertificatesUploadInput
