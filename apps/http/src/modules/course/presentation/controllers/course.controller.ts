import { Request, Response, NextFunction } from "express";
import { GetCoursesUseCase } from "../../application/use-cases/get-courses.usecase";
import { TeacherCourseUseCase } from "../../application/use-cases/teacher-course.usecase";
import { AdminManageCoursesUseCase } from "../../application/use-cases/admin-manage-courses.usecase";
import {
  createCourseSchema,
  updateCourseSchema,
  createModuleSchema,
  updateModuleSchema,
  createLessonSchema,
  updateLessonSchema,
  reorderItemsSchema,
  adminDelistCourseSchema,
  adminFreezeCourseSchema,
  queryCoursesSchema,
} from "../validators/course.validator";
import { BadRequestError, ForbiddenError, UnauthorizedError } from "@/app/errors";
import defaultPrisma from "@/infrastructure/database/prisma.client";

export class CourseController {
  constructor(
    private readonly getCoursesUseCase: GetCoursesUseCase,
    private readonly teacherCourseUseCase: TeacherCourseUseCase,
    private readonly adminManageCoursesUseCase: AdminManageCoursesUseCase
  ) {}

  private async getTeacherProfileId(userId: string): Promise<string> {
    let profile = await defaultPrisma.profile.findUnique({
      where: { userId },
      include: { teacherProfile: true },
    });

    if (!profile) {
      profile = await defaultPrisma.profile.create({
        data: {
          userId,
          teacherProfile: {
            create: {},
          },
        },
        include: { teacherProfile: true },
      });
    } else if (!profile.teacherProfile) {
      const teacherProfile = await defaultPrisma.teacherProfile.create({
        data: {
          profileId: profile.id,
        },
      });
      return teacherProfile.id;
    }

    if (!profile.teacherProfile) {
      throw new BadRequestError("Unable to locate or initialize instructor profile.");
    }

    return profile.teacherProfile.id;
  }

  // ================= 1. PUBLIC DISCOVERY ENDPOINTS =================

  // GET /api/courses (Public published catalog)
  getPublicCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = queryCoursesSchema.parse(req.query);
      const result = await this.getCoursesUseCase.getPublicCourses(query as any);

