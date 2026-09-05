import { apiClient } from "@/lib/api-client"
import type { FullUserProfileResponse } from "../types/profile.types"

export interface UpdateStudentProfilePayload {
  name?: string
  avatar?: string | null
  bio?: string | null
  phone?: string | null
  headline?: string | null
  education?: string | null
  interests?: string[]
}

export interface UpdateTeacherProfilePayload {
  name?: string
  avatar?: string | null
  bio?: string | null
  phone?: string | null
  headline?: string | null
  expertise?: string[]
  qualifications?: string | null
  experienceYears?: number | null
  linkedinUrl?: string | null
  twitterUrl?: string | null
  websiteUrl?: string | null
}

export interface ProfileApiResponse {
  message: string
  data: {
    profile: FullUserProfileResponse
  }
}

export const profileApi = {
  getProfile: async (): Promise<FullUserProfileResponse> => {
    const res = await apiClient<ProfileApiResponse>("/profile", {
      method: "GET",
    })
    return res.data.profile
  },

  updateProfile: async (
    payload: Partial<UpdateStudentProfilePayload & UpdateTeacherProfilePayload>
  ): Promise<FullUserProfileResponse> => {
    const res = await apiClient<ProfileApiResponse>("/profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
    return res.data.profile
  },

  updateStudentProfile: async (
    payload: UpdateStudentProfilePayload
  ): Promise<FullUserProfileResponse> => {
    const res = await apiClient<ProfileApiResponse>("/profile/student", {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
    return res.data.profile
  },

  updateTeacherProfile: async (
    payload: UpdateTeacherProfilePayload
  ): Promise<FullUserProfileResponse> => {
    const res = await apiClient<ProfileApiResponse>("/profile/teacher", {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
    return res.data.profile
  },
}

export default profileApi
