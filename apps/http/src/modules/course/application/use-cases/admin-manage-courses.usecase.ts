import { ICourseRepository } from "../../domain/repositories/course.repository";
import {
  CourseEntity,
  CourseFilterParams,
  CourseMetrics,
  canCourseBeDelisted,
} from "../../domain/entities/course.entity";
import {
  AdminDelistCourseDTO,
  AdminFreezeCourseDTO,
} from "../../domain/dtos/course.dto";
import { ICourseNotificationService } from "../../domain/ports/course-notification.port";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class AdminManageCoursesUseCase {
  constructor(
    private readonly courseRepository: ICourseRepository,
    private readonly notificationService?: ICourseNotificationService | any
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

    const delistCheck = canCourseBeDelisted(course);
    if (!delistCheck.canDelist) {
      throw new BadRequestError(delistCheck.reason || "Course cannot be delisted.");
    }

    const delisted = await this.courseRepository.softDelete(courseId, dto.reason.trim());

    // Dispatch notification to the instructor
    const teacherEmail = course.teacherProfile?.profile?.user?.email;
    const teacherName = course.teacherProfile?.profile?.user?.name || "Instructor";

    if (this.notificationService && teacherEmail) {
      try {
        await this.notificationService.sendCourseDelistedNotification(
          teacherEmail,
          teacherName,
          course.title,
          dto.reason.trim(),
          course.slug
        );
      } catch (err: any) {
        // Non-blocking notification dispatch
      }
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

    // Dispatch notification to the instructor
    const teacherEmail = course.teacherProfile?.profile?.user?.email;
    const teacherName = course.teacherProfile?.profile?.user?.name || "Instructor";

    if (this.notificationService && teacherEmail) {
      try {
        await this.notificationService.sendCourseFrozenNotification(
          teacherEmail,
          teacherName,
          course.title,
          dto.reason.trim(),
          course.slug
        );
      } catch (err: any) {
        // Non-blocking notification dispatch
      }
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
