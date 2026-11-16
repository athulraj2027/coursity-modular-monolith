import { Router } from "express";
import { CourseController } from "../controllers/course.controller";
import authMiddleware from "@/app/middlewares/auth.middleware";
import { isBlockedMiddleware } from "@/app/middlewares/is-blocked.middleware";
import { requireRoles } from "@/app/middlewares/role.middleware";

export class CourseRoutes {
  public router: Router;

  constructor(private readonly courseController: CourseController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // ================= 1. PUBLIC DISCOVERY ENDPOINTS =================
    this.router.get("/", this.courseController.getPublicCourses);
    this.router.get("/featured", this.courseController.getFeaturedCourses);
    this.router.get("/trending", this.courseController.getTrendingCourses);
    this.router.get("/slug/:slug", this.courseController.getCourseBySlug);

    // ================= 2. TEACHER STUDIO ENDPOINTS =================
    this.router.get(
      "/teacher",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("TEACHER"),
      this.courseController.getTeacherCourses
    );

    this.router.get(
      "/teacher/mine",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("TEACHER"),
      this.courseController.getTeacherCourses
    );

    this.router.get(
      "/teacher/metrics",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("TEACHER"),
      this.courseController.getTeacherMetrics
    );

    this.router.get(
      "/teacher/:id",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("TEACHER"),
      this.courseController.getTeacherCourseById
    );

    this.router.post(
      "/teacher",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("TEACHER"),
      this.courseController.createCourse
    );

    this.router.post(
      "/",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("TEACHER"),
      this.courseController.createCourse
    );

    this.router.put(
      "/teacher/:id",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("TEACHER"),
      this.courseController.updateCourse
    );

    this.router.delete(
      "/teacher/:id",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("TEACHER"),
      this.courseController.deleteCourse
    );

    // Modules
    this.router.post(
      "/teacher/:id/modules",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("TEACHER"),
      this.courseController.createModule
    );

    this.router.put(
      "/teacher/modules/:moduleId",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("TEACHER"),
      this.courseController.updateModule
    );

    this.router.delete(
      "/teacher/modules/:moduleId",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("TEACHER"),
      this.courseController.deleteModule
    );

    this.router.post(
      "/teacher/:id/modules/reorder",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("TEACHER"),
      this.courseController.reorderModules
    );

    // Lessons
    this.router.post(
      "/teacher/modules/:moduleId/lessons",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("TEACHER"),
      this.courseController.createLesson
    );

    this.router.put(
      "/teacher/lessons/:lessonId",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("TEACHER"),
      this.courseController.updateLesson
    );

    this.router.delete(
      "/teacher/lessons/:lessonId",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("TEACHER"),
      this.courseController.deleteLesson
    );

    this.router.post(
      "/teacher/modules/:moduleId/lessons/reorder",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("TEACHER"),
      this.courseController.reorderLessons
    );

    // ================= 3. ADMIN MODERATION ENDPOINTS =================
    this.router.get(
      "/admin",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("ADMIN", "SUPERADMIN"),
      this.courseController.adminGetAllCourses
    );

    this.router.get(
      "/admin/all",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("ADMIN", "SUPERADMIN"),
      this.courseController.adminGetAllCourses
    );

    this.router.get(
      "/admin/metrics",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("ADMIN", "SUPERADMIN"),
      this.courseController.adminGetMetrics
    );

    this.router.get(
      "/admin/:id",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("ADMIN", "SUPERADMIN"),
      this.courseController.adminGetCourseById
    );

    this.router.patch(
      "/admin/:id/featured",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("ADMIN", "SUPERADMIN"),
      this.courseController.adminToggleFeatured
    );

    this.router.patch(
      "/admin/:id/trending",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("ADMIN", "SUPERADMIN"),
      this.courseController.adminToggleTrending
    );

    this.router.post(
      "/admin/:id/delist",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("ADMIN", "SUPERADMIN"),
      this.courseController.adminDelistCourse
    );

    this.router.post(
      "/admin/:id/freeze",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("ADMIN", "SUPERADMIN"),
      this.courseController.adminFreezeCourse
    );

    this.router.post(
      "/admin/:id/unfreeze",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("ADMIN", "SUPERADMIN"),
      this.courseController.adminUnfreezeCourse
    );

    this.router.delete(
      "/admin/:id",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("ADMIN", "SUPERADMIN"),
      this.courseController.adminSoftDeleteCourse
    );

    this.router.post(
      "/admin/:id/restore",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("ADMIN", "SUPERADMIN"),
      this.courseController.adminRestoreCourse
    );

    this.router.delete(
      "/admin/:id/permanent",
      authMiddleware,
      isBlockedMiddleware,
      requireRoles("ADMIN", "SUPERADMIN"),
      this.courseController.adminHardDeleteCourse
    );
  }
}
