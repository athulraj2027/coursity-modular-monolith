import { ICourseRepository } from "../../domain/repositories/course.repository";
import {
  CourseEntity,
  CourseFilterParams,
  CourseMetrics,
} from "../../domain/entities/course.entity";
import {
  AdminDelistCourseDTO,
  AdminFreezeCourseDTO,
} from "../../domain/dtos/course.dto";
import { IEmailService } from "@/infrastructure/email";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class AdminManageCoursesUseCase {
  constructor(
    private readonly courseRepository: ICourseRepository,
    private readonly emailService?: IEmailService
  ) {}

  async getAllCourses(params: CourseFilterParams = {}): Promise<{ items: CourseEntity[]; total: number }> {
    return this.courseRepository.findMany(params);
  }

  async getCourseById(courseId: string): Promise<CourseEntity> {
    const course = await this.courseRepository.findById(courseId, true, true);
    if (!course) {
      throw new NotFoundError(`Course with ID '${courseId}' was not found.`);
    }
    return course;
  }

  async getMetrics(): Promise<CourseMetrics> {
    return this.courseRepository.getMetrics();
  }

  async toggleFeatured(courseId: string, isFeatured: boolean): Promise<CourseEntity> {
    const course = await this.courseRepository.findById(courseId, true);
    if (!course) {
      throw new NotFoundError(`Course with ID '${courseId}' was not found.`);
    }
    return this.courseRepository.update(courseId, { isFeatured });
  }

  async toggleTrending(courseId: string, isTrending: boolean): Promise<CourseEntity> {
    const course = await this.courseRepository.findById(courseId, true);
    if (!course) {
      throw new NotFoundError(`Course with ID '${courseId}' was not found.`);
    }
    return this.courseRepository.update(courseId, { isTrending });
  }

  async delistCourse(courseId: string, dto: AdminDelistCourseDTO): Promise<CourseEntity> {
    const course = await this.courseRepository.findById(courseId, true, true);
    if (!course) {
      throw new NotFoundError(`Course with ID '${courseId}' was not found.`);
    }

    if (!dto.reason || !dto.reason.trim()) {
      throw new BadRequestError("A delist message/reason must be provided to inform the instructor.");
    }

    // Check if course has already started: Delist is ONLY allowed if course has NOT started yet
    if (course.startingDate) {
      const startTime = new Date(course.startingDate).getTime();
      if (startTime <= Date.now()) {
        throw new BadRequestError(
          "Cannot delist a course that has already started. Started courses must be frozen instead."
        );
      }
    }

    const delisted = await this.courseRepository.softDelete(courseId, dto.reason.trim());

    // Disptach email notification to the instructor
    const teacherEmail = course.teacherProfile?.profile?.user?.email;
    const teacherName = course.teacherProfile?.profile?.user?.name || "Instructor";

    if (this.emailService && teacherEmail) {
      await this.emailService
        .sendCourseDelistedNotification(
          teacherEmail,
          teacherName,
          course.title,
          dto.reason.trim(),
          course.slug
        )
        .catch((err) => {
          console.error("⚠️ Failed to dispatch course delisted email:", err?.message || err);
        });
    }

    return delisted;
  }

  async freezeCourse(courseId: string, dto: AdminFreezeCourseDTO): Promise<CourseEntity> {
    const course = await this.courseRepository.findById(courseId, true, true);
    if (!course) {
      throw new NotFoundError(`Course with ID '${courseId}' was not found.`);
    }

    if (!dto.reason || !dto.reason.trim()) {
      throw new BadRequestError("A freeze message/reason must be provided to inform the instructor.");
    }

    const frozen = await this.courseRepository.freeze(courseId, dto.reason.trim());

    // Dispatch email notification to the instructor
    const teacherEmail = course.teacherProfile?.profile?.user?.email;
    const teacherName = course.teacherProfile?.profile?.user?.name || "Instructor";

    if (this.emailService && teacherEmail) {
      await this.emailService
        .sendCourseFrozenNotification(
          teacherEmail,
          teacherName,
          course.title,
          dto.reason.trim(),
          course.slug
        )
        .catch((err) => {
          console.error("⚠️ Failed to dispatch course frozen email:", err?.message || err);
        });
    }

    return frozen;
  }

  async unfreezeCourse(courseId: string): Promise<CourseEntity> {
    const course = await this.courseRepository.findById(courseId, true);
    if (!course) {
      throw new NotFoundError(`Course with ID '${courseId}' was not found.`);
    }
    return this.courseRepository.unfreeze(courseId);
  }

  async softDelete(courseId: string, delistReason?: string): Promise<CourseEntity> {
    const course = await this.courseRepository.findById(courseId, true);
    if (!course) {
      throw new NotFoundError(`Course with ID '${courseId}' was not found.`);
    }
    return this.courseRepository.softDelete(courseId, delistReason);
  }

  async restore(courseId: string): Promise<CourseEntity> {
    const course = await this.courseRepository.findById(courseId, true);
    if (!course) {
      throw new NotFoundError(`Course with ID '${courseId}' was not found.`);
    }
    return this.courseRepository.restore(courseId);
  }

  async hardDelete(courseId: string): Promise<boolean> {
    const course = await this.courseRepository.findById(courseId, true);
    if (!course) {
      throw new NotFoundError(`Course with ID '${courseId}' was not found.`);
    }
    return this.courseRepository.hardDelete(courseId);
  }
}
