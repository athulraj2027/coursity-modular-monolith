import { IBaseRepository, PaginatedResult } from "@/shared/domain/repositories/base.repository.interface";
import {
  CourseEntity,
  CourseModuleEntity,
  CourseLessonEntity,
  CourseFilterParams,
  CourseMetrics,
} from "../entities/course.entity";
import {
  CreateCourseDTO,
  UpdateCourseDTO,
  CreateModuleDTO,
  UpdateModuleDTO,
  CreateLessonDTO,
  UpdateLessonDTO,
  ReorderItemDTO,
  CourseStatusUpdateExtras,
} from "../dtos/course.dto";

/**
 * 1. Read-Only Query Repository (ISP - for Public Catalog, Student Enrollment, Coupon validation)
 */
export interface ICourseQueryRepository {
  findById(id: string, includeDeleted?: boolean, includeCurriculum?: boolean): Promise<CourseEntity | null>;
  findBySlug(slug: string, includeDeleted?: boolean, includeCurriculum?: boolean): Promise<CourseEntity | null>;
  findMany(params?: CourseFilterParams): Promise<PaginatedResult<CourseEntity>>;
}

/**
 * 2. Teacher Command Repository (ISP - for Teacher Course Studio)
 */
export interface ICourseCommandRepository {
  create(data: CreateCourseDTO): Promise<CourseEntity>;
  update(id: string, data: UpdateCourseDTO): Promise<CourseEntity>;
  softDelete(id: string, delistReason?: string): Promise<CourseEntity>;
  getMetrics(teacherProfileId?: string): Promise<CourseMetrics>;
  countByTeacher(teacherProfileId: string, status?: CourseEntity["status"]): Promise<number>;
}

/**
 * 3. Admin Moderation Repository (ISP - for Admin Backoffice Operations)
 */
export interface ICourseAdminRepository {
  updateStatus(
    id: string,
    status: CourseEntity["status"],
    extras?: CourseStatusUpdateExtras
  ): Promise<CourseEntity>;
  freeze(id: string, freezeReason: string): Promise<CourseEntity>;
  unfreeze(id: string): Promise<CourseEntity>;
  restore(id: string): Promise<CourseEntity>;
  hardDelete(id: string): Promise<boolean>;
}

/**
 * 4. Unified Interface (combining interfaces & IBaseRepository for backwards compatibility)
 */
export interface ICourseRepository
  extends ICourseQueryRepository,
    ICourseCommandRepository,
    ICourseAdminRepository,
    IBaseRepository<
      CourseEntity,
      string,
      CreateCourseDTO,
      UpdateCourseDTO,
      CourseFilterParams
    > {
  findById(id: string, includeDeleted?: boolean, includeCurriculum?: boolean): Promise<CourseEntity | null>;
  findBySlug(slug: string, includeDeleted?: boolean, includeCurriculum?: boolean): Promise<CourseEntity | null>;
  findMany(params?: CourseFilterParams): Promise<PaginatedResult<CourseEntity>>;
  create(data: CreateCourseDTO): Promise<CourseEntity>;
  update(id: string, data: UpdateCourseDTO): Promise<CourseEntity>;
  softDelete(id: string, delistReason?: string): Promise<CourseEntity>;
  restore(id: string): Promise<CourseEntity>;
  freeze(id: string, freezeReason: string): Promise<CourseEntity>;
  unfreeze(id: string): Promise<CourseEntity>;
  hardDelete(id: string): Promise<boolean>;
  getMetrics(teacherProfileId?: string): Promise<CourseMetrics>;
  countByTeacher(teacherProfileId: string, status?: CourseEntity["status"]): Promise<number>;
}

/**
 * Curriculum Module Management Repository
 */
export interface ICourseModuleRepository {
  findModuleById(id: string, includeLessons?: boolean): Promise<CourseModuleEntity | null>;
  getModulesByCourseId(courseId: string, includeLessons?: boolean): Promise<CourseModuleEntity[]>;
  createModule(data: CreateModuleDTO): Promise<CourseModuleEntity>;
  updateModule(id: string, data: UpdateModuleDTO): Promise<CourseModuleEntity>;
  deleteModule(id: string): Promise<boolean>;
  reorderModules(courseId: string, items: ReorderItemDTO[]): Promise<void>;
}

/**
 * Curriculum Lesson Management Repository
 */
export interface ICourseLessonRepository {
  findLessonById(id: string): Promise<CourseLessonEntity | null>;
  getLessonsByModuleId(moduleId: string): Promise<CourseLessonEntity[]>;
  createLesson(data: CreateLessonDTO): Promise<CourseLessonEntity>;
  updateLesson(id: string, data: UpdateLessonDTO): Promise<CourseLessonEntity>;
  deleteLesson(id: string): Promise<boolean>;
  reorderLessons(moduleId: string, items: ReorderItemDTO[]): Promise<void>;
}

/**
 * Unified Curriculum Repository Interface
 */
export interface ICurriculumRepository extends ICourseModuleRepository, ICourseLessonRepository {
  recalculateCourseAggregates(courseId: string): Promise<void>;
}
