import { RefundStatus, RefundDestination } from "./enrollment.entity";

export interface CourseRefundEntity {
  id: string;
  enrollmentId: string;
  studentId: string;
  amount: number;
  currency: string;
  reason: string;
  status: RefundStatus;
  destination: RefundDestination;
  gatewayRefundId: string | null;
  classesConductedAtRefund: number;
  classesAttendedAtRefund: number;
  daysElapsedAtRefund: number;
  processedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  courseTitle?: string;
  studentName?: string;
  studentEmail?: string;
}

export interface CourseCertificateEntity {
  id: string;
  enrollmentId: string;
  certificateCode: string;
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: Date;
  pdfUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
