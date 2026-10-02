import { Router } from "express";
import { HomeworkController } from "../controllers/homework.controller";
import authMiddleware from "@/app/middlewares/auth.middleware";
import { isBlockedMiddleware } from "@/app/middlewares/is-blocked.middleware";
import { requireRoles } from "@/app/middlewares/role.middleware";

export function createHomeworkRouter(homeworkController: HomeworkController): Router {
  const router = Router();

  // All homework routes require authentication and active non-blocked status
  router.use(authMiddleware, isBlockedMiddleware);

  // ================= 1. ADMIN ROUTES =================
  router.get(
    "/admin/all",
    requireRoles("ADMIN", "SUPERADMIN"),
    homeworkController.adminListHomework
  );

  // ================= 2. SUBMISSION REVIEW ROUTE =================
  router.put(
    "/submissions/:submissionId/review",
    requireRoles("TEACHER", "ADMIN", "SUPERADMIN"),
    homeworkController.reviewSubmission
  );

  // ================= 3. TEACHER & SHARED HOMEWORK ROUTES =================
  router.post(
    "/",
    requireRoles("TEACHER", "ADMIN", "SUPERADMIN"),
    homeworkController.createHomework
  );

  router.get(
    "/lecture/:lectureId",
    requireRoles("STUDENT", "TEACHER", "ADMIN", "SUPERADMIN"),
    homeworkController.getHomeworkByLecture
  );

  router.get(
    "/course/:courseId",
    requireRoles("STUDENT", "TEACHER", "ADMIN", "SUPERADMIN"),
    homeworkController.getHomeworkByCourse
  );

  router.get(
    "/:id",
    requireRoles("STUDENT", "TEACHER", "ADMIN", "SUPERADMIN"),
    homeworkController.getHomeworkDetail
  );

  router.put(
    "/:id",
    requireRoles("TEACHER", "ADMIN", "SUPERADMIN"),
    homeworkController.updateHomework
  );

  router.delete(
    "/:id",
    requireRoles("TEACHER", "ADMIN", "SUPERADMIN"),
    homeworkController.deleteHomework
  );

  // ================= 4. STUDENT SUBMISSION ROUTES =================
  router.post(
    "/:id/submit",
    requireRoles("STUDENT", "ADMIN", "SUPERADMIN"),
    homeworkController.submitHomework
  );

  router.get(
    "/:id/my-submission",
    requireRoles("STUDENT", "TEACHER", "ADMIN", "SUPERADMIN"),
    homeworkController.getMySubmission
  );

  router.get(
    "/:id/submissions",
    requireRoles("TEACHER", "ADMIN", "SUPERADMIN"),
    homeworkController.getHomeworkSubmissions
  );

  return router;
}
