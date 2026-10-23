import { EnrollmentRepository } from "../../domain/repositories/enrollment.repository";
import { CourseEnrollmentEntity } from "../../domain/entities/enrollment.entity";
import { ICourseRepository } from "@/modules/course/domain/repositories/course.repository";
import { ForbiddenError, NotFoundError } from "@/app/errors";

export class TeacherGetCourseStudentsUseCase {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly courseRepo: ICourseRepository
  ) {}

  async execute(teacherProfileId: string, courseId: string): Promise<CourseEnrollmentEntity[]> {
    const course = await this.courseRepo.findById(courseId);

    if (!course) {
      throw new NotFoundError("Course not found.");
    }

    if (course.teacherProfileId !== teacherProfileId) {
      throw new ForbiddenError("You can only view students enrolled in your own courses.");
    }

    return this.enrollmentRepo.listCourseEnrollments(courseId);
  }
}
