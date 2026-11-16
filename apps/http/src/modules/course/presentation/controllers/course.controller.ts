import { Request, Response, NextFunction } from "express";
import { GetCoursesUseCase } from "../../application/use-cases/get-courses.usecase";
import { TeacherCourseUseCase } from "../../application/use-cases/teacher-course.usecase";
import { AdminManageCoursesUseCase } from "../../application/use-cases/admin-manage-courses.usecase";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "../../domain/services/teacher-profile-resolver.service";

import { GetPublicCoursesController } from "./get-public-courses.controller";
import { GetFeaturedCoursesController } from "./get-featured-courses.controller";
import { GetTrendingCoursesController } from "./get-trending-courses.controller";
import { GetCourseBySlugController } from "./get-course-by-slug.controller";

import { GetTeacherCoursesController } from "./get-teacher-courses.controller";
import { GetTeacherMetricsController } from "./get-teacher-metrics.controller";
import { GetTeacherCourseByIdController } from "./get-teacher-course-by-id.controller";
import { CreateCourseController } from "./create-course.controller";
import { UpdateCourseController } from "./update-course.controller";
import { DeleteCourseController } from "./delete-course.controller";

import { CreateModuleController } from "./create-module.controller";
import { UpdateModuleController } from "./update-module.controller";
import { DeleteModuleController } from "./delete-module.controller";
import { ReorderModulesController } from "./reorder-modules.controller";
import { CreateLessonController } from "./create-lesson.controller";
import { UpdateLessonController } from "./update-lesson.controller";
import { DeleteLessonController } from "./delete-lesson.controller";
import { ReorderLessonsController } from "./reorder-lessons.controller";

import { AdminGetAllCoursesController } from "./admin-get-all-courses.controller";
import { AdminGetCourseMetricsController } from "./admin-get-course-metrics.controller";
import { AdminGetCourseByIdController } from "./admin-get-course-by-id.controller";
import { AdminToggleFeaturedController } from "./admin-toggle-featured.controller";
import { AdminToggleTrendingController } from "./admin-toggle-trending.controller";
import { AdminDelistCourseController } from "./admin-delist-course.controller";
import { AdminFreezeCourseController } from "./admin-freeze-course.controller";
import { AdminUnfreezeCourseController } from "./admin-unfreeze-course.controller";
import { AdminSoftDeleteCourseController } from "./admin-soft-delete-course.controller";
import { AdminRestoreCourseController } from "./admin-restore-course.controller";
import { AdminHardDeleteCourseController } from "./admin-hard-delete-course.controller";

export interface CourseControllerDependencies {
  getCoursesUseCase: GetCoursesUseCase;
  teacherCourseUseCase: TeacherCourseUseCase;
  adminManageCoursesUseCase: AdminManageCoursesUseCase;
  profileResolver?: ITeacherProfileResolver;
}

export class CourseController {
  private readonly getPublicCoursesController: GetPublicCoursesController;
  private readonly getFeaturedCoursesController: GetFeaturedCoursesController;
  private readonly getTrendingCoursesController: GetTrendingCoursesController;
  private readonly getCourseBySlugController: GetCourseBySlugController;

  private readonly getTeacherCoursesController: GetTeacherCoursesController;
  private readonly getTeacherMetricsController: GetTeacherMetricsController;
  private readonly getTeacherCourseByIdController: GetTeacherCourseByIdController;
  private readonly createCourseController: CreateCourseController;
  private readonly updateCourseController: UpdateCourseController;
  private readonly deleteCourseController: DeleteCourseController;

  private readonly createModuleController: CreateModuleController;
  private readonly updateModuleController: UpdateModuleController;
  private readonly deleteModuleController: DeleteModuleController;
  private readonly reorderModulesController: ReorderModulesController;
  private readonly createLessonController: CreateLessonController;
  private readonly updateLessonController: UpdateLessonController;
  private readonly deleteLessonController: DeleteLessonController;
  private readonly reorderLessonsController: ReorderLessonsController;

