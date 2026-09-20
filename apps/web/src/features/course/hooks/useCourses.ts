import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { courseApi } from "../api/course.api";
import type {
  CreateCoursePayload,
  UpdateCoursePayload,
  CreateModulePayload,
  UpdateModulePayload,
  CreateLessonPayload,
  UpdateLessonPayload,
  ReorderItemPayload,
  CourseQueryParams,
} from "../types/course.types";

export const COURSE_QUERY_KEYS = {
  all: ["courses"] as const,
  publicList: (params?: CourseQueryParams) => [...COURSE_QUERY_KEYS.all, "public-list", params] as const,
  publicFeatured: () => [...COURSE_QUERY_KEYS.all, "featured"] as const,
  publicTrending: () => [...COURSE_QUERY_KEYS.all, "trending"] as const,
  publicDetail: (slug: string) => [...COURSE_QUERY_KEYS.all, "public-detail", slug] as const,
  teacherList: (params?: CourseQueryParams) => [...COURSE_QUERY_KEYS.all, "teacher-list", params] as const,
  teacherMetrics: () => [...COURSE_QUERY_KEYS.all, "teacher-metrics"] as const,
  teacherDetail: (id: string) => [...COURSE_QUERY_KEYS.all, "teacher-detail", id] as const,
  adminList: (params?: CourseQueryParams) => [...COURSE_QUERY_KEYS.all, "admin-list", params] as const,
  adminMetrics: () => [...COURSE_QUERY_KEYS.all, "admin-metrics"] as const,
  adminDetail: (id: string) => [...COURSE_QUERY_KEYS.all, "admin-detail", id] as const,
};

// ================= 1. PUBLIC HOOKS =================
export const usePublicCourses = (params?: CourseQueryParams) => {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.publicList(params),
    queryFn: () => courseApi.getPublicCourses(params),
  });
};

export const useFeaturedCourses = (limit = 6) => {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.publicFeatured(),
    queryFn: () => courseApi.getFeaturedCourses(limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTrendingCourses = (limit = 6) => {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.publicTrending(),
    queryFn: () => courseApi.getTrendingCourses(limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCourseBySlug = (slug: string) => {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.publicDetail(slug),
    queryFn: () => courseApi.getCourseBySlug(slug),
    enabled: !!slug,
  });
};

// ================= 2. TEACHER STUDIO HOOKS =================
export const useTeacherCourses = (params?: CourseQueryParams) => {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.teacherList(params),
    queryFn: () => courseApi.getTeacherCourses(params),
  });
};

export const useTeacherCourseMetrics = () => {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.teacherMetrics(),
    queryFn: () => courseApi.getTeacherMetrics(),
  });
};

export const useTeacherCourse = (id: string) => {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.teacherDetail(id),
    queryFn: () => courseApi.getTeacherCourseById(id),
    enabled: !!id,
  });
};

export const useTeacherCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCoursePayload) => courseApi.createCourse(payload),
    onSuccess: (data) => {
      toast.success(`Course "${data.title}" is now live on the platform!`);
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to create course");
    },
  });
};

export const useTeacherUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCoursePayload }) =>
      courseApi.updateCourse(id, payload),
    onSuccess: (data) => {
      toast.success(`Course "${data.title}" updated successfully`);
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update course");
    },
  });
};

export const useTeacherDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => courseApi.deleteCourse(id),
    onSuccess: (data) => {
      toast.success(`Course "${data.title}" archived`);
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to archive course");
    },
  });
};

export const useTeacherSubmitForReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => courseApi.submitForReview(id),
    onSuccess: (data) => {
      toast.success(`Course "${data.title}" submitted for review!`);
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to submit course for review");
    },
  });
};

// Curriculum Module Mutations
export const useTeacherCreateModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, payload }: { courseId: string; payload: CreateModulePayload }) =>
      courseApi.createModule(courseId, payload),
    onSuccess: () => {
      toast.success("Module created successfully");
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to create module");
    },
  });
};

export const useTeacherUpdateModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, payload }: { moduleId: string; payload: UpdateModulePayload }) =>
      courseApi.updateModule(moduleId, payload),
    onSuccess: () => {
      toast.success("Module updated");
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update module");
    },
  });
};

export const useTeacherDeleteModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (moduleId: string) => courseApi.deleteModule(moduleId),
    onSuccess: () => {
      toast.success("Module deleted");
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete module");
    },
  });
};

export const useTeacherReorderModules = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, items }: { courseId: string; items: ReorderItemPayload[] }) =>
      courseApi.reorderModules(courseId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
    },
  });
};

// Curriculum Lesson Mutations
export const useTeacherCreateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, payload }: { moduleId: string; payload: CreateLessonPayload }) =>
      courseApi.createLesson(moduleId, payload),
    onSuccess: () => {
      toast.success("Lesson created successfully");
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to create lesson");
    },
  });
};

export const useTeacherUpdateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, payload }: { lessonId: string; payload: UpdateLessonPayload }) =>
      courseApi.updateLesson(lessonId, payload),
    onSuccess: () => {
      toast.success("Lesson updated");
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update lesson");
    },
  });
};

export const useTeacherDeleteLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) => courseApi.deleteLesson(lessonId),
    onSuccess: () => {
      toast.success("Lesson deleted");
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete lesson");
    },
  });
};

export const useTeacherReorderLessons = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, items }: { moduleId: string; items: ReorderItemPayload[] }) =>
      courseApi.reorderLessons(moduleId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
    },
  });
};

// ================= 3. ADMIN MODERATION HOOKS =================
export const useAdminCourses = (params?: CourseQueryParams) => {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.adminList(params),
    queryFn: () => courseApi.adminGetAllCourses(params),
  });
};

export const useAdminCourseMetrics = () => {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.adminMetrics(),
    queryFn: () => courseApi.adminGetMetrics(),
  });
};

export const useAdminCourse = (id: string) => {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.adminDetail(id),
    queryFn: () => courseApi.adminGetCourseById(id),
    enabled: !!id,
  });
};

export const useAdminReviewCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, rejectionReason }: { id: string; action: "APPROVE" | "REJECT"; rejectionReason?: string }) =>
      courseApi.adminReviewCourse(id, action, rejectionReason),
    onSuccess: (data) => {
      toast.success(`Course "${data.title}" review processed`);
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to review course");
    },
  });
};

export const useAdminToggleFeaturedCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      courseApi.adminToggleFeatured(id, isFeatured),
    onSuccess: (data) => {
      toast.success(`Course "${data.title}" featured status updated`);
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update featured status");
    },
  });
};

export const useAdminToggleTrendingCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isTrending }: { id: string; isTrending: boolean }) =>
      courseApi.adminToggleTrending(id, isTrending),
    onSuccess: (data) => {
      toast.success(`Course "${data.title}" trending status updated`);
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update trending status");
    },
  });
};

export const useAdminSoftDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => courseApi.adminSoftDelete(id),
    onSuccess: (data) => {
      toast.success(`Course "${data.title}" moved to archive`);
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to archive course");
    },
  });
};

export const useAdminRestoreCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => courseApi.adminRestore(id),
    onSuccess: (data) => {
      toast.success(`Course "${data.title}" restored to drafts`);
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to restore course");
    },
  });
};

export const useAdminHardDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => courseApi.adminHardDelete(id),
    onSuccess: () => {
      toast.success("Course permanently purged");
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete course");
    },
  });
};
