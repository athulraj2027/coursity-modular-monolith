import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lectureApi } from "../api/lecture.api";
import { toast } from "react-toastify";
import type {
  CreateLecturePayload,
  UpdateLecturePayload,
  LectureFilterParams,
} from "../types/lecture.types";

export const LECTURE_QUERY_KEYS = {
  all: ["lectures"] as const,
  teacherList: (params?: LectureFilterParams) => ["lectures", "teacher", params] as const,
  teacherDetail: (id: string) => ["lectures", "teacher", id] as const,
  adminList: (params?: LectureFilterParams) => ["lectures", "admin", params] as const,
  adminDetail: (id: string) => ["lectures", "admin", id] as const,
  studentList: (params?: LectureFilterParams) => ["lectures", "student", params] as const,
  studentDetail: (id: string) => ["lectures", "student", id] as const,
};

// ================= TEACHER HOOKS =================

export function useTeacherLectures(params?: LectureFilterParams) {
  return useQuery({
    queryKey: LECTURE_QUERY_KEYS.teacherList(params),
    queryFn: () => lectureApi.teacherGetLectures(params),
  });
}

export function useTeacherLectureDetail(id: string) {
  return useQuery({
    queryKey: LECTURE_QUERY_KEYS.teacherDetail(id),
    queryFn: () => lectureApi.teacherGetLectureDetail(id),
    enabled: Boolean(id),
  });
}

export function useTeacherCreateLecture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLecturePayload) => lectureApi.teacherCreateLecture(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Live class lecture created successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create lecture.");
    },
  });
}

export function useTeacherUpdateLecture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLecturePayload }) =>
      lectureApi.teacherUpdateLecture(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      queryClient.invalidateQueries({ queryKey: LECTURE_QUERY_KEYS.teacherDetail(variables.id) });
      toast.success("Lecture updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update lecture.");
    },
  });
}

export function useTeacherDeleteLecture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lectureApi.teacherDeleteLecture(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Lecture deleted successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete lecture.");
    },
  });
}

// ================= ADMIN HOOKS =================

export function useAdminLectures(params?: LectureFilterParams) {
  return useQuery({
    queryKey: LECTURE_QUERY_KEYS.adminList(params),
    queryFn: () => lectureApi.adminGetLectures(params),
  });
}

export function useAdminLectureDetail(id: string) {
  return useQuery({
    queryKey: LECTURE_QUERY_KEYS.adminDetail(id),
    queryFn: () => lectureApi.adminGetLectureDetail(id),
    enabled: Boolean(id),
  });
}

// ================= STUDENT HOOKS =================

export function useStudentLectures(params?: LectureFilterParams) {
  return useQuery({
    queryKey: LECTURE_QUERY_KEYS.studentList(params),
    queryFn: () => lectureApi.studentGetLectures(params),
  });
}

export function useStudentLectureDetail(id: string) {
  return useQuery({
    queryKey: LECTURE_QUERY_KEYS.studentDetail(id),
    queryFn: () => lectureApi.studentGetLectureDetail(id),
    enabled: Boolean(id),
  });
}
