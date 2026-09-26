import { EnrollmentRepository } from "../../domain/repositories/enrollment.repository";
import { CourseEnrollmentEntity, EnrollmentStatus } from "../../domain/entities/enrollment.entity";

export interface TeacherGetEnrollmentsInput {
  teacherUserId: string;
  search?: string;
  status?: EnrollmentStatus;
  courseId?: string;
  paymentMethod?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface TeacherGetEnrollmentsOutput {
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

export class TeacherGetEnrollmentsUseCase {
  constructor(private readonly enrollmentRepo: EnrollmentRepository) {}

  async execute(input: TeacherGetEnrollmentsInput): Promise<TeacherGetEnrollmentsOutput> {
    return this.enrollmentRepo.listAllEnrollments({
      search: input.search,
      status: input.status,
      courseId: input.courseId,
      paymentMethod: input.paymentMethod,
      page: input.page,
      limit: input.limit,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
      teacherUserId: input.teacherUserId,
    });
  }
}