  private readonly adminGetAllCoursesController: AdminGetAllCoursesController;
  private readonly adminGetMetricsController: AdminGetCourseMetricsController;
  private readonly adminGetCourseByIdController: AdminGetCourseByIdController;
  private readonly adminToggleFeaturedController: AdminToggleFeaturedController;
  private readonly adminToggleTrendingController: AdminToggleTrendingController;
  private readonly adminDelistCourseController: AdminDelistCourseController;
  private readonly adminFreezeCourseController: AdminFreezeCourseController;
  private readonly adminUnfreezeCourseController: AdminUnfreezeCourseController;
  private readonly adminSoftDeleteCourseController: AdminSoftDeleteCourseController;
  private readonly adminRestoreCourseController: AdminRestoreCourseController;
  private readonly adminHardDeleteCourseController: AdminHardDeleteCourseController;

  constructor(
    getCoursesUseCaseOrDeps: GetCoursesUseCase | CourseControllerDependencies,
    teacherCourseUseCase?: TeacherCourseUseCase,
    adminManageCoursesUseCase?: AdminManageCoursesUseCase,
    profileResolver: ITeacherProfileResolver = defaultTeacherProfileResolver
  ) {
    let getCoursesUC: GetCoursesUseCase;
    let teacherCourseUC: TeacherCourseUseCase;
    let adminManageUC: AdminManageCoursesUseCase;
    let resolver: ITeacherProfileResolver = profileResolver;

    if (
      typeof getCoursesUseCaseOrDeps === "object" &&
      "getCoursesUseCase" in getCoursesUseCaseOrDeps &&
      "teacherCourseUseCase" in getCoursesUseCaseOrDeps
    ) {
      getCoursesUC = getCoursesUseCaseOrDeps.getCoursesUseCase;
      teacherCourseUC = getCoursesUseCaseOrDeps.teacherCourseUseCase;
      adminManageUC = getCoursesUseCaseOrDeps.adminManageCoursesUseCase;
      if (getCoursesUseCaseOrDeps.profileResolver) {
        resolver = getCoursesUseCaseOrDeps.profileResolver;
      }
    } else {
      getCoursesUC = getCoursesUseCaseOrDeps as GetCoursesUseCase;
      teacherCourseUC = teacherCourseUseCase!;
      adminManageUC = adminManageCoursesUseCase!;
    }

    this.getPublicCoursesController = new GetPublicCoursesController(getCoursesUC);
    this.getFeaturedCoursesController = new GetFeaturedCoursesController(getCoursesUC);
    this.getTrendingCoursesController = new GetTrendingCoursesController(getCoursesUC);
    this.getCourseBySlugController = new GetCourseBySlugController(getCoursesUC);

    this.getTeacherCoursesController = new GetTeacherCoursesController(teacherCourseUC, resolver);
    this.getTeacherMetricsController = new GetTeacherMetricsController(teacherCourseUC, resolver);
    this.getTeacherCourseByIdController = new GetTeacherCourseByIdController(teacherCourseUC, resolver);
    this.createCourseController = new CreateCourseController(teacherCourseUC, resolver);
    this.updateCourseController = new UpdateCourseController(teacherCourseUC, resolver);
    this.deleteCourseController = new DeleteCourseController(teacherCourseUC, resolver);

    this.createModuleController = new CreateModuleController(teacherCourseUC, resolver);
    this.updateModuleController = new UpdateModuleController(teacherCourseUC, resolver);
    this.deleteModuleController = new DeleteModuleController(teacherCourseUC, resolver);
    this.reorderModulesController = new ReorderModulesController(teacherCourseUC, resolver);
    this.createLessonController = new CreateLessonController(teacherCourseUC, resolver);
    this.updateLessonController = new UpdateLessonController(teacherCourseUC, resolver);
    this.deleteLessonController = new DeleteLessonController(teacherCourseUC, resolver);
    this.reorderLessonsController = new ReorderLessonsController(teacherCourseUC, resolver);

    this.adminGetAllCoursesController = new AdminGetAllCoursesController(adminManageUC);
    this.adminGetMetricsController = new AdminGetCourseMetricsController(adminManageUC);
    this.adminGetCourseByIdController = new AdminGetCourseByIdController(adminManageUC);
    this.adminToggleFeaturedController = new AdminToggleFeaturedController(adminManageUC);
    this.adminToggleTrendingController = new AdminToggleTrendingController(adminManageUC);
    this.adminDelistCourseController = new AdminDelistCourseController(adminManageUC);
    this.adminFreezeCourseController = new AdminFreezeCourseController(adminManageUC);
    this.adminUnfreezeCourseController = new AdminUnfreezeCourseController(adminManageUC);
    this.adminSoftDeleteCourseController = new AdminSoftDeleteCourseController(adminManageUC);
    this.adminRestoreCourseController = new AdminRestoreCourseController(adminManageUC);
    this.adminHardDeleteCourseController = new AdminHardDeleteCourseController(adminManageUC);
  }

