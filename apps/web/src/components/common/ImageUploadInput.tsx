import React, { useRef, useState } from "react"
import { Upload, X, Loader2, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/lib/toast"

interface ImageUploadInputProps {
  id?: string
  label?: string
  value?: string | null
  onChange: (value: string) => void
  fallbackName?: string
  maxSizeMB?: number
  disabled?: boolean
  className?: string
  inputRef?: React.RefObject<HTMLInputElement | null>
  hint?: string
}

/**
 * Resizes and compresses an image file to a base64 Data URL using HTML5 Canvas.
 * Keeps output lightweight (~20-50KB) and ensures fast preview and database storage.
 */
async function compressImageFile(file: File, maxDimension = 512, quality = 0.88): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Failed to read image file"))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error("Invalid image format"))
      img.onload = () => {
        let { width, height } = img

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          resolve(reader.result as string)
          return
        }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0, width, height)

        try {
          // Try WebP first for ultra-lightweight size
          const webpData = canvas.toDataURL("image/webp", quality)
          if (webpData.startsWith("data:image/webp")) {
            resolve(webpData)
            return
          }
        } catch {
          // fallback to jpeg
        }

        const jpegData = canvas.toDataURL("image/jpeg", quality)
        resolve(jpegData)
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  id = "avatar-upload",
  label = "Profile Picture",
  value,
  onChange,
  fallbackName = "User",
  maxSizeMB = 5,
  disabled = false,
  className = "",
  inputRef,
  hint = "Supports PNG, JPG, WebP or GIF up to 5MB. Auto-optimized for profile display.",
}) => {
  const localInputRef = useRef<HTMLInputElement>(null)
  const actualInputRef = inputRef || localInputRef
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const previewUrl =
    value ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName || "User")}&background=F42A18&color=fff&size=200`

  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WEBP, or GIF)")
      return
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image size must be less than ${maxSizeMB}MB`)
      return
    }

    setIsProcessing(true)
    try {
      const compressedDataUrl = await compressImageFile(file)
      onChange(compressedDataUrl)
      toast.success("Image selected and optimized successfully")
    } catch (err: any) {
      toast.error(err?.message || "Failed to process image")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileProcess(file)
    }
    // Reset file input value so same file can be re-selected if needed
    e.target.value = ""
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
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
    if (disabled) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileProcess(file)
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {label && (
        <Label htmlFor={id} className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          {label}
        </Label>
      )}

      {/* Hidden native file input */}
      <input
        ref={actualInputRef}
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleInputChange}
        disabled={disabled || isProcessing}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col sm:flex-row items-center gap-5 p-4 sm:p-5 rounded-2xl border-2 border-dashed transition-all ${
          isDragging
            ? "border-[#F42A18] bg-[#F42A18]/5 dark:bg-[#F42A18]/10 ring-4 ring-[#F42A18]/10"
            : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 hover:border-neutral-300 dark:hover:border-neutral-700"
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {/* Avatar Preview */}
        <div className="relative shrink-0 group">
          <img
            src={previewUrl}
            alt="Avatar preview"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white dark:border-neutral-800 shadow-md bg-neutral-100 dark:bg-neutral-800"
          />

          {isProcessing ? (
            <div className="absolute inset-0 rounded-2xl bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center text-white">
              <Loader2 className="w-6 h-6 animate-spin text-[#F42A18]" />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => actualInputRef.current?.click()}
              disabled={disabled}
              title="Upload new image"
              className="absolute inset-0 rounded-2xl bg-neutral-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-[11px] font-medium cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <span>Change</span>
            </button>
          )}
        </div>

        {/* Upload Action Area */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => actualInputRef.current?.click()}
              disabled={disabled || isProcessing}
              className="gap-2 rounded-xl text-xs font-semibold cursor-pointer border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-[#F42A18]" />
                  Upload Photo
                </>
              )}
            </Button>

            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={disabled || isProcessing}
                className="gap-1.5 rounded-xl text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </Button>
            )}
          </div>

          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
            {hint}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ImageUploadInput
