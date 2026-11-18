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
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "@/modules/course/domain/services/teacher-profile-resolver.service";

export interface NoteControllerDependencies {
  createNoteUseCase: CreateNoteUseCase;
  getNotesByLectureUseCase: GetNotesByLectureUseCase;
  getNotesByCourseUseCase: GetNotesByCourseUseCase;
  getNoteDetailUseCase: GetNoteDetailUseCase;
  updateNoteUseCase: UpdateNoteUseCase;
  deleteNoteUseCase: DeleteNoteUseCase;
  adminListNotesUseCase: AdminListNotesUseCase;
  profileResolver?: ITeacherProfileResolver;
}

export class NoteController {
  private readonly createNoteController: CreateNoteController;
  private readonly getNotesByLectureController: GetNotesByLectureController;
  private readonly getNotesByCourseController: GetNotesByCourseController;
  private readonly getNoteDetailController: GetNoteDetailController;
  private readonly updateNoteController: UpdateNoteController;
  private readonly deleteNoteController: DeleteNoteController;
  private readonly adminListNotesController: AdminListNotesController;

  constructor(
    depsOrFirstUseCase: NoteControllerDependencies | CreateNoteUseCase,
    getNotesByLectureUseCase?: GetNotesByLectureUseCase,
    getNotesByCourseUseCase?: GetNotesByCourseUseCase,
    getNoteDetailUseCase?: GetNoteDetailUseCase,
    updateNoteUseCase?: UpdateNoteUseCase,
    deleteNoteUseCase?: DeleteNoteUseCase,
    adminListNotesUseCase?: AdminListNotesUseCase,
    profileResolver: ITeacherProfileResolver = defaultTeacherProfileResolver
  ) {
    if ("createNoteUseCase" in depsOrFirstUseCase) {
      const deps = depsOrFirstUseCase as NoteControllerDependencies;
      const resolver = deps.profileResolver || defaultTeacherProfileResolver;
      this.createNoteController = new CreateNoteController(deps.createNoteUseCase, resolver);
      this.getNotesByLectureController = new GetNotesByLectureController(deps.getNotesByLectureUseCase, resolver);
      this.getNotesByCourseController = new GetNotesByCourseController(deps.getNotesByCourseUseCase, resolver);
      this.getNoteDetailController = new GetNoteDetailController(deps.getNoteDetailUseCase, resolver);
      this.updateNoteController = new UpdateNoteController(deps.updateNoteUseCase, resolver);
      this.deleteNoteController = new DeleteNoteController(deps.deleteNoteUseCase, resolver);
      this.adminListNotesController = new AdminListNotesController(deps.adminListNotesUseCase);
    } else {
      this.createNoteController = new CreateNoteController(depsOrFirstUseCase, profileResolver);
      this.getNotesByLectureController = new GetNotesByLectureController(getNotesByLectureUseCase!, profileResolver);
      this.getNotesByCourseController = new GetNotesByCourseController(getNotesByCourseUseCase!, profileResolver);
      this.getNoteDetailController = new GetNoteDetailController(getNoteDetailUseCase!, profileResolver);
      this.updateNoteController = new UpdateNoteController(updateNoteUseCase!, profileResolver);
      this.deleteNoteController = new DeleteNoteController(deleteNoteUseCase!, profileResolver);
      this.adminListNotesController = new AdminListNotesController(adminListNotesUseCase!);
    }
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
