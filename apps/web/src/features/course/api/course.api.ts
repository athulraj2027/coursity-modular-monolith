import { apiClient } from "@/lib/api-client";
import type {
  Course,
  CourseModule,
  CourseLesson,
  CourseMetrics,
  CreateCoursePayload,
  UpdateCoursePayload,
  CreateModulePayload,
  UpdateModulePayload,
  CreateLessonPayload,
  UpdateLessonPayload,
  ReorderItemPayload,
  CourseQueryParams,
} from "../types/course.types";

export const courseApi = {
  // ================= 1. PUBLIC DISCOVERY =================
  getPublicCourses: async (params?: CourseQueryParams): Promise<{ items: Course[]; total: number }> => {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.categoryId) query.append("categoryId", params.categoryId);
    if (params?.subcategoryId) query.append("subcategoryId", params.subcategoryId);
    if (params?.level) query.append("level", params.level);
    if (params?.pricingType) query.append("pricingType", params.pricingType);
    if (params?.language) query.append("language", params.language);
    if (params?.isFeatured !== undefined) query.append("isFeatured", String(params.isFeatured));
    if (params?.isTrending !== undefined) query.append("isTrending", String(params.isTrending));
    if (params?.minPrice !== undefined) query.append("minPrice", String(params.minPrice));
    if (params?.maxPrice !== undefined) query.append("maxPrice", String(params.maxPrice));
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.sortBy) query.append("sortBy", params.sortBy);
    if (params?.sortOrder) query.append("sortOrder", params.sortOrder);

    const queryString = query.toString();
    const res = await apiClient<{ success: boolean; data: Course[]; meta?: { total: number } }>(
      `/courses${queryString ? `?${queryString}` : ""}`,
      { method: "GET" }
    );
    return { items: res.data, total: res.meta?.total ?? res.data.length };
  },

  getFeaturedCourses: async (limit = 6): Promise<Course[]> => {
    const res = await apiClient<{ success: boolean; data: Course[] }>(
      `/courses/featured?limit=${limit}`,
      { method: "GET" }
    );
    return res.data;
  },

  getTrendingCourses: async (limit = 6): Promise<Course[]> => {
    const res = await apiClient<{ success: boolean; data: Course[] }>(
      `/courses/trending?limit=${limit}`,
      { method: "GET" }
    );
    return res.data;
  },

  getCourseBySlug: async (slug: string): Promise<Course> => {
    const res = await apiClient<{ success: boolean; data: Course }>(
      `/courses/slug/${slug}`,
      { method: "GET" }
    );
    return res.data;
  },

  // ================= 2. TEACHER STUDIO =================
  getTeacherCourses: async (params?: CourseQueryParams): Promise<{ items: Course[]; total: number }> => {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.status) query.append("status", params.status);
    if (params?.categoryId) query.append("categoryId", params.categoryId);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.sortBy) query.append("sortBy", params.sortBy);
    if (params?.sortOrder) query.append("sortOrder", params.sortOrder);

    const queryString = query.toString();
    const res = await apiClient<{ success: boolean; data: Course[]; meta?: { total: number } }>(
      `/courses/teacher/mine${queryString ? `?${queryString}` : ""}`,
      { method: "GET" }
    );
    return { items: res.data, total: res.meta?.total ?? res.data.length };
  },

  getTeacherMetrics: async (): Promise<CourseMetrics> => {
    const res = await apiClient<{ success: boolean; data: CourseMetrics }>(
      "/courses/teacher/metrics",
      { method: "GET" }
    );
    return res.data;
  },

  getTeacherCourseById: async (id: string): Promise<Course> => {
    const res = await apiClient<{ success: boolean; data: Course }>(
      `/courses/teacher/${id}`,
      { method: "GET" }
    );
    return res.data;
  },

  createCourse: async (payload: CreateCoursePayload): Promise<Course> => {
    const res = await apiClient<{ success: boolean; message: string; data: Course }>(
      "/courses/teacher",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  updateCourse: async (id: string, payload: UpdateCoursePayload): Promise<Course> => {
    const res = await apiClient<{ success: boolean; message: string; data: Course }>(
      `/courses/teacher/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  deleteCourse: async (id: string): Promise<Course> => {
    const res = await apiClient<{ success: boolean; message: string; data: Course }>(
      `/courses/teacher/${id}`,
      { method: "DELETE" }
    );
    return res.data;
  },

  submitForReview: async (id: string): Promise<Course> => {
    const res = await apiClient<{ success: boolean; message: string; data: Course }>(
      `/courses/teacher/${id}/submit-review`,
      { method: "POST" }
    );
    return res.data;
  },

  // Modules
  createModule: async (courseId: string, payload: CreateModulePayload): Promise<CourseModule> => {
    const res = await apiClient<{ success: boolean; message: string; data: CourseModule }>(
      `/courses/teacher/${courseId}/modules`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  updateModule: async (moduleId: string, payload: UpdateModulePayload): Promise<CourseModule> => {
    const res = await apiClient<{ success: boolean; message: string; data: CourseModule }>(
      `/courses/teacher/modules/${moduleId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  deleteModule: async (moduleId: string): Promise<boolean> => {
    const res = await apiClient<{ success: boolean; message: string }>(
      `/courses/teacher/modules/${moduleId}`,
      { method: "DELETE" }
    );
    return res.success;
  },

  reorderModules: async (courseId: string, items: ReorderItemPayload[]): Promise<boolean> => {
    const res = await apiClient<{ success: boolean; message: string }>(
      `/courses/teacher/${courseId}/modules/reorder`,
      {
        method: "POST",
        body: JSON.stringify({ items }),
      }
    );
    return res.success;
  },

  // Lessons
  createLesson: async (moduleId: string, payload: CreateLessonPayload): Promise<CourseLesson> => {
    const res = await apiClient<{ success: boolean; message: string; data: CourseLesson }>(
      `/courses/teacher/modules/${moduleId}/lessons`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  updateLesson: async (lessonId: string, payload: UpdateLessonPayload): Promise<CourseLesson> => {
    const res = await apiClient<{ success: boolean; message: string; data: CourseLesson }>(
      `/courses/teacher/lessons/${lessonId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  deleteLesson: async (lessonId: string): Promise<boolean> => {
    const res = await apiClient<{ success: boolean; message: string }>(
      `/courses/teacher/lessons/${lessonId}`,
      { method: "DELETE" }
    );
    return res.success;
  },

  reorderLessons: async (moduleId: string, items: ReorderItemPayload[]): Promise<boolean> => {
    const res = await apiClient<{ success: boolean; message: string }>(
      `/courses/teacher/modules/${moduleId}/lessons/reorder`,
      {
        method: "POST",
        body: JSON.stringify({ items }),
      }
    );
    return res.success;
  },

  // ================= 3. ADMIN MODERATION =================
  adminGetAllCourses: async (params?: CourseQueryParams): Promise<{ items: Course[]; total: number }> => {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.status) query.append("status", params.status);
    if (params?.categoryId) query.append("categoryId", params.categoryId);
    if (params?.isDeleted !== undefined) query.append("isDeleted", String(params.isDeleted));
    if (params?.includeDeleted) query.append("includeDeleted", "true");
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.sortBy) query.append("sortBy", params.sortBy);
    if (params?.sortOrder) query.append("sortOrder", params.sortOrder);

    const queryString = query.toString();
    const res = await apiClient<{ success: boolean; data: Course[]; meta?: { total: number } }>(
      `/courses/admin/all${queryString ? `?${queryString}` : ""}`,
      { method: "GET" }
    );
    return { items: res.data, total: res.meta?.total ?? res.data.length };
  },

  adminGetMetrics: async (): Promise<CourseMetrics> => {
    const res = await apiClient<{ success: boolean; data: CourseMetrics }>(
      "/courses/admin/metrics",
      { method: "GET" }
    );
    return res.data;
  },

  adminGetCourseById: async (id: string): Promise<Course> => {
    const res = await apiClient<{ success: boolean; data: Course }>(
      `/courses/admin/${id}`,
      { method: "GET" }
    );
    return res.data;
  },

  adminReviewCourse: async (id: string, action: "APPROVE" | "REJECT", rejectionReason?: string): Promise<Course> => {
    const res = await apiClient<{ success: boolean; message: string; data: Course }>(
      `/courses/admin/${id}/review`,
      {
        method: "POST",
        body: JSON.stringify({ action, rejectionReason }),
      }
    );
    return res.data;
  },

  adminToggleFeatured: async (id: string, isFeatured: boolean): Promise<Course> => {
    const res = await apiClient<{ success: boolean; message: string; data: Course }>(
      `/courses/admin/${id}/featured`,
      {
        method: "PATCH",
        body: JSON.stringify({ isFeatured }),
      }
    );
    return res.data;
  },

  adminToggleTrending: async (id: string, isTrending: boolean): Promise<Course> => {
    const res = await apiClient<{ success: boolean; message: string; data: Course }>(
      `/courses/admin/${id}/trending`,
      {
        method: "PATCH",
        body: JSON.stringify({ isTrending }),
      }
    );
    return res.data;
  },

  adminSoftDelete: async (id: string): Promise<Course> => {
    const res = await apiClient<{ success: boolean; message: string; data: Course }>(
      `/courses/admin/${id}`,
      { method: "DELETE" }
    );
    return res.data;
  },

  adminRestore: async (id: string): Promise<Course> => {
    const res = await apiClient<{ success: boolean; message: string; data: Course }>(
      `/courses/admin/${id}/restore`,
      { method: "POST" }
    );
    return res.data;
  },

  adminHardDelete: async (id: string): Promise<boolean> => {
    const res = await apiClient<{ success: boolean; message: string }>(
      `/courses/admin/${id}/permanent`,
      { method: "DELETE" }
    );
    return res.success;
  },
};

export default courseApi;
