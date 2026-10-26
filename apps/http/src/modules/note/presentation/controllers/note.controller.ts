import { Request, Response, NextFunction } from "express";
import { CreateNoteUseCase } from "../../application/use-cases/create-note.usecase";
import { GetNotesByLectureUseCase } from "../../application/use-cases/get-notes-by-lecture.usecase";
import { GetNotesByCourseUseCase } from "../../application/use-cases/get-notes-by-course.usecase";
import { GetNoteDetailUseCase } from "../../application/use-cases/get-note-detail.usecase";
import { UpdateNoteUseCase } from "../../application/use-cases/update-note.usecase";
import { DeleteNoteUseCase } from "../../application/use-cases/delete-note.usecase";
import { AdminListNotesUseCase } from "../../application/use-cases/admin-list-notes.usecase";

import { CreateNoteController } from "./create-note.controller";
import { GetNotesByLectureController } from "./get-notes-by-lecture.controller";
import { GetNotesByCourseController } from "./get-notes-by-course.controller";
import { GetNoteDetailController } from "./get-note-detail.controller";
import { UpdateNoteController } from "./update-note.controller";
import { DeleteNoteController } from "./delete-note.controller";
import { AdminListNotesController } from "./admin-list-notes.controller";

export class NoteController {
  private readonly createNoteController: CreateNoteController;
  private readonly getNotesByLectureController: GetNotesByLectureController;
  private readonly getNotesByCourseController: GetNotesByCourseController;
  private readonly getNoteDetailController: GetNoteDetailController;
  private readonly updateNoteController: UpdateNoteController;
  private readonly deleteNoteController: DeleteNoteController;
  private readonly adminListNotesController: AdminListNotesController;

  constructor(
    private readonly createNoteUseCase: CreateNoteUseCase,
    private readonly getNotesByLectureUseCase: GetNotesByLectureUseCase,
    private readonly getNotesByCourseUseCase: GetNotesByCourseUseCase,
    private readonly getNoteDetailUseCase: GetNoteDetailUseCase,
    private readonly updateNoteUseCase: UpdateNoteUseCase,
    private readonly deleteNoteUseCase: DeleteNoteUseCase,
    private readonly adminListNotesUseCase: AdminListNotesUseCase
  ) {
    this.createNoteController = new CreateNoteController(createNoteUseCase);
    this.getNotesByLectureController = new GetNotesByLectureController(getNotesByLectureUseCase);
    this.getNotesByCourseController = new GetNotesByCourseController(getNotesByCourseUseCase);
    this.getNoteDetailController = new GetNoteDetailController(getNoteDetailUseCase);
    this.updateNoteController = new UpdateNoteController(updateNoteUseCase);
    this.deleteNoteController = new DeleteNoteController(deleteNoteUseCase);
    this.adminListNotesController = new AdminListNotesController(adminListNotesUseCase);
  }

  createNote = (req: Request, res: Response, next: NextFunction) =>
    this.createNoteController.execute(req, res, next);

  getNotesByLecture = (req: Request, res: Response, next: NextFunction) =>
    this.getNotesByLectureController.execute(req, res, next);

  getNotesByCourse = (req: Request, res: Response, next: NextFunction) =>
    this.getNotesByCourseController.execute(req, res, next);

  getNoteDetail = (req: Request, res: Response, next: NextFunction) =>
    this.getNoteDetailController.execute(req, res, next);

  updateNote = (req: Request, res: Response, next: NextFunction) =>
    this.updateNoteController.execute(req, res, next);

  deleteNote = (req: Request, res: Response, next: NextFunction) =>
    this.deleteNoteController.execute(req, res, next);

  adminListNotes = (req: Request, res: Response, next: NextFunction) =>
    this.adminListNotesController.execute(req, res, next);
}
