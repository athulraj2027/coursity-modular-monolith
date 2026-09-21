import {
  ICourseRepository,
  ICurriculumRepository,
} from "../../domain/repositories/course.repository";
import {
  CourseEntity,
  CourseModuleEntity,
  CourseLessonEntity,
  CourseFilterParams,
  CourseMetrics,
} from "../../domain/entities/course.entity";
import {
  CreateCourseDTO,
  UpdateCourseDTO,
  CreateModuleDTO,
  UpdateModuleDTO,
  CreateLessonDTO,
  UpdateLessonDTO,
  ReorderItemDTO,
} from "../../domain/dtos/course.dto";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/app/errors";

export class TeacherCourseUseCase {
  constructor(
    private readonly courseRepository: ICourseRepository,
    private readonly curriculumRepository: ICurriculumRepository
  ) {}

  async getTeacherCourses(
    teacherProfileId: string,
    params: CourseFilterParams = {}
  ): Promise<{ items: CourseEntity[]; total: number }> {
    return this.courseRepository.findMany({
      ...params,
      teacherProfileId,
    });
  }

  async getTeacherCourseById(teacherProfileId: string, courseId: string): Promise<CourseEntity> {
    const course = await this.courseRepository.findById(courseId, false, true);
    if (!course) {
      throw new NotFoundError(`Course with ID '${courseId}' was not found.`);
    }
    if (course.teacherProfileId !== teacherProfileId) {
      throw new ForbiddenError("You do not have permission to manage this course.");
    }
    return course;
  }

  async getTeacherMetrics(teacherProfileId: string): Promise<CourseMetrics> {
    return this.courseRepository.getMetrics(teacherProfileId);
  }

  async createCourse(dto: CreateCourseDTO): Promise<CourseEntity> {
    // Validate unique slug if supplied
    if (dto.slug) {
      const existing = await this.courseRepository.findBySlug(dto.slug, true);
      if (existing) {
        throw new BadRequestError(`A course with slug '${dto.slug}' already exists.`);
      }
    }

    return this.courseRepository.create(dto);
  }

  async updateCourse(
    teacherProfileId: string,
    courseId: string,
    dto: UpdateCourseDTO
  ): Promise<CourseEntity> {
    const course = await this.courseRepository.findById(courseId, true);
    if (!course) {
      throw new NotFoundError(`Course with ID '${courseId}' was not found.`);
    }
    if (course.teacherProfileId !== teacherProfileId) {
      throw new ForbiddenError("You do not have permission to modify this course.");
    }
    if (course.isFrozen || course.status === "FROZEN") {
      throw new ForbiddenError("This course has been frozen by administration and cannot be modified. It is in read-only mode.");
    }

    // Slug conflict validation
    if (dto.slug && dto.slug !== course.slug) {
      const existing = await this.courseRepository.findBySlug(dto.slug, true);
      if (existing && existing.id !== courseId) {
        throw new BadRequestError(`A course with slug '${dto.slug}' already exists.`);
      }
    }

    return this.courseRepository.update(courseId, dto);
  }

  async deleteCourse(teacherProfileId: string, courseId: string): Promise<CourseEntity> {
    const course = await this.courseRepository.findById(courseId, true);
    if (!course) {
      throw new NotFoundError(`Course with ID '${courseId}' was not found.`);
    }
    if (course.teacherProfileId !== teacherProfileId) {
      throw new ForbiddenError("You do not have permission to delete this course.");
    }
    if (course.isFrozen || course.status === "FROZEN") {
      throw new ForbiddenError("This course has been frozen by administration and cannot be deleted.");
    }

    return this.courseRepository.softDelete(courseId);
  }

  // ================= MODULE OPERATIONS =================

  async createModule(teacherProfileId: string, dto: CreateModuleDTO): Promise<CourseModuleEntity> {
    const course = await this.courseRepository.findById(dto.courseId, false);
    if (!course) {
      throw new NotFoundError(`Course with ID '${dto.courseId}' was not found.`);
    }
    if (course.teacherProfileId !== teacherProfileId) {
      throw new ForbiddenError("You do not have permission to add modules to this course.");
    }
    if (course.isFrozen || course.status === "FROZEN") {
      throw new ForbiddenError("This course has been frozen by administration. Curriculum modifications are locked.");
    }

    return this.curriculumRepository.createModule(dto);
  }

  async updateModule(
    teacherProfileId: string,
    moduleId: string,
    dto: UpdateModuleDTO
  ): Promise<CourseModuleEntity> {
    const module = await this.curriculumRepository.findModuleById(moduleId);
    if (!module) {
      throw new NotFoundError(`Module with ID '${moduleId}' was not found.`);
    }
    const course = await this.courseRepository.findById(module.courseId, false);
    if (!course || course.teacherProfileId !== teacherProfileId) {
      throw new ForbiddenError("You do not have permission to modify this module.");
    }
    if (course.isFrozen || course.status === "FROZEN") {
      throw new ForbiddenError("This course has been frozen by administration. Curriculum modifications are locked.");
    }

    return this.curriculumRepository.updateModule(moduleId, dto);
  }

