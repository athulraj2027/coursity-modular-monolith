import { EnrollmentRepository } from "../../domain/repositories/enrollment.repository";
import { CourseEnrollmentEntity } from "../../domain/entities/enrollment.entity";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { BadRequestError, ConflictError, NotFoundError } from "@/app/errors";

export class EnrollFreeCourseUseCase {
  constructor(private readonly enrollmentRepo: EnrollmentRepository) {}

  async execute(studentId: string, courseId: string): Promise<CourseEnrollmentEntity> {
    const course = await defaultPrisma.course.findUnique({
      where: { id: courseId },
      include: {
        teacherProfile: {
          include: { profile: { include: { user: true } } },
        },
      },
    });

    if (!course) {
      throw new NotFoundError("Course not found.");
    }

    if (course.pricingType !== "FREE" && Number(course.price) > 0) {
      throw new BadRequestError("This is a paid course. Please complete checkout to enroll.");
    }

    if (course.isFrozen || course.isDeleted) {
      throw new BadRequestError("This course is currently not accepting enrollments.");
    }

    const existing = await this.enrollmentRepo.findEnrollmentByStudentAndCourse(studentId, courseId);
    if (existing && existing.status === "ACTIVE") {
      throw new ConflictError("You are already enrolled in this live course.");
    }

    const now = new Date();
    const effectiveStart = course.startingDate && new Date(course.startingDate) > now
      ? new Date(course.startingDate)
      : now;
    
    // 20-day refund window from effective course start
    const refundEligibleUntil = new Date(effectiveStart.getTime() + 20 * 24 * 60 * 60 * 1000);
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return this.enrollmentRepo.createEnrollment({
      studentId,
      courseId,
      originalPrice: 0,
      discountAmount: 0,
      finalAmount: 0,
      currency: course.currency || "INR",
      paymentMethod: "FREE",
      invoiceNumber,
      refundEligibleUntil,
    });
  }
}
