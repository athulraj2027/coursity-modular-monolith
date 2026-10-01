import defaultPrisma from "@/infrastructure/database/prisma.client";
import { PrismaNoteRepository } from "./infrastructure/repositories/prisma-note.repository";
import { CreateNoteUseCase } from "./application/use-cases/create-note.usecase";
import { GetNotesByLectureUseCase } from "./application/use-cases/get-notes-by-lecture.usecase";
import { GetNotesByCourseUseCase } from "./application/use-cases/get-notes-by-course.usecase";
import { GetNoteDetailUseCase } from "./application/use-cases/get-note-detail.usecase";
import { UpdateNoteUseCase } from "./application/use-cases/update-note.usecase";
import { DeleteNoteUseCase } from "./application/use-cases/delete-note.usecase";
import { AdminListNotesUseCase } from "./application/use-cases/admin-list-notes.usecase";
import { NoteController } from "./presentation/controllers/note.controller";
import { createNoteRouter } from "./presentation/routes/note.routes";

export function createNoteModule() {
  const noteRepo = new PrismaNoteRepository(defaultPrisma);

  const createNoteUseCase = new CreateNoteUseCase(noteRepo);
  const getNotesByLectureUseCase = new GetNotesByLectureUseCase(noteRepo);
  const getNotesByCourseUseCase = new GetNotesByCourseUseCase(noteRepo);
  const getNoteDetailUseCase = new GetNoteDetailUseCase(noteRepo);
  const updateNoteUseCase = new UpdateNoteUseCase(noteRepo);
  const deleteNoteUseCase = new DeleteNoteUseCase(noteRepo);
  const adminListNotesUseCase = new AdminListNotesUseCase(noteRepo);

  const noteController = new NoteController(
    createNoteUseCase,
    getNotesByLectureUseCase,
    getNotesByCourseUseCase,
    getNoteDetailUseCase,
    updateNoteUseCase,
    deleteNoteUseCase,
    adminListNotesUseCase
  );

  const noteRouter = createNoteRouter(noteController);

  return {
    noteRouter,
    noteRepo,
    noteController,
  };
}

const { noteRouter } = createNoteModule();
export default noteRouter;
export * from "./domain/entities/note.entity";
export * from "./domain/dtos/note.dto";
export * from "./domain/repositories/note.repository";
export * from "./domain/errors/note.errors";
