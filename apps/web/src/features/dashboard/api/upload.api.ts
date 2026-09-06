import { apiClient } from "@/lib/api-client"
import type {
  GetPresignedUrlRequest,
  PresignedUrlApiResponse,
  PresignedUrlData,
  UploadFileOptions,
} from "../types/upload.types"

/**
 * Optimizes an image file by resizing and compressing it into a WebP/JPEG Blob.
 */
export async function optimizeImageToBlob(
  file: File,
  maxDimension = 800,
  quality = 0.88
): Promise<{ blob: Blob; fileType: string; fileName: string }> {
  // If not an image, return raw file as-is
  if (!file.type.startsWith("image/")) {
    return { blob: file, fileType: file.type || "application/octet-stream", fileName: file.name }
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
          resolve({ blob: file, fileType: file.type, fileName: file.name })
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
              resolve({ blob: file, fileType: file.type, fileName: file.name })
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
    const res = await apiClient<PresignedUrlApiResponse>("/upload/presigned-url", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    const uploadUrl = res.data?.uploadUrl || res.uploadUrl
    const fileUrl = res.data?.fileUrl || res.fileUrl
    const key = res.data?.key || res.key || ""

    if (!uploadUrl || !fileUrl) {
      throw new Error("Invalid presigned URL response from server")
    }

    return { uploadUrl, fileUrl, key }
  },

  /**
   * Uploads binary file/blob directly to AWS S3 using the presigned URL with progress monitoring.
   */
  uploadDirectToS3: async (
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
          reject(new Error(`S3 upload failed with status ${xhr.status}`))
        }
      }

      xhr.onerror = () => reject(new Error("Network error occurred during direct S3 upload"))
      xhr.onabort = () => reject(new Error("S3 upload was cancelled"))

      xhr.open("PUT", uploadUrl, true)
      xhr.setRequestHeader("Content-Type", fileType)
      xhr.send(blobOrFile)
    })
  },

  /**
   * Complete pipeline:
   * 1. Dynamically optimizes image
   * 2. Requests S3 Presigned URL from backend
   * 3. Streams directly to S3
   * 4. Returns permanent file URL (with automatic fallback to Data URL if S3 is unconfigured)
   */
  uploadFile: async (file: File, options: UploadFileOptions = {}): Promise<string> => {
    const { folder = "avatars", maxDimension = 800, quality = 0.88, onProgress } = options

    const { blob, fileType, fileName } = await optimizeImageToBlob(file, maxDimension, quality)

    try {
      // 1. Get Presigned URL
      const { uploadUrl, fileUrl } = await uploadApi.getPresignedUrl({
        fileName,
        fileType,
        folder,
        fileSize: blob.size,
      })

      // 2. Direct S3 Upload
      await uploadApi.uploadDirectToS3(uploadUrl, blob, fileType, onProgress)

      return fileUrl
    } catch (err: any) {
      console.warn("S3 presigned upload skipped or unavailable, falling back to optimized Data URL:", err?.message)
      return await fileToDataUrl(blob)
    }
  },
}

export default uploadApi
