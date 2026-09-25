import { apiClient } from "@/lib/api-client";
import type {
  CourseEnrollment,
  CheckoutOrderResult,
  CreateOrderPayload,
  VerifyPaymentPayload,
  PayWithWalletPayload,
  RequestRefundPayload,
  CourseClassroomResponse,
  CourseCertificate,
} from "../types/enrollment.types";

export const enrollmentApi = {
  enrollFree: async (courseId: string): Promise<CourseEnrollment> => {
    const res = await apiClient<{ success: boolean; data: CourseEnrollment; message?: string }>(
      "/enrollments/free",
      {
        method: "POST",
        body: JSON.stringify({ courseId }),
      }
    );
    return res.data;
  },

  createOrder: async (payload: CreateOrderPayload): Promise<CheckoutOrderResult> => {
    const res = await apiClient<{ success: boolean; data: CheckoutOrderResult; message?: string }>(
      "/enrollments/order",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  verifyPayment: async (payload: VerifyPaymentPayload): Promise<CourseEnrollment> => {
    const res = await apiClient<{ success: boolean; data: CourseEnrollment; message?: string }>(
      "/enrollments/verify",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  payWithWallet: async (payload: PayWithWalletPayload): Promise<CourseEnrollment> => {
    const res = await apiClient<{ success: boolean; data: CourseEnrollment; message?: string }>(
      "/enrollments/wallet-pay",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  getMyEnrollments: async (status?: string): Promise<CourseEnrollment[]> => {
    const query = status ? `?status=${status}` : "";
    const res = await apiClient<{ success: boolean; data: CourseEnrollment[] }>(
      `/enrollments/my-courses${query}`,
      { method: "GET" }
    );
    return res.data;
  },

  getClassroom: async (courseIdOrSlug: string): Promise<CourseClassroomResponse> => {
    const res = await apiClient<{ success: boolean; data: CourseClassroomResponse }>(
      `/enrollments/classroom/${encodeURIComponent(courseIdOrSlug)}`,
      { method: "GET" }
    );
    return res.data;
  },

  markAttendance: async (
    enrollmentId: string,
    lessonId: string,
    liveAttendanceMinutes: number = 30
  ): Promise<any> => {
    const res = await apiClient<{ success: boolean; data: any; message?: string }>(
      `/enrollments/${enrollmentId}/attendance`,
      {
        method: "POST",
        body: JSON.stringify({ lessonId, liveAttendanceMinutes }),
      }
    );
    return res.data;
  },

  updateProgress: async (
    enrollmentId: string,
    lessonId: string,
    isCompleted?: boolean,
    lastPositionSeconds?: number
  ): Promise<any> => {
    const res = await apiClient<{ success: boolean; data: any; message?: string }>(
      `/enrollments/${enrollmentId}/progress`,
      {
        method: "POST",
        body: JSON.stringify({ lessonId, isCompleted, lastPositionSeconds }),
      }
    );
    return res.data;
  },

  requestRefund: async (enrollmentId: string, payload: RequestRefundPayload): Promise<any> => {
    const res = await apiClient<{ success: boolean; data: any; message?: string }>(
      `/enrollments/${enrollmentId}/refund`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  claimCertificate: async (enrollmentId: string): Promise<CourseCertificate> => {
    const res = await apiClient<{ success: boolean; data: CourseCertificate; message?: string }>(
      `/enrollments/${enrollmentId}/claim-certificate`,
      {
        method: "POST",
      }
    );
    return res.data;
  },

  getCertificate: async (code: string): Promise<CourseCertificate> => {
    const res = await apiClient<{ success: boolean; data: CourseCertificate }>(
      `/enrollments/certificates/${encodeURIComponent(code)}`,
      { method: "GET" }
    );
    return res.data;
  },

  getTeacherCourseStudents: async (courseId: string): Promise<CourseEnrollment[]> => {
    const res = await apiClient<{ success: boolean; data: CourseEnrollment[] }>(
      `/enrollments/teacher/course/${courseId}/students`,
      { method: "GET" }
    );
    return res.data;
  },

  adminGetEnrollments: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    courseId?: string;
    paymentMethod?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.status && params.status !== "all") searchParams.append("status", params.status);
    if (params?.courseId && params.courseId !== "all") searchParams.append("courseId", params.courseId);
    if (params?.paymentMethod && params.paymentMethod !== "all") searchParams.append("paymentMethod", params.paymentMethod);
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const res = await apiClient<{
      success: boolean;
      data: {
        items: CourseEnrollment[];
        total: number;
        metrics: {
          totalEnrollments: number;
          activeEnrollments: number;
          completedEnrollments: number;
          refundedEnrollments: number;
          totalRevenue: number;
          totalRefundedAmount: number;
          totalDiscounts: number;
        };
      };
    }>(`/enrollments/admin/all${query}`, { method: "GET" });
    return res.data;
  },

  adminGetEnrollmentDetail: async (id: string) => {
    const res = await apiClient<{
      success: boolean;
      data: {
        enrollment: CourseEnrollment & {
          instructorEmail?: string;
          studentAvatar?: string | null;
        };
        lessonProgress: any[];
        refund: any | null;
        certificate: any | null;
      };
    }>(`/enrollments/admin/${id}`, { method: "GET" });
    return res.data;
  },

  teacherGetEnrollments: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    courseId?: string;
    paymentMethod?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.status && params.status !== "all") searchParams.append("status", params.status);
    if (params?.courseId && params.courseId !== "all") searchParams.append("courseId", params.courseId);
    if (params?.paymentMethod && params.paymentMethod !== "all") searchParams.append("paymentMethod", params.paymentMethod);
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const res = await apiClient<{
      success: boolean;
      data: {
        items: CourseEnrollment[];
        total: number;
        metrics: {
          totalEnrollments: number;
          activeEnrollments: number;
          completedEnrollments: number;
          refundedEnrollments: number;
          totalRevenue: number;
          totalRefundedAmount: number;
          totalDiscounts: number;
        };
      };
    }>(`/enrollments/teacher/all${query}`, { method: "GET" });
    return res.data;
  },

  teacherGetEnrollmentDetail: async (id: string) => {
    const res = await apiClient<{
      success: boolean;
      data: {
        enrollment: CourseEnrollment & {
          instructorEmail?: string;
          studentAvatar?: string | null;
        };
        lessonProgress: any[];
        refund: any | null;
        certificate: any | null;
      };
    }>(`/enrollments/teacher/${id}`, { method: "GET" });
    return res.data;
  },
};

