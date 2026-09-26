import { EnrollmentRepository } from "../../domain/repositories/enrollment.repository";
import { CourseEnrollmentEntity } from "../../domain/entities/enrollment.entity";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { ForbiddenError, NotFoundError } from "@/app/errors";

export class TeacherGetCourseStudentsUseCase {
  constructor(private readonly enrollmentRepo: EnrollmentRepository) {}

  async execute(teacherProfileId: string, courseId: string): Promise<CourseEnrollmentEntity[]> {
    const course = await defaultPrisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, teacherProfileId: true },
    });

    if (!course) {
      throw new NotFoundError("Course not found.");
    }

    if (course.teacherProfileId !== teacherProfileId) {
      throw new ForbiddenError("You can only view students enrolled in your own courses.");
    }

    return this.enrollmentRepo.listCourseEnrollments(courseId);
  }
}
