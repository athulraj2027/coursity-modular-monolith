import { apiClient } from "@/lib/api-client";
import type {
  Homework,
  HomeworkSubmission,
  CreateHomeworkPayload,
  UpdateHomeworkPayload,
  SubmitHomeworkPayload,
  ReviewSubmissionPayload,
  HomeworkFilterParams,
  HomeworkListResponse,
  HomeworkSubmissionsListResponse,
} from "../types/homework.types";

export const homeworkApi = {
  createHomework: async (payload: CreateHomeworkPayload): Promise<Homework> => {
    const res = await apiClient<{ success: boolean; data: Homework; message?: string }>(
      "/homework",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  getHomeworkByLecture: async (lectureId: string): Promise<Homework[]> => {
    const res = await apiClient<{ success: boolean; data: Homework[] }>(
      `/homework/lecture/${lectureId}`,
      { method: "GET" }
    );
    return res.data;
  },

  getHomeworkByCourse: async (courseId: string): Promise<Homework[]> => {
    const res = await apiClient<{ success: boolean; data: Homework[] }>(
      `/homework/course/${courseId}`,
      { method: "GET" }
    );
    return res.data;
  },

  getHomeworkDetail: async (id: string): Promise<Homework> => {
    const res = await apiClient<{ success: boolean; data: Homework }>(
      `/homework/${id}`,
      { method: "GET" }
    );
    return res.data;
  },

  updateHomework: async (id: string, payload: UpdateHomeworkPayload): Promise<Homework> => {
    const res = await apiClient<{ success: boolean; data: Homework; message?: string }>(
      `/homework/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  deleteHomework: async (id: string): Promise<boolean> => {
    await apiClient<{ success: boolean; message?: string }>(
      `/homework/${id}`,
      { method: "DELETE" }
    );
    return true;
  },

  submitHomework: async (
    homeworkId: string,
    payload: SubmitHomeworkPayload
  ): Promise<HomeworkSubmission> => {
    const res = await apiClient<{ success: boolean; data: HomeworkSubmission; message?: string }>(
      `/homework/${homeworkId}/submit`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  getMySubmission: async (homeworkId: string): Promise<HomeworkSubmission | null> => {
    const res = await apiClient<{ success: boolean; data: HomeworkSubmission | null }>(
      `/homework/${homeworkId}/my-submission`,
      { method: "GET" }
    );
    return res.data;
  },

  getHomeworkSubmissions: async (
    homeworkId: string
  ): Promise<HomeworkSubmissionsListResponse> => {
    const res = await apiClient<{
      success: boolean;
      data: HomeworkSubmissionsListResponse;
    }>(`/homework/${homeworkId}/submissions`, { method: "GET" });
    return res.data;
  },

  reviewSubmission: async (
    submissionId: string,
    payload: ReviewSubmissionPayload
  ): Promise<HomeworkSubmission> => {
    const res = await apiClient<{
      success: boolean;
      data: HomeworkSubmission;
      message?: string;
    }>(`/homework/submissions/${submissionId}/review`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  adminListHomework: async (
    params?: HomeworkFilterParams
  ): Promise<HomeworkListResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.search) query.append("search", params.search);
    if (params?.courseId) query.append("courseId", params.courseId);
    if (params?.lectureId) query.append("lectureId", params.lectureId);
    if (params?.teacherProfileId) query.append("teacherProfileId", params.teacherProfileId);
    if (params?.sort) query.append("sort", params.sort);

    const queryString = query.toString();
    const res = await apiClient<{ success: boolean; data: HomeworkListResponse }>(
      `/homework/admin/all${queryString ? `?${queryString}` : ""}`,
      { method: "GET" }
    );
    return res.data;
  },
};
