import { ICourseRepository } from "../../domain/repositories/course.repository";
import { CourseEntity, CourseFilterParams } from "../../domain/entities/course.entity";
import { NotFoundError } from "@/app/errors";

export class GetCoursesUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async getPublicCourses(params: CourseFilterParams = {}): Promise<{ items: CourseEntity[]; total: number }> {
    return this.courseRepository.findMany({
      ...params,
      status: "PUBLISHED",
      isDeleted: false,
    });
  }

  async getFeaturedCourses(limit = 6): Promise<CourseEntity[]> {
    const { items } = await this.courseRepository.findMany({
      status: "PUBLISHED",
      isFeatured: true,
      isDeleted: false,
      limit,
      sortBy: "sortOrder",
      sortOrder: "asc",
    });
    return items;
  }

  async getTrendingCourses(limit = 6): Promise<CourseEntity[]> {
    const { items } = await this.courseRepository.findMany({
      status: "PUBLISHED",
      isTrending: true,
      isDeleted: false,
      limit,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    return items;
  }

  async getCourseBySlug(slug: string): Promise<CourseEntity> {
    const course = await this.courseRepository.findBySlug(slug, false, true);
    if (!course || (course.status !== "PUBLISHED" && course.isDeleted)) {
      throw new NotFoundError(`Course with slug '${slug}' was not found.`);
    }
    return course;
  }
}
