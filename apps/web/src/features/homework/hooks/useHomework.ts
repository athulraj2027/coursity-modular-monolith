import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { homeworkApi } from "../api/homework.api";
import { homeworkKeys } from "../api/homework.keys";
import type {
  CreateHomeworkPayload,
  UpdateHomeworkPayload,
  SubmitHomeworkPayload,
  ReviewSubmissionPayload,
  HomeworkFilterParams,
} from "../types/homework.types";
import { toast } from "@/lib/toast";

export function useLectureHomework(lectureId: string | undefined | null) {
  return useQuery({
    queryKey: homeworkKeys.byLecture(lectureId || ""),
    queryFn: () => homeworkApi.getHomeworkByLecture(lectureId!),
    enabled: Boolean(lectureId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCourseHomework(courseId: string | undefined | null) {
  return useQuery({
    queryKey: homeworkKeys.byCourse(courseId || ""),
    queryFn: () => homeworkApi.getHomeworkByCourse(courseId!),
    enabled: Boolean(courseId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useHomeworkDetail(id: string | undefined | null) {
  return useQuery({
    queryKey: homeworkKeys.detail(id || ""),
    queryFn: () => homeworkApi.getHomeworkDetail(id!),
    enabled: Boolean(id),
  });
}

export function useHomeworkSubmissions(homeworkId: string | undefined | null) {
  return useQuery({
    queryKey: homeworkKeys.submissions(homeworkId || ""),
    queryFn: () => homeworkApi.getHomeworkSubmissions(homeworkId!),
    enabled: Boolean(homeworkId),
  });
}

export function useAdminHomework(params?: HomeworkFilterParams) {
  return useQuery({
    queryKey: homeworkKeys.adminList(params),
    queryFn: () => homeworkApi.adminListHomework(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateHomework() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateHomeworkPayload) => homeworkApi.createHomework(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: homeworkKeys.byLecture(data.lectureId) });
      queryClient.invalidateQueries({ queryKey: homeworkKeys.byCourse(data.courseId) });
      queryClient.invalidateQueries({ queryKey: homeworkKeys.all });
      toast.success("Homework assignment created successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create homework");
    },
  });
}

export function useUpdateHomework() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateHomeworkPayload }) =>
      homeworkApi.updateHomework(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: homeworkKeys.byLecture(data.lectureId) });
      queryClient.invalidateQueries({ queryKey: homeworkKeys.byCourse(data.courseId) });
      queryClient.invalidateQueries({ queryKey: homeworkKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: homeworkKeys.all });
      toast.success("Homework updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update homework");
    },
  });
}

export function useDeleteHomework() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (homeworkId: string) => homeworkApi.deleteHomework(homeworkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homeworkKeys.all });
      toast.success("Homework assignment deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete homework");
    },
  });
}

export function useSubmitHomework() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      homeworkId,
      payload,
    }: {
      homeworkId: string;
      payload: SubmitHomeworkPayload;
    }) => homeworkApi.submitHomework(homeworkId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: homeworkKeys.detail(data.homeworkId) });
      queryClient.invalidateQueries({ queryKey: homeworkKeys.submissions(data.homeworkId) });
      queryClient.invalidateQueries({ queryKey: homeworkKeys.all });
      toast.success("Homework submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to submit homework");
    },
  });
}

export function useReviewSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      submissionId,
      payload,
    }: {
      submissionId: string;
      payload: ReviewSubmissionPayload;
    }) => homeworkApi.reviewSubmission(submissionId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: homeworkKeys.submissions(data.homeworkId) });
      queryClient.invalidateQueries({ queryKey: homeworkKeys.detail(data.homeworkId) });
      queryClient.invalidateQueries({ queryKey: homeworkKeys.all });
      toast.success(
        data.verificationStatus === "VERIFIED"
          ? "Submission approved & verified!"
          : "Submission marked for redo"
      );
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to review submission");
    },
  });
}
