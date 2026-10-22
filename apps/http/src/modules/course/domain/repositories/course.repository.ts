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
} from "../dtos/course.dto";

export interface ICourseRepository
  extends IBaseRepository<
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
  updateStatus(
    id: string,
    status: CourseEntity["status"],
    extras?: { rejectionReason?: string | null; isApproved?: boolean; approvedByAdminId?: string | null; publishedAt?: Date | null; submittedAt?: Date | null }
  ): Promise<CourseEntity>;
  softDelete(id: string, delistReason?: string): Promise<CourseEntity>;
  restore(id: string): Promise<CourseEntity>;
  freeze(id: string, freezeReason: string): Promise<CourseEntity>;
  unfreeze(id: string): Promise<CourseEntity>;
  hardDelete(id: string): Promise<boolean>;
  getMetrics(teacherProfileId?: string): Promise<CourseMetrics>;
  countByTeacher(teacherProfileId: string, status?: CourseEntity["status"]): Promise<number>;
}

export interface ICurriculumRepository {
  // Modules
  findModuleById(id: string, includeLessons?: boolean): Promise<CourseModuleEntity | null>;
  getModulesByCourseId(courseId: string, includeLessons?: boolean): Promise<CourseModuleEntity[]>;
  createModule(data: CreateModuleDTO): Promise<CourseModuleEntity>;
  updateModule(id: string, data: UpdateModuleDTO): Promise<CourseModuleEntity>;
  deleteModule(id: string): Promise<boolean>;
  reorderModules(courseId: string, items: ReorderItemDTO[]): Promise<void>;

  // Lessons
  findLessonById(id: string): Promise<CourseLessonEntity | null>;
  getLessonsByModuleId(moduleId: string): Promise<CourseLessonEntity[]>;
  createLesson(data: CreateLessonDTO): Promise<CourseLessonEntity>;
  updateLesson(id: string, data: UpdateLessonDTO): Promise<CourseLessonEntity>;
  deleteLesson(id: string): Promise<boolean>;
  reorderLessons(moduleId: string, items: ReorderItemDTO[]): Promise<void>;

  // Aggregates recalculation
  recalculateCourseAggregates(courseId: string): Promise<void>;
}
