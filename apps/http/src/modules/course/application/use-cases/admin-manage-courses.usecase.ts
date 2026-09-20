import { ICourseRepository } from "../../domain/repositories/course.repository";
import {
  CourseEntity,
  CourseFilterParams,
  CourseMetrics,
} from "../../domain/entities/course.entity";
import { AdminReviewCourseDTO } from "../../domain/dtos/course.dto";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class AdminManageCoursesUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

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

  async reviewCourse(courseId: string, dto: AdminReviewCourseDTO): Promise<CourseEntity> {
    const course = await this.courseRepository.findById(courseId, true);
    if (!course) {
      throw new NotFoundError(`Course with ID '${courseId}' was not found.`);
    }

    if (dto.action === "APPROVE") {
      return this.courseRepository.updateStatus(courseId, "PUBLISHED", {
        isApproved: true,
        publishedAt: new Date(),
        approvedByAdminId: dto.adminId,
        rejectionReason: null,
      });
    }

    if (dto.action === "REJECT") {
      if (!dto.rejectionReason || !dto.rejectionReason.trim()) {
        throw new BadRequestError("A rejection reason must be provided when rejecting a course.");
      }

      return this.courseRepository.updateStatus(courseId, "REJECTED", {
        isApproved: false,
        rejectionReason: dto.rejectionReason.trim(),
        approvedByAdminId: dto.adminId,
      });
    }

    throw new BadRequestError("Invalid review action. Must be APPROVE or REJECT.");
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

  async softDelete(courseId: string): Promise<CourseEntity> {
    const course = await this.courseRepository.findById(courseId, true);
    if (!course) {
      throw new NotFoundError(`Course with ID '${courseId}' was not found.`);
    }
    return this.courseRepository.softDelete(courseId);
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
