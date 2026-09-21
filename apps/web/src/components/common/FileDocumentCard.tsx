import React from "react"
import {
  FileText,
  CreditCard,
  Award,
  File,
  Eye,
  Download,
  ExternalLink,
  X,
  FileCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export type FileCategory = "pdf" | "image" | "identity" | "certificate" | "resume" | "document"

export interface FileDocumentCardProps {
  title: string
  url: string
  category?: FileCategory
  subtitle?: string
  badgeLabel?: string
  showThumbnail?: boolean
  className?: string
  onPreview?: (url: string, title: string, type: "pdf" | "image" | "document") => void
}

export function detectFileType(url: string): "pdf" | "image" | "document" {
  const lower = url.toLowerCase()
  if (lower.includes(".pdf")) return "pdf"
  if (
    lower.includes(".jpg") ||
    lower.includes(".jpeg") ||
    lower.includes(".png") ||
    lower.includes(".webp") ||
    lower.includes(".gif") ||
    lower.includes(".svg") ||
    lower.includes("image")
  ) {
    return "image"
  }
  return "document"
}

export function extractFileName(url: string, fallback = "Document"): string {
  try {
    const cleanUrl = url.split("?")[0]
    const parts = cleanUrl.split("/")
    const lastPart = parts[parts.length - 1]
    if (lastPart && lastPart.length > 3) {
      return decodeURIComponent(lastPart)
    }
  } catch {
    // fallback
  }
  return fallback
}

export const FileDocumentCard: React.FC<FileDocumentCardProps> = ({
  title,
  url,
  category,
  subtitle,
  badgeLabel,
  showThumbnail = true,
  className = "",
  onPreview,
}) => {
  const detectedType = detectFileType(url)
  const isPdf = detectedType === "pdf"
  const isImage = detectedType === "image"

  const fileName = extractFileName(url, `${title.replace(/\s+/g, "_")}.${isPdf ? "pdf" : isImage ? "png" : "doc"}`)

  const getCategoryConfig = () => {
    switch (category) {
      case "identity":
        return {
          icon: CreditCard,
          badge: badgeLabel || (isPdf ? "PDF ID" : "IMAGE ID"),
          iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          cardBorder: "hover:border-blue-500/40",
          badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        }
      case "resume":
        return {
          icon: FileText,
          badge: badgeLabel || "PDF RESUME",
          iconBg: "bg-rose-500/10 text-[#F42A18] border-[#F42A18]/20",
          cardBorder: "hover:border-[#F42A18]/40",
          badgeClass: "bg-rose-500/10 text-[#F42A18] border-[#F42A18]/20",
        }
      case "certificate":
        return {
          icon: Award,
          badge: badgeLabel || (isPdf ? "PDF CERT" : "CERTIFICATE"),
          iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          cardBorder: "hover:border-emerald-500/40",
          badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        }
      default:
        return {
          icon: isPdf ? FileText : isImage ? FileCheck : File,
          badge: badgeLabel || (isPdf ? "PDF" : isImage ? "IMAGE" : "FILE"),
          iconBg: isPdf
            ? "bg-rose-500/10 text-[#F42A18] border-[#F42A18]/20"
            : isImage
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
          cardBorder: "hover:border-neutral-300 dark:hover:border-neutral-700",
          badgeClass: "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700",
        }
    }
  }

  const config = getCategoryConfig()
  const IconComponent = config.icon

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onPreview) {
      onPreview(url, title, detectedType)
    } else {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 p-4 flex flex-col justify-between gap-3.5 shadow-xs transition-all duration-200 ${config.cardBorder} ${className}`}
    >
      {/* File Card Header & Thumbnail */}
      <div className="space-y-3">
        {/* Optional Visual Thumbnail / PDF Container */}
        {showThumbnail && (
          <div>
            {isImage ? (
              <div
                onClick={handlePreviewClick}
                className="w-full h-32 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 cursor-pointer relative group"
              >
                <img
                  src={url}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white text-xs font-semibold transition-opacity duration-200">
                  <Eye className="w-4 h-4" />
                  <span>Preview Image</span>
                </div>
              </div>
            ) : (
              <div
                onClick={handlePreviewClick}
                className="w-full h-28 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800/80 flex flex-col items-center justify-center gap-1.5 cursor-pointer group hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              >
                <div className={`p-2.5 rounded-xl border ${config.iconBg}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                  Click to Preview {config.badge}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Title, Badge & Meta info */}
        <div className="flex items-start gap-3">
          {!showThumbnail && (
            <div className={`p-2.5 rounded-xl border shrink-0 ${config.iconBg}`}>
              <IconComponent className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate" title={title}>
                {title}
              </h4>
              <Badge
                variant="outline"
                className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md shrink-0 ${config.badgeClass}`}
              >
                {config.badge}
              </Badge>
            </div>

            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate font-mono" title={fileName}>
              {fileName}
            </p>

            {subtitle && (
              <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                <span>{subtitle}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons: Preview & Download */}
      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handlePreviewClick}
          className="flex-1 text-xs h-8 rounded-xl border-neutral-200 dark:border-neutral-800 hover:border-[#F42A18] hover:text-[#F42A18] cursor-pointer font-semibold"
        >
          <Eye className="w-3.5 h-3.5 mr-1 text-[#F42A18]" />
          Preview
        </Button>

        <a
          href={url}
          download={fileName}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center h-8 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer shrink-0"
          title={`Download ${fileName}`}
        >
          <Download className="w-3.5 h-3.5 mr-1" />
          Download
        </a>
      </div>
    </div>
  )
}

export interface FilePreviewModalProps {
  isOpen: boolean
  title: string
  url: string
  fileType?: "pdf" | "image" | "document"
  onClose: () => void
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  title,
  url,
  fileType,
  onClose,
}) => {
  if (!isOpen || !url) return null

  const resolvedType = fileType || detectFileType(url)
  const isPdf = resolvedType === "pdf"
  const isImage = resolvedType === "image"
  const fileName = extractFileName(url, `${title.replace(/\s+/g, "_")}.${isPdf ? "pdf" : isImage ? "png" : "doc"}`)

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 text-left"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-neutral-800 bg-neutral-950/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-[#F42A18]/10 text-[#F42A18] border border-[#F42A18]/20 shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm sm:text-base truncate">{title}</h3>
              <p className="text-xs text-neutral-400 truncate font-mono">{fileName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in New Tab</span>
            </a>

            <a
              href={url}
              download={fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#F42A18] hover:bg-[#d92212] text-xs font-bold text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Viewer */}
        <div className="flex-1 overflow-auto p-4 bg-neutral-950 flex items-center justify-center min-h-[450px]">
          {isImage ? (
            <div className="relative max-w-full max-h-[75vh] flex items-center justify-center">
              <img
                src={url}
                alt={title}
                className="max-w-full max-h-[75vh] object-contain rounded-xl border border-white/10 shadow-2xl"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={url}
              title={title}
              className="w-full h-[75vh] rounded-xl border border-neutral-800 bg-white"
            />
          ) : (
            <div className="text-center space-y-4 p-8">
              <File className="w-16 h-16 text-neutral-500 mx-auto" />
              <div>
                <h4 className="text-white font-bold text-base">Document Attachment</h4>
                <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                  This document format cannot be previewed directly in the browser iframe. Click below to download and inspect.
                </p>
              </div>
              <a
                href={url}
                download={fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F42A18] hover:bg-[#D92212] text-white text-xs font-bold transition-colors"
              >
                <Download className="w-4 h-4" />
                Download File to View
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FileDocumentCard
