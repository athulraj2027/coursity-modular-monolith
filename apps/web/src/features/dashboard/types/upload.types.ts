export interface GetPresignedUrlRequest {
  fileName: string
  fileType: string
  folder?: string
  fileSize?: number
}

export interface PresignedUrlData {
  uploadUrl: string
  fileUrl: string
  key: string
}

export interface PresignedUrlApiResponse {
  message?: string
  data?: PresignedUrlData
  uploadUrl?: string
  fileUrl?: string
  key?: string
}

export interface UploadFileOptions {
  folder?: string
  maxDimension?: number
  quality?: number
  onProgress?: (progress: number) => void
}
