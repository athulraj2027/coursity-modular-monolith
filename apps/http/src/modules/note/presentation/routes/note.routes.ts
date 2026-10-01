import { Router } from "express";
import { NoteController } from "../controllers/note.controller";
import authMiddleware from "@/app/middlewares/auth.middleware";
import { isBlockedMiddleware } from "@/app/middlewares/is-blocked.middleware";
import { requireRoles } from "@/app/middlewares/role.middleware";

export function createNoteRouter(noteController: NoteController): Router {
  const router = Router();

  // All note routes require authentication and active non-blocked status
  router.use(authMiddleware, isBlockedMiddleware);

  // ================= 1. ADMIN ROUTES =================
  router.get(
    "/admin/all",
    requireRoles("ADMIN", "SUPERADMIN"),
    noteController.adminListNotes
  );

  // ================= 2. TEACHER & SHARED LECTURE/COURSE NOTE ROUTES =================
  router.post(
    "/",
    requireRoles("TEACHER", "ADMIN", "SUPERADMIN"),
    noteController.createNote
  );

  router.get(
    "/lecture/:lectureId",
    requireRoles("STUDENT", "TEACHER", "ADMIN", "SUPERADMIN"),
    noteController.getNotesByLecture
  );

  router.get(
    "/course/:courseId",
    requireRoles("STUDENT", "TEACHER", "ADMIN", "SUPERADMIN"),
    noteController.getNotesByCourse
  );

  router.get(
    "/:id",
    requireRoles("STUDENT", "TEACHER", "ADMIN", "SUPERADMIN"),
    noteController.getNoteDetail
  );

  router.put(
    "/:id",
    requireRoles("TEACHER", "ADMIN", "SUPERADMIN"),
    noteController.updateNote
  );

  router.delete(
    "/:id",
    requireRoles("TEACHER", "ADMIN", "SUPERADMIN"),
    noteController.deleteNote
  );

  return router;
}