  async deleteModule(teacherProfileId: string, moduleId: string): Promise<boolean> {
    const module = await this.curriculumRepository.findModuleById(moduleId);
    if (!module) {
      throw new NotFoundError(`Module with ID '${moduleId}' was not found.`);
    }
    const course = await this.courseRepository.findById(module.courseId, false);
    if (!course || course.teacherProfileId !== teacherProfileId) {
      throw new ForbiddenError("You do not have permission to delete this module.");
    }
    if (course.isFrozen || course.status === "FROZEN") {
      throw new ForbiddenError("This course has been frozen by administration. Curriculum modifications are locked.");
    }

    return this.curriculumRepository.deleteModule(moduleId);
  }

  async reorderModules(
    teacherProfileId: string,
    courseId: string,
    items: ReorderItemDTO[]
  ): Promise<void> {
    const course = await this.courseRepository.findById(courseId, false);
    if (!course) {
      throw new NotFoundError(`Course with ID '${courseId}' was not found.`);
    }
    if (course.teacherProfileId !== teacherProfileId) {
      throw new ForbiddenError("You do not have permission to reorder modules in this course.");
    }
    if (course.isFrozen || course.status === "FROZEN") {
      throw new ForbiddenError("This course has been frozen by administration. Curriculum modifications are locked.");
    }

    await this.curriculumRepository.reorderModules(courseId, items);
  }

  // ================= LESSON OPERATIONS =================

  async createLesson(teacherProfileId: string, dto: CreateLessonDTO): Promise<CourseLessonEntity> {
    const module = await this.curriculumRepository.findModuleById(dto.moduleId);
    if (!module) {
      throw new NotFoundError(`Module with ID '${dto.moduleId}' was not found.`);
    }
    const course = await this.courseRepository.findById(module.courseId, false);
    if (!course || course.teacherProfileId !== teacherProfileId) {
      throw new ForbiddenError("You do not have permission to add lessons to this course.");
    }
    if (course.isFrozen || course.status === "FROZEN") {
      throw new ForbiddenError("This course has been frozen by administration. Curriculum modifications are locked.");
    }

    return this.curriculumRepository.createLesson(dto);
  }

  async updateLesson(
    teacherProfileId: string,
    lessonId: string,
    dto: UpdateLessonDTO
  ): Promise<CourseLessonEntity> {
    const lesson = await this.curriculumRepository.findLessonById(lessonId);
    if (!lesson) {
      throw new NotFoundError(`Lesson with ID '${lessonId}' was not found.`);
    }
    const module = await this.curriculumRepository.findModuleById(lesson.moduleId);
    if (!module) {
      throw new NotFoundError("Parent module not found.");
    }
    const course = await this.courseRepository.findById(module.courseId, false);
    if (!course || course.teacherProfileId !== teacherProfileId) {
      throw new ForbiddenError("You do not have permission to modify this lesson.");
    }
    if (course.isFrozen || course.status === "FROZEN") {
      throw new ForbiddenError("This course has been frozen by administration. Curriculum modifications are locked.");
    }

    return this.curriculumRepository.updateLesson(lessonId, dto);
  }

  async deleteLesson(teacherProfileId: string, lessonId: string): Promise<boolean> {
    const lesson = await this.curriculumRepository.findLessonById(lessonId);
    if (!lesson) {
      throw new NotFoundError(`Lesson with ID '${lessonId}' was not found.`);
    }
    const module = await this.curriculumRepository.findModuleById(lesson.moduleId);
    if (!module) {
      throw new NotFoundError("Parent module not found.");
    }
    const course = await this.courseRepository.findById(module.courseId, false);
    if (!course || course.teacherProfileId !== teacherProfileId) {
      throw new ForbiddenError("You do not have permission to delete this lesson.");
    }
    if (course.isFrozen || course.status === "FROZEN") {
      throw new ForbiddenError("This course has been frozen by administration. Curriculum modifications are locked.");
    }

    return this.curriculumRepository.deleteLesson(lessonId);
  }

  async reorderLessons(
    teacherProfileId: string,
    moduleId: string,
    items: ReorderItemDTO[]
  ): Promise<void> {
    const module = await this.curriculumRepository.findModuleById(moduleId);
    if (!module) {
      throw new NotFoundError(`Module with ID '${moduleId}' was not found.`);
    }
    const course = await this.courseRepository.findById(module.courseId, false);
    if (!course || course.teacherProfileId !== teacherProfileId) {
      throw new ForbiddenError("You do not have permission to reorder lessons in this course.");
    }
    if (course.isFrozen || course.status === "FROZEN") {
      throw new ForbiddenError("This course has been frozen by administration. Curriculum modifications are locked.");
    }

    await this.curriculumRepository.reorderLessons(moduleId, items);
  }
}
