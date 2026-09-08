import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  profileApi,
  type UpdateStudentProfilePayload,
  type UpdateTeacherProfilePayload,
} from "../api/profile.api"
import { toast } from "@/lib/toast"

export const PROFILE_QUERY_KEY = ["user-profile"] as const

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => profileApi.getProfile(),
    staleTime: 0,
  })
}

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateStudentProfilePayload) =>
      profileApi.updateStudentProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, data)
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      toast.success("Student profile updated successfully")
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update student profile")
    },
  })
}

export function useUpdateTeacherProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateTeacherProfilePayload) =>
      profileApi.updateTeacherProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, data)
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      toast.success("Teacher profile updated successfully")
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update teacher profile")
    },
  })
}

export function useSubmitTeacherVerification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => profileApi.submitTeacherVerification(),
    onSuccess: (res) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, res.profile)
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success(res.message || "Application submitted for verification successfully")
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to submit application for verification")
    },
  })
}
