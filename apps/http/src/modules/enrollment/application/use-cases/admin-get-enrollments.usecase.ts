import { EnrollmentRepository } from "../../domain/repositories/enrollment.repository";
import { CourseEnrollmentEntity, EnrollmentStatus } from "../../domain/entities/enrollment.entity";

export interface AdminGetEnrollmentsInput {
  search?: string;
  status?: EnrollmentStatus;
  courseId?: string;
  paymentMethod?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AdminGetEnrollmentsOutput {
  items: CourseEnrollmentEntity[];
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
}

export class AdminGetEnrollmentsUseCase {
  constructor(private readonly enrollmentRepo: EnrollmentRepository) {}

  async execute(input: AdminGetEnrollmentsInput): Promise<AdminGetEnrollmentsOutput> {
    return this.enrollmentRepo.listAllEnrollments(input);
  }
}