  // 1. PUBLIC DISCOVERY ENDPOINTS
  getPublicCourses = (req: Request, res: Response, next: NextFunction) =>
    this.getPublicCoursesController.execute(req, res, next);

  getFeaturedCourses = (req: Request, res: Response, next: NextFunction) =>
    this.getFeaturedCoursesController.execute(req, res, next);

  getTrendingCourses = (req: Request, res: Response, next: NextFunction) =>
    this.getTrendingCoursesController.execute(req, res, next);

  getCourseBySlug = (req: Request, res: Response, next: NextFunction) =>
    this.getCourseBySlugController.execute(req, res, next);

  // 2. TEACHER STUDIO ENDPOINTS
  getTeacherCourses = (req: Request, res: Response, next: NextFunction) =>
    this.getTeacherCoursesController.execute(req, res, next);

  getTeacherMetrics = (req: Request, res: Response, next: NextFunction) =>
    this.getTeacherMetricsController.execute(req, res, next);

  getTeacherCourseById = (req: Request, res: Response, next: NextFunction) =>
    this.getTeacherCourseByIdController.execute(req, res, next);

  createCourse = (req: Request, res: Response, next: NextFunction) =>
    this.createCourseController.execute(req, res, next);

  updateCourse = (req: Request, res: Response, next: NextFunction) =>
    this.updateCourseController.execute(req, res, next);

  deleteCourse = (req: Request, res: Response, next: NextFunction) =>
    this.deleteCourseController.execute(req, res, next);

  // 3. TEACHER CURRICULUM ENDPOINTS
  createModule = (req: Request, res: Response, next: NextFunction) =>
    this.createModuleController.execute(req, res, next);

  updateModule = (req: Request, res: Response, next: NextFunction) =>
    this.updateModuleController.execute(req, res, next);

  deleteModule = (req: Request, res: Response, next: NextFunction) =>
    this.deleteModuleController.execute(req, res, next);

  reorderModules = (req: Request, res: Response, next: NextFunction) =>
    this.reorderModulesController.execute(req, res, next);

  createLesson = (req: Request, res: Response, next: NextFunction) =>
    this.createLessonController.execute(req, res, next);

  updateLesson = (req: Request, res: Response, next: NextFunction) =>
    this.updateLessonController.execute(req, res, next);

  deleteLesson = (req: Request, res: Response, next: NextFunction) =>
    this.deleteLessonController.execute(req, res, next);

  reorderLessons = (req: Request, res: Response, next: NextFunction) =>
    this.reorderLessonsController.execute(req, res, next);

  // 4. ADMIN MODERATION ENDPOINTS
  adminGetAllCourses = (req: Request, res: Response, next: NextFunction) =>
    this.adminGetAllCoursesController.execute(req, res, next);

  adminGetMetrics = (req: Request, res: Response, next: NextFunction) =>
    this.adminGetMetricsController.execute(req, res, next);

  adminGetCourseById = (req: Request, res: Response, next: NextFunction) =>
    this.adminGetCourseByIdController.execute(req, res, next);

  adminToggleFeatured = (req: Request, res: Response, next: NextFunction) =>
    this.adminToggleFeaturedController.execute(req, res, next);

  adminToggleTrending = (req: Request, res: Response, next: NextFunction) =>
    this.adminToggleTrendingController.execute(req, res, next);

  adminDelistCourse = (req: Request, res: Response, next: NextFunction) =>
    this.adminDelistCourseController.execute(req, res, next);

  adminFreezeCourse = (req: Request, res: Response, next: NextFunction) =>
    this.adminFreezeCourseController.execute(req, res, next);

  adminUnfreezeCourse = (req: Request, res: Response, next: NextFunction) =>
    this.adminUnfreezeCourseController.execute(req, res, next);

  adminSoftDeleteCourse = (req: Request, res: Response, next: NextFunction) =>
    this.adminSoftDeleteCourseController.execute(req, res, next);

  adminRestoreCourse = (req: Request, res: Response, next: NextFunction) =>
    this.adminRestoreCourseController.execute(req, res, next);

  adminHardDeleteCourse = (req: Request, res: Response, next: NextFunction) =>
    this.adminHardDeleteCourseController.execute(req, res, next);
}