      res.status(200).json({
        success: true,
        data: result.items,
        meta: {
          total: result.total,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/courses/featured (Public featured courses)
  getFeaturedCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 6;
      const courses = await this.getCoursesUseCase.getFeaturedCourses(limit);
      res.status(200).json({
        success: true,
        data: courses,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/courses/trending (Public trending courses)
  getTrendingCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 6;
      const courses = await this.getCoursesUseCase.getTrendingCourses(limit);
      res.status(200).json({
        success: true,
        data: courses,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/courses/slug/:slug (Public get course by slug with syllabus)
  getCourseBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : (req.params.slug as string);
      const course = await this.getCoursesUseCase.getCourseBySlug(slug);

      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (error) {
      next(error);
    }
  };

  // ================= 2. TEACHER STUDIO ENDPOINTS =================

  // GET /api/courses/teacher/mine (Protected - Teacher: List own courses)
  getTeacherCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const query = queryCoursesSchema.parse(req.query);

      const result = await this.teacherCourseUseCase.getTeacherCourses(teacherProfileId, query as any);

      res.status(200).json({
        success: true,
        data: result.items,
        meta: {
          total: result.total,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/courses/teacher/metrics (Protected - Teacher: Metrics overview)
  getTeacherMetrics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const metrics = await this.teacherCourseUseCase.getTeacherMetrics(teacherProfileId);

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/courses/teacher/:id (Protected - Teacher: Get own course details + curriculum)
  getTeacherCourseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);

      const course = await this.teacherCourseUseCase.getTeacherCourseById(teacherProfileId, id);

      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/courses/teacher (Protected - Teacher: Create course)
  createCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const validated = createCourseSchema.parse(req.body);

      const course = await this.teacherCourseUseCase.createCourse({
        ...validated,
        teacherProfileId,
      });

      res.status(201).json({
        success: true,
        message: "Course created successfully",
        data: course,
      });
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/courses/teacher/:id (Protected - Teacher: Update course)
  updateCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const validated = updateCourseSchema.parse(req.body);

      const course = await this.teacherCourseUseCase.updateCourse(teacherProfileId, id, validated as any);

      res.status(200).json({
        success: true,
        message: "Course updated successfully",
        data: course,
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/courses/teacher/:id (Protected - Teacher: Soft delete course)
  deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);

      const course = await this.teacherCourseUseCase.deleteCourse(teacherProfileId, id);

      res.status(200).json({
        success: true,
        message: "Course archived successfully",
        data: course,
      });
    } catch (error) {
      next(error);
    }
  };

  // ================= 3. TEACHER CURRICULUM ENDPOINTS =================

  // POST /api/courses/teacher/:id/modules (Add Module)
  createModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const courseId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const validated = createModuleSchema.parse(req.body);

      const module = await this.teacherCourseUseCase.createModule(teacherProfileId, {
        ...validated,
        courseId,
      });

      res.status(201).json({
        success: true,
        message: "Module added successfully",
        data: module,
      });
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/courses/teacher/modules/:moduleId (Update Module)
  updateModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const moduleId = Array.isArray(req.params.moduleId) ? req.params.moduleId[0] : (req.params.moduleId as string);
      const validated = updateModuleSchema.parse(req.body);

      const module = await this.teacherCourseUseCase.updateModule(teacherProfileId, moduleId, validated);

      res.status(200).json({
        success: true,
        message: "Module updated successfully",
        data: module,
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/courses/teacher/modules/:moduleId (Delete Module)
  deleteModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const moduleId = Array.isArray(req.params.moduleId) ? req.params.moduleId[0] : (req.params.moduleId as string);

      await this.teacherCourseUseCase.deleteModule(teacherProfileId, moduleId);

      res.status(200).json({
        success: true,
        message: "Module deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/courses/teacher/:id/modules/reorder (Reorder Modules)
  reorderModules = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const courseId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const validated = reorderItemsSchema.parse(req.body);

      await this.teacherCourseUseCase.reorderModules(teacherProfileId, courseId, validated.items);

      res.status(200).json({
        success: true,
        message: "Modules reordered successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/courses/teacher/modules/:moduleId/lessons (Add Lesson)
  createLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const moduleId = Array.isArray(req.params.moduleId) ? req.params.moduleId[0] : (req.params.moduleId as string);
      const validated = createLessonSchema.parse(req.body);

      const lesson = await this.teacherCourseUseCase.createLesson(teacherProfileId, {
        ...validated,
        moduleId,
      } as any);

      res.status(201).json({
        success: true,
        message: "Lesson added successfully",
        data: lesson,
      });
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/courses/teacher/lessons/:lessonId (Update Lesson)
  updateLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const lessonId = Array.isArray(req.params.lessonId) ? req.params.lessonId[0] : (req.params.lessonId as string);
      const validated = updateLessonSchema.parse(req.body);

      const lesson = await this.teacherCourseUseCase.updateLesson(teacherProfileId, lessonId, validated as any);

      res.status(200).json({
        success: true,
        message: "Lesson updated successfully",
        data: lesson,
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/courses/teacher/lessons/:lessonId (Delete Lesson)
  deleteLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const lessonId = Array.isArray(req.params.lessonId) ? req.params.lessonId[0] : (req.params.lessonId as string);

      await this.teacherCourseUseCase.deleteLesson(teacherProfileId, lessonId);

      res.status(200).json({
        success: true,
        message: "Lesson deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/courses/teacher/modules/:moduleId/lessons/reorder (Reorder Lessons)
  reorderLessons = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const moduleId = Array.isArray(req.params.moduleId) ? req.params.moduleId[0] : (req.params.moduleId as string);
      const validated = reorderItemsSchema.parse(req.body);

      await this.teacherCourseUseCase.reorderLessons(teacherProfileId, moduleId, validated.items);

      res.status(200).json({
        success: true,
        message: "Lessons reordered successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  // ================= 4. ADMIN MODERATION ENDPOINTS =================

  // GET /api/courses/admin/all (Protected - Admin: Get all courses)
  adminGetAllCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const query = queryCoursesSchema.parse(req.query);
      const result = await this.adminManageCoursesUseCase.getAllCourses(query as any);

      res.status(200).json({
        success: true,
        data: result.items,
        meta: {
          total: result.total,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/courses/admin/metrics (Protected - Admin: Platform Course Metrics)
  adminGetMetrics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const metrics = await this.adminManageCoursesUseCase.getMetrics();
      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/courses/admin/:id (Protected - Admin: Get single course)
  adminGetCourseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const course = await this.adminManageCoursesUseCase.getCourseById(id);

      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/courses/admin/:id/featured (Protected - Admin: Toggle featured)
  adminToggleFeatured = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const isFeatured = req.body.isFeatured === true;

      const course = await this.adminManageCoursesUseCase.toggleFeatured(id, isFeatured);

      res.status(200).json({
        success: true,
        message: `Course featured status updated to ${isFeatured}`,
        data: course,
      });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/courses/admin/:id/trending (Protected - Admin: Toggle trending)
  adminToggleTrending = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const isTrending = req.body.isTrending === true;

      const course = await this.adminManageCoursesUseCase.toggleTrending(id, isTrending);

      res.status(200).json({
        success: true,
        message: `Course trending status updated to ${isTrending}`,
        data: course,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/courses/admin/:id/delist (Protected - Admin: Delist unstarted course with reason)
  adminDelistCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const validated = adminDelistCourseSchema.parse(req.body);

      const course = await this.adminManageCoursesUseCase.delistCourse(id, validated);

      res.status(200).json({
        success: true,
        message: "Course delisted successfully and instructor notified via email",
        data: course,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/courses/admin/:id/freeze (Protected - Admin: Freeze started course with reason)
  adminFreezeCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const validated = adminFreezeCourseSchema.parse(req.body);

      const course = await this.adminManageCoursesUseCase.freezeCourse(id, validated);

      res.status(200).json({
        success: true,
        message: "Course frozen successfully and instructor notified via email",
        data: course,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/courses/admin/:id/unfreeze (Protected - Admin: Unfreeze course)
  adminUnfreezeCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const course = await this.adminManageCoursesUseCase.unfreezeCourse(id);

      res.status(200).json({
        success: true,
        message: "Course unfrozen successfully",
        data: course,
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/courses/admin/:id (Protected - Admin: Soft delete)
  adminSoftDeleteCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const reason = typeof req.body?.reason === "string" ? req.body.reason : undefined;
      const course = await this.adminManageCoursesUseCase.softDelete(id, reason);

      res.status(200).json({
        success: true,
        message: "Course archived successfully",
        data: course,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/courses/admin/:id/restore (Protected - Admin: Restore)
  adminRestoreCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const course = await this.adminManageCoursesUseCase.restore(id);

      res.status(200).json({
        success: true,
        message: "Course restored successfully",
        data: course,
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/courses/admin/:id/permanent (Protected - Admin: Hard delete)
  adminHardDeleteCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      await this.adminManageCoursesUseCase.hardDelete(id);

      res.status(200).json({
        success: true,
        message: "Course permanently deleted",
      });
    } catch (error) {
      next(error);
    }
  };

  private ensureAdmin(req: Request) {
    if (!req.user || req.user.role !== "ADMIN") {
      throw new ForbiddenError("Admin privileges required to manage course records.");
    }
  }
}
