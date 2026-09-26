import { Router } from "express";
import { LectureController } from "../controllers/lecture.controller";
import authMiddleware from "@/app/middlewares/auth.middleware";
import { isBlockedMiddleware } from "@/app/middlewares/is-blocked.middleware";
import { requireRoles } from "@/app/middlewares/role.middleware";

export function createLectureRouter(lectureController: LectureController): Router {
  const router = Router();

  // All lecture routes require authentication and active non-blocked status
  router.use(authMiddleware, isBlockedMiddleware);

  // ================= 1. TEACHER LECTURE ROUTES =================
  router.get(
    "/teacher",
    requireRoles("TEACHER", "ADMIN", "SUPERADMIN"),
    lectureController.teacherGetLectures
  );

  router.get(
    "/teacher/:id",
    requireRoles("TEACHER", "ADMIN", "SUPERADMIN"),
    lectureController.teacherGetLectureDetail
  );

  router.post(
    "/teacher",
    requireRoles("TEACHER", "ADMIN", "SUPERADMIN"),
    lectureController.teacherCreateLecture
  );

  router.post(
    "/",
    requireRoles("TEACHER", "ADMIN", "SUPERADMIN"),
    lectureController.teacherCreateLecture
  );

  router.put(
    "/teacher/:id",
    requireRoles("TEACHER", "ADMIN", "SUPERADMIN"),
    lectureController.teacherUpdateLecture
  );

  router.put(
    "/:id",
    requireRoles("TEACHER", "ADMIN", "SUPERADMIN"),
    lectureController.teacherUpdateLecture
  );

  router.delete(
    "/teacher/:id",
    requireRoles("TEACHER", "ADMIN", "SUPERADMIN"),
    lectureController.teacherDeleteLecture
  );

  router.delete(
    "/:id",
    requireRoles("TEACHER", "ADMIN", "SUPERADMIN"),
    lectureController.teacherDeleteLecture
  );

  // ================= 2. ADMIN LECTURE ROUTES =================
  router.get(
    "/admin",
    requireRoles("ADMIN", "SUPERADMIN"),
    lectureController.adminGetLectures
  );

  router.get(
    "/admin/:id",
    requireRoles("ADMIN", "SUPERADMIN"),
    lectureController.adminGetLectureDetail
  );

  // ================= 3. STUDENT LECTURE ROUTES =================
  router.get(
    "/student",
    requireRoles("STUDENT", "ADMIN", "SUPERADMIN", "TEACHER"),
    lectureController.studentGetLectures
  );

  router.get(
    "/student/:id",
    requireRoles("STUDENT", "ADMIN", "SUPERADMIN", "TEACHER"),
    lectureController.studentGetLectureDetail
  );

  return router;
}
