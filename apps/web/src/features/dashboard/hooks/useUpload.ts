import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { uploadApi } from "../api/upload.api"
import type { UploadFileOptions } from "../types/upload.types"
import { toast } from "@/lib/toast"

export interface UploadMutationParams {
  file: File
  options?: UploadFileOptions
}

export function useUploadFile() {
  const [progress, setProgress] = useState(0)

  const mutation = useMutation({
    mutationFn: async ({ file, options = {} }: UploadMutationParams) => {
      setProgress(0)
      return uploadApi.uploadFile(file, {
        ...options,
        onProgress: (percent) => {
          setProgress(percent)
          options.onProgress?.(percent)
        },
      })
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to upload file")
    },
  })

  return {
    ...mutation,
    uploadFile: mutation.mutateAsync,
    progress,
  }
}

export default useUploadFile
