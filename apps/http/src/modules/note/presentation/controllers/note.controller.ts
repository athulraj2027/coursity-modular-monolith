import { Request, Response, NextFunction } from "express";
import { CreateNoteUseCase } from "../../application/use-cases/create-note.usecase";
import { GetNotesByLectureUseCase } from "../../application/use-cases/get-notes-by-lecture.usecase";
import { GetNotesByCourseUseCase } from "../../application/use-cases/get-notes-by-course.usecase";
import { GetNoteDetailUseCase } from "../../application/use-cases/get-note-detail.usecase";
import { UpdateNoteUseCase } from "../../application/use-cases/update-note.usecase";
import { DeleteNoteUseCase } from "../../application/use-cases/delete-note.usecase";
import { AdminListNotesUseCase } from "../../application/use-cases/admin-list-notes.usecase";
import { UnauthorizedError } from "@/app/errors";

export class NoteController {
  constructor(
    private readonly createNoteUseCase: CreateNoteUseCase,
    private readonly getNotesByLectureUseCase: GetNotesByLectureUseCase,
    private readonly getNotesByCourseUseCase: GetNotesByCourseUseCase,
    private readonly getNoteDetailUseCase: GetNoteDetailUseCase,
    private readonly updateNoteUseCase: UpdateNoteUseCase,
    private readonly deleteNoteUseCase: DeleteNoteUseCase,
    private readonly adminListNotesUseCase: AdminListNotesUseCase
  ) {}

  createNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const result = await this.createNoteUseCase.execute({
        userId: req.user.userId,
        userRole: req.user.role,
        data: req.body,
      });
      return res.status(201).json({
        success: true,
        data: result,
        message: "Note uploaded and created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getNotesByLecture = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const lectureId = req.params.lectureId as string;
      const result = await this.getNotesByLectureUseCase.execute({
        lectureId,
        userId: req.user.userId,
        userRole: req.user.role,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getNotesByCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const courseId = req.params.courseId as string;
      const result = await this.getNotesByCourseUseCase.execute({
        courseId,
        userId: req.user.userId,
        userRole: req.user.role,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getNoteDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const noteId = req.params.id as string;
      const result = await this.getNoteDetailUseCase.execute({
        noteId,
        userId: req.user.userId,
        userRole: req.user.role,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  updateNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const noteId = req.params.id as string;
      const result = await this.updateNoteUseCase.execute({
        noteId,
        userId: req.user.userId,
        userRole: req.user.role,
        data: req.body,
      });
      return res.status(200).json({
        success: true,
        data: result,
        message: "Note updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  deleteNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const noteId = req.params.id as string;
      await this.deleteNoteUseCase.execute({
        noteId,
        userId: req.user.userId,
        userRole: req.user.role,
      });
      return res.status(200).json({
        success: true,
        message: "Note deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  adminListNotes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.adminListNotesUseCase.execute(req.query as any);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
