import { apiClient } from "@/lib/api-client";
import type {
  Lecture,
  CreateLecturePayload,
  UpdateLecturePayload,
  LectureFilterParams,
  LecturesListResponse,
} from "../types/lecture.types";

export const lectureApi = {
  // ================= 1. TEACHER STUDIO API =================
  teacherGetLectures: async (params?: LectureFilterParams): Promise<LecturesListResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.search) query.append("search", params.search);
    if (params?.courseId) query.append("courseId", params.courseId);
    if (params?.status) query.append("status", params.status);
    if (params?.sort) query.append("sort", params.sort);

    const queryString = query.toString();
    const res = await apiClient<{ success: boolean; data: LecturesListResponse }>(
      `/lectures/teacher${queryString ? `?${queryString}` : ""}`,
      { method: "GET" }
    );
    return res.data;
  },

  teacherGetLectureDetail: async (id: string): Promise<Lecture> => {
    const res = await apiClient<{ success: boolean; data: Lecture }>(
      `/lectures/teacher/${id}`,
      { method: "GET" }
    );
    return res.data;
  },

  teacherCreateLecture: async (payload: CreateLecturePayload): Promise<Lecture> => {
    const res = await apiClient<{ success: boolean; data: Lecture; message?: string }>(
      "/lectures/teacher",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  teacherUpdateLecture: async (id: string, payload: UpdateLecturePayload): Promise<Lecture> => {
    const res = await apiClient<{ success: boolean; data: Lecture; message?: string }>(
      `/lectures/teacher/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  teacherDeleteLecture: async (id: string): Promise<boolean> => {
    await apiClient<{ success: boolean; message?: string }>(
      `/lectures/teacher/${id}`,
      { method: "DELETE" }
    );
    return true;
  },

  // ================= 2. ADMIN DIRECTORY API =================
  adminGetLectures: async (params?: LectureFilterParams): Promise<LecturesListResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.search) query.append("search", params.search);
    if (params?.courseId) query.append("courseId", params.courseId);
    if (params?.teacherProfileId) query.append("teacherProfileId", params.teacherProfileId);
    if (params?.status) query.append("status", params.status);
    if (params?.sort) query.append("sort", params.sort);

    const queryString = query.toString();
    const res = await apiClient<{ success: boolean; data: LecturesListResponse }>(
      `/lectures/admin${queryString ? `?${queryString}` : ""}`,
      { method: "GET" }
    );
    return res.data;
  },

  adminGetLectureDetail: async (id: string): Promise<Lecture> => {
    const res = await apiClient<{ success: boolean; data: Lecture }>(
      `/lectures/admin/${id}`,
      { method: "GET" }
    );
    return res.data;
  },

  // ================= 3. STUDENT ENROLLED API =================
  studentGetLectures: async (params?: LectureFilterParams): Promise<LecturesListResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.search) query.append("search", params.search);
    if (params?.courseId) query.append("courseId", params.courseId);
    if (params?.status) query.append("status", params.status);
    if (params?.sort) query.append("sort", params.sort);

    const queryString = query.toString();
    const res = await apiClient<{ success: boolean; data: LecturesListResponse }>(
      `/lectures/student${queryString ? `?${queryString}` : ""}`,
      { method: "GET" }
    );
    return res.data;
  },

  studentGetLectureDetail: async (id: string): Promise<Lecture> => {
    const res = await apiClient<{ success: boolean; data: Lecture }>(
      `/lectures/student/${id}`,
      { method: "GET" }
    );
    return res.data;
  },
};
