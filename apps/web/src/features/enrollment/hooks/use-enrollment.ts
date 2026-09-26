import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enrollmentApi } from "../api/enrollment.api";
import type {
  CreateOrderPayload,
  VerifyPaymentPayload,
  PayWithWalletPayload,
  RequestRefundPayload,
} from "../types/enrollment.types";
import { toast } from "@/lib/toast";

export const enrollmentKeys = {
  all: ["enrollments"] as const,
  mine: (status?: string) => [...enrollmentKeys.all, "mine", status] as const,
  classroom: (slug: string) => [...enrollmentKeys.all, "classroom", slug] as const,
  certificate: (code: string) => [...enrollmentKeys.all, "certificate", code] as const,
  teacherStudents: (courseId: string) => [...enrollmentKeys.all, "teacher", courseId, "students"] as const,
  teacherList: (params?: any) => [...enrollmentKeys.all, "teacher", "list", params] as const,
  teacherDetail: (id: string) => [...enrollmentKeys.all, "teacher", "detail", id] as const,
  adminList: (params?: any) => [...enrollmentKeys.all, "admin", params] as const,
  adminDetail: (id: string) => [...enrollmentKeys.all, "admin", "detail", id] as const,
};

export function useMyEnrollments(status?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: enrollmentKeys.mine(status),
    queryFn: () => enrollmentApi.getMyEnrollments(status),
    enabled: options?.enabled !== false,
  });
}

export function useTeacherEnrollments(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  courseId?: string;
  paymentMethod?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: enrollmentKeys.teacherList(params),
    queryFn: () => enrollmentApi.teacherGetEnrollments(params),
  });
}

export function useTeacherEnrollmentDetail(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: enrollmentKeys.teacherDetail(id),
    queryFn: () => enrollmentApi.teacherGetEnrollmentDetail(id),
    enabled: options?.enabled !== false && Boolean(id),
  });
}

export function useAdminEnrollments(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  courseId?: string;
  paymentMethod?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: enrollmentKeys.adminList(params),
    queryFn: () => enrollmentApi.adminGetEnrollments(params),
  });
}

export function useAdminEnrollmentDetail(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: enrollmentKeys.adminDetail(id),
    queryFn: () => enrollmentApi.adminGetEnrollmentDetail(id),
    enabled: options?.enabled !== false && Boolean(id),
  });
}

export function useCourseClassroom(courseIdOrSlug: string, options?: { enabled?: boolean }) {

  return useQuery({
    queryKey: enrollmentKeys.classroom(courseIdOrSlug),
    queryFn: () => enrollmentApi.getClassroom(courseIdOrSlug),
    enabled: options?.enabled !== false && Boolean(courseIdOrSlug),
  });
}

export function useEnrollFreeCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => enrollmentApi.enrollFree(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      toast.success("Successfully enrolled in course!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to enroll in course");
    },
  });
}

export function useCreateCourseOrder() {
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => enrollmentApi.createOrder(payload),
    onError: (err: any) => {
      toast.error(err?.message || "Failed to initialize checkout");
    },
  });
}

export function useVerifyCoursePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VerifyPaymentPayload) => enrollmentApi.verifyPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      toast.success("Payment verified! Welcome to your live course.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Payment verification failed");
    },
  });
}

export function usePayWithWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayWithWalletPayload) => enrollmentApi.payWithWallet(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      toast.success("Enrolled successfully via Wallet balance!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Wallet payment failed");
    },
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      enrollmentId,
      lessonId,
      liveAttendanceMinutes,
    }: {
      enrollmentId: string;
      lessonId: string;
      liveAttendanceMinutes?: number;
    }) => enrollmentApi.markAttendance(enrollmentId, lessonId, liveAttendanceMinutes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
    },
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      enrollmentId,
      lessonId,
      isCompleted,
      lastPositionSeconds,
    }: {
      enrollmentId: string;
      lessonId: string;
      isCompleted?: boolean;
      lastPositionSeconds?: number;
    }) => enrollmentApi.updateProgress(enrollmentId, lessonId, isCompleted, lastPositionSeconds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
    },
  });
}

export function useRequestRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enrollmentId, payload }: { enrollmentId: string; payload: RequestRefundPayload }) =>
      enrollmentApi.requestRefund(enrollmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      toast.success("Full refund processed successfully under 20-Day / 4-Classes Guarantee!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Refund request failed");
    },
  });
}

export function useClaimCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: string) => enrollmentApi.claimCertificate(enrollmentId),
    onSuccess: (cert) => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      toast.success("🎉 Congratulations! Your verified certificate is ready.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Could not claim certificate yet");
    },
  });
}

export function useGetCertificate(code: string) {
  return useQuery({
    queryKey: enrollmentKeys.certificate(code),
    queryFn: () => enrollmentApi.getCertificate(code),
    enabled: Boolean(code),
  });
}

export function useTeacherCourseStudents(courseId: string) {
  return useQuery({
    queryKey: enrollmentKeys.teacherStudents(courseId),
    queryFn: () => enrollmentApi.getTeacherCourseStudents(courseId),
    enabled: Boolean(courseId),
  });
}
