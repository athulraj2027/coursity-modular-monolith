import defaultPrisma from "@/infrastructure/database/prisma.client";
import { PrismaNoteRepository } from "./infrastructure/repositories/prisma-note.repository";
import { INoteRepository } from "./domain/repositories/note.repository";
import { CreateNoteUseCase } from "./application/use-cases/create-note.usecase";
import { GetNotesByLectureUseCase } from "./application/use-cases/get-notes-by-lecture.usecase";
import { GetNotesByCourseUseCase } from "./application/use-cases/get-notes-by-course.usecase";
import { GetNoteDetailUseCase } from "./application/use-cases/get-note-detail.usecase";
import { UpdateNoteUseCase } from "./application/use-cases/update-note.usecase";
import { DeleteNoteUseCase } from "./application/use-cases/delete-note.usecase";
import { AdminListNotesUseCase } from "./application/use-cases/admin-list-notes.usecase";
import { NoteController } from "./presentation/controllers/note.controller";
import { createNoteRouter } from "./presentation/routes/note.routes";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "@/modules/course/domain/services/teacher-profile-resolver.service";

export interface NoteModuleDependencies {
  noteRepo?: INoteRepository;
  teacherProfileResolver?: ITeacherProfileResolver;
}

export function createNoteModule(deps?: NoteModuleDependencies) {
  const noteRepo = deps?.noteRepo || new PrismaNoteRepository(defaultPrisma);
  const profileResolver = deps?.teacherProfileResolver || defaultTeacherProfileResolver;

  const createNoteUseCase = new CreateNoteUseCase(noteRepo, profileResolver);
  const getNotesByLectureUseCase = new GetNotesByLectureUseCase(noteRepo, profileResolver);
  const getNotesByCourseUseCase = new GetNotesByCourseUseCase(noteRepo, profileResolver);
  const getNoteDetailUseCase = new GetNoteDetailUseCase(noteRepo, profileResolver);
  const updateNoteUseCase = new UpdateNoteUseCase(noteRepo, profileResolver);
  const deleteNoteUseCase = new DeleteNoteUseCase(noteRepo, profileResolver);
  const adminListNotesUseCase = new AdminListNotesUseCase(noteRepo);

  const noteController = new NoteController({
    createNoteUseCase,
    getNotesByLectureUseCase,
    getNotesByCourseUseCase,
    getNoteDetailUseCase,
    updateNoteUseCase,
    deleteNoteUseCase,
    adminListNotesUseCase,
    profileResolver,
  });

  const noteRouter = createNoteRouter(noteController);

  return {
    noteRouter,
    noteRepo,
    noteController,
    useCases: {
      createNoteUseCase,
      getNotesByLectureUseCase,
      getNotesByCourseUseCase,
      getNoteDetailUseCase,
      updateNoteUseCase,
      deleteNoteUseCase,
      adminListNotesUseCase,
    },
  };
}

const { noteRouter } = createNoteModule();
export default noteRouter;

// Domain exports
export * from "./domain/entities/note.entity";
export * from "./domain/dtos/note.dto";
export * from "./domain/repositories/note.repository";
export * from "./domain/errors/note.errors";
export * from "./domain/policies";

// Application exports
export * from "./application/use-cases/create-note.usecase";
export * from "./application/use-cases/get-notes-by-lecture.usecase";
export * from "./application/use-cases/get-notes-by-course.usecase";
export * from "./application/use-cases/get-note-detail.usecase";
export * from "./application/use-cases/update-note.usecase";
export * from "./application/use-cases/delete-note.usecase";
export * from "./application/use-cases/admin-list-notes.usecase";

// Presentation exports
export * from "./presentation/controllers";
export * from "./presentation/schemas/note.schema";
export * from "./presentation/routes/note.routes";
