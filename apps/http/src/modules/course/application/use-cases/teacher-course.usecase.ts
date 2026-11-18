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
  isCourseEditableByTeacher,
} from "../../domain/entities/course.entity";
import {
  CreateCourseDTO,
  TeacherUpdateCourseDTO,
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

  private async assertCourseEditable(
    teacherProfileId: string,
    courseId: string
  ): Promise<CourseEntity> {
    const course = await this.courseRepository.findById(courseId, true);
    if (!course) {
      throw new NotFoundError(`Course with ID '${courseId}' was not found.`);
    }
    const check = isCourseEditableByTeacher(course, teacherProfileId);
    if (!check.allowed) {
      throw new ForbiddenError(check.reason || "Permission denied.");
    }
    return course;
  }

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
    dto: TeacherUpdateCourseDTO | UpdateCourseDTO
  ): Promise<CourseEntity> {
    const course = await this.assertCourseEditable(teacherProfileId, courseId);

    // Prevent privilege escalation on admin-controlled flags if passed
    const safeDto: UpdateCourseDTO = { ...dto };
    delete safeDto.isFeatured;
    delete safeDto.isTrending;
    delete safeDto.sortOrder;

    // Slug conflict validation
    if (safeDto.slug && safeDto.slug !== course.slug) {
      const existing = await this.courseRepository.findBySlug(safeDto.slug, true);
      if (existing && existing.id !== courseId) {
        throw new BadRequestError(`A course with slug '${safeDto.slug}' already exists.`);
      }
    }

    return this.courseRepository.update(courseId, safeDto);
  }

  async deleteCourse(teacherProfileId: string, courseId: string): Promise<CourseEntity> {
    await this.assertCourseEditable(teacherProfileId, courseId);
    return this.courseRepository.softDelete(courseId);
  }

  // ================= MODULE OPERATIONS =================

  async createModule(teacherProfileId: string, dto: CreateModuleDTO): Promise<CourseModuleEntity> {
    await this.assertCourseEditable(teacherProfileId, dto.courseId);
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
    await this.assertCourseEditable(teacherProfileId, module.courseId);
    return this.curriculumRepository.updateModule(moduleId, dto);
  }

  async deleteModule(teacherProfileId: string, moduleId: string): Promise<boolean> {
    const module = await this.curriculumRepository.findModuleById(moduleId);
    if (!module) {
      throw new NotFoundError(`Module with ID '${moduleId}' was not found.`);
    }
    await this.assertCourseEditable(teacherProfileId, module.courseId);
    return this.curriculumRepository.deleteModule(moduleId);
  }

  async reorderModules(
    teacherProfileId: string,
    courseId: string,
    items: ReorderItemDTO[]
  ): Promise<void> {
    await this.assertCourseEditable(teacherProfileId, courseId);
    await this.curriculumRepository.reorderModules(courseId, items);
  }

  // ================= LESSON OPERATIONS =================

  async createLesson(teacherProfileId: string, dto: CreateLessonDTO): Promise<CourseLessonEntity> {
    const module = await this.curriculumRepository.findModuleById(dto.moduleId);
    if (!module) {
      throw new NotFoundError(`Module with ID '${dto.moduleId}' was not found.`);
    }
    await this.assertCourseEditable(teacherProfileId, module.courseId);
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
    await this.assertCourseEditable(teacherProfileId, module.courseId);
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
    await this.assertCourseEditable(teacherProfileId, module.courseId);
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
    await this.assertCourseEditable(teacherProfileId, module.courseId);
    await this.curriculumRepository.reorderLessons(moduleId, items);
  }
}
