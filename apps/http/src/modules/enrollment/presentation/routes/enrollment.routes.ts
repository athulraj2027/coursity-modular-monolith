import { Router } from "express";
import { EnrollmentController } from "../controllers/enrollment.controller";
import authMiddleware from "@/app/middlewares/auth.middleware";
import { isBlockedMiddleware } from "@/app/middlewares/is-blocked.middleware";
import { requireRoles } from "@/app/middlewares/role.middleware";

export function createEnrollmentRouter(controller: EnrollmentController): Router {
  const router = Router();

  // 1. Admin Enrollment Management Endpoints
  router.get(
    "/admin/all",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminListEnrollments
  );
  router.get(
    "/admin/:id",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminGetEnrollmentDetail
  );

  // 2. Public Certificate Verification (Anyone with code)
  router.get("/certificates/:code", controller.getCertificate);

  // 3. Student Enrollment & Checkout Actions
  router.post("/free", authMiddleware, isBlockedMiddleware, controller.enrollFree);
  router.post("/order", authMiddleware, isBlockedMiddleware, controller.createOrder);
  router.post("/verify", authMiddleware, isBlockedMiddleware, controller.verifyPayment);
  router.post("/wallet-pay", authMiddleware, isBlockedMiddleware, controller.payWithWallet);

  // 4. Student Learning & Classroom
  router.get("/my-courses", authMiddleware, isBlockedMiddleware, controller.getMyEnrollments);
  router.get("/classroom/:courseIdOrSlug", authMiddleware, isBlockedMiddleware, controller.getClassroom);
  router.post("/:enrollmentId/attendance", authMiddleware, isBlockedMiddleware, controller.markAttendance);
  router.post("/:enrollmentId/progress", authMiddleware, isBlockedMiddleware, controller.updateProgress);

  // 5. 20-Day / 4-Classes Guarantee Refund Workflow
  router.post("/:enrollmentId/refund", authMiddleware, isBlockedMiddleware, controller.requestRefund);

  // 6. Completion Certificate Claiming
  router.post("/:enrollmentId/claim-certificate", authMiddleware, isBlockedMiddleware, controller.claimCertificate);

  // 7. Teacher Enrolled Student Roster & Telemetry Workspace
  router.get(
    "/teacher/course/:courseId/students",
    authMiddleware,
    isBlockedMiddleware,
    controller.getTeacherCourseStudents
  );
  router.get(
    "/teacher/all",
    authMiddleware,
    isBlockedMiddleware,
    controller.teacherListEnrollments
  );
  router.get(
    "/teacher/:id",
    authMiddleware,
    isBlockedMiddleware,
    controller.teacherGetEnrollmentDetail
  );

  return router;
}

