import { apiClient } from "@/lib/api-client"
import { PROFILE_API_ROUTES } from "../constants/routes.constants"
import type { FullUserProfileResponse } from "../types/profile.types"

export interface UpdateStudentProfilePayload {
  name?: string
  avatar?: string | null
  bio?: string | null
  phone?: string | null
}

export interface UpdateTeacherProfilePayload {
  name?: string
  avatar?: string | null
  bio?: string | null
  phone?: string | null
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
    const res = await apiClient<ProfileApiResponse>(PROFILE_API_ROUTES.BASE, {
      method: "GET",
    })
    return res.data.profile
  },

  updateProfile: async (
    payload: Partial<UpdateStudentProfilePayload & UpdateTeacherProfilePayload>
  ): Promise<FullUserProfileResponse> => {
    const res = await apiClient<ProfileApiResponse>(PROFILE_API_ROUTES.BASE, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
    return res.data.profile
  },

  updateStudentProfile: async (
    payload: UpdateStudentProfilePayload
  ): Promise<FullUserProfileResponse> => {
    const res = await apiClient<ProfileApiResponse>(PROFILE_API_ROUTES.STUDENT, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
    return res.data.profile
  },

  updateTeacherProfile: async (
    payload: UpdateTeacherProfilePayload
  ): Promise<FullUserProfileResponse> => {
    const res = await apiClient<ProfileApiResponse>(PROFILE_API_ROUTES.TEACHER, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
    return res.data.profile
  },

  submitTeacherVerification: async (): Promise<{ profile: FullUserProfileResponse; message: string }> => {
    const res = await apiClient<ProfileApiResponse>(PROFILE_API_ROUTES.SUBMIT_VERIFICATION, {
      method: "POST",
    })
    return {
      profile: res.data.profile,
      message: res.message,
    }
  },
}

export default profileApi
