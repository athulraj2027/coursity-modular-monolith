import { apiClient } from "@/lib/api-client"
import { env } from "@/lib/env"
import { UPLOAD_API_ROUTES } from "../constants/routes.constants"
import type {
  GetPresignedUrlRequest,
  PresignedUrlApiResponse,
  PresignedUrlData,
  UploadFileOptions,
} from "../types/upload.types"

const ALLOWED_MIME_MAP: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  mkv: "video/x-matroska",
  ogg: "video/ogg",
  m4v: "video/m4v",
}

/**
 * Resolves a reliable MIME type from File.type or file extension.
 */
export function resolveMimeType(file: File): string {
  const rawType = (file.type || "").toLowerCase().trim()
  if (rawType && Object.values(ALLOWED_MIME_MAP).includes(rawType)) {
    return rawType
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || ""
  if (ALLOWED_MIME_MAP[ext]) {
    return ALLOWED_MIME_MAP[ext]
  }
  return rawType || "application/octet-stream"
}

/**
 * Optimizes an image file by resizing and compressing it into a WebP/JPEG Blob.
 * Non-raster files (e.g. PDF, SVG) are returned as-is.
 */
export async function optimizeImageToBlob(
  file: File,
  maxDimension = 800,
  quality = 0.88
): Promise<{ blob: Blob; fileType: string; fileName: string }> {
  const resolvedType = resolveMimeType(file)

  // Only resize and re-encode raster images (PNG, JPG, WebP)
  const isBitmapImage =
    resolvedType === "image/jpeg" ||
    resolvedType === "image/png" ||
    resolvedType === "image/webp"

  if (!isBitmapImage) {
    return { blob: file, fileType: resolvedType, fileName: file.name }
  }

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
          resolve({ blob: file, fileType: resolvedType, fileName: file.name })
          return
        }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0, width, height)

        const outputType = "image/webp"
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const baseName = file.name.replace(/\.[^/.]+$/, "")
              resolve({
                blob,
                fileType: outputType,
                fileName: `${baseName}.webp`,
              })
            } else {
              resolve({ blob: file, fileType: resolvedType, fileName: file.name })
            }
          },
          outputType,
          quality
        )
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Converts a Blob or File to a base64 Data URL.
 */
export async function fileToDataUrl(fileOrBlob: Blob | File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Failed to read file as Data URL"))
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(fileOrBlob)
  })
}

export const uploadApi = {
  /**
   * Requests a presigned PUT URL from the backend server.
   */
  getPresignedUrl: async (payload: GetPresignedUrlRequest): Promise<PresignedUrlData> => {
    const res = await apiClient<PresignedUrlApiResponse>(UPLOAD_API_ROUTES.PRESIGNED_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    })

    const uploadUrl = res.data?.uploadUrl || res.uploadUrl
    const fileUrl = res.data?.fileUrl || (res.data as any)?.publicUrl || res.fileUrl || (res as any)?.publicUrl
    const key = res.data?.key || res.key || ""

    if (!uploadUrl || !fileUrl) {
      throw new Error("Invalid presigned URL response from server")
    }

    return { uploadUrl, fileUrl, key }
  },

  /**
   * Uploads binary file/blob directly using XHR with progress monitoring.
   */
  uploadDirectToUrl: async (
    uploadUrl: string,
    blobOrFile: Blob | File,
    fileType: string,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100)
            onProgress(percent)
          }
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          reject(new Error(`Direct upload failed with status ${xhr.status}`))
        }
      }

      xhr.onerror = () => reject(new Error("Network error occurred during direct upload"))
      xhr.onabort = () => reject(new Error("Upload was cancelled"))

      xhr.open("PUT", uploadUrl, true)
      xhr.setRequestHeader("Content-Type", fileType)
      xhr.send(blobOrFile)
    })
  },

  /**
   * Legacy alias for backward compatibility.
   */
  uploadDirectToS3: async (
    uploadUrl: string,
    blobOrFile: Blob | File,
    fileType: string,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    return uploadApi.uploadDirectToUrl(uploadUrl, blobOrFile, fileType, onProgress)
  },

  /**
   * Fallback direct upload to local server storage endpoint when AWS S3 is unavailable or unauthorized.
   */
  uploadDirectToLocal: async (
    key: string,
    blobOrFile: Blob | File,
    fileType: string,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    const cleanKey = key.startsWith("/") ? key.substring(1) : key
    const uploadUrl = `${env.VITE_API_URL}/upload/local?key=${encodeURIComponent(cleanKey)}`
    await uploadApi.uploadDirectToUrl(uploadUrl, blobOrFile, fileType, onProgress)

    // Return the absolute public URL
    const baseUrl = env.VITE_API_URL.replace(/\/api\/?$/, "")
    return `${baseUrl}/uploads/${cleanKey}`
  },

  /**
   * Complete upload pipeline:
   * 1. Resolves MIME type and optimizes images if applicable
   * 2. Requests Presigned PUT URL from backend
   * 3. Performs direct binary upload to S3 or local endpoint
   * 4. Seamlessly falls back to local server storage if S3 PUT fails with 403 Forbidden / Network error
   * 5. Returns public accessible URL
   */
  uploadFile: async (file: File, options: UploadFileOptions = {}): Promise<string> => {
    const { folder = "avatars", maxDimension = 800, quality = 0.88, onProgress } = options

    const { blob, fileType, fileName } = await optimizeImageToBlob(file, maxDimension, quality)

    // 1. Get Presigned URL from Backend
    const { uploadUrl, fileUrl, key } = await uploadApi.getPresignedUrl({
      fileName,
      fileType,
      folder,
      fileSize: blob.size,
    })

    // 2. Direct Upload (S3 or Local)
    try {
      await uploadApi.uploadDirectToUrl(uploadUrl, blob, fileType, onProgress)
      return fileUrl
    } catch (directErr: unknown) {
      const directErrMsg = directErr instanceof Error ? directErr.message : "Storage error"
      console.warn("Direct upload to primary URL failed, attempting local fallback:", directErrMsg)

      // 3. Fallback to Local Storage endpoint if key is available
      if (key) {
        try {
          const localUrl = await uploadApi.uploadDirectToLocal(key, blob, fileType, onProgress)
          return localUrl
        } catch (localErr: unknown) {
          console.error("Local storage fallback failed:", localErr)
          throw new Error(`Upload failed: ${directErrMsg}. Local fallback also failed.`)
        }
      }

      throw directErr
    }
  },
}

export default uploadApi
