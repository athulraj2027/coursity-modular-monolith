import { INoteRepository } from "../../domain/repositories/note.repository";
import { NoteEntity } from "../../domain/entities/note.entity";
import { NoteNotFoundError, NoteAccessDeniedError } from "../../domain/errors/note.errors";

export interface GetNoteDetailInput {
  noteId: string;
  userId: string;
  userRole: string;
}

export class GetNoteDetailUseCase {
  constructor(private readonly noteRepo: INoteRepository) {}

  async execute(input: GetNoteDetailInput): Promise<NoteEntity> {
    const { noteId, userId, userRole } = input;

    const note = await this.noteRepo.findById(noteId);
    if (!note) {
      throw new NoteNotFoundError("Note not found");
    }

    if (userRole === "ADMIN" || userRole === "SUPERADMIN") {
      return note;
    }

    if (userRole === "TEACHER") {
      const teacherProfileId = await this.noteRepo.getTeacherProfileIdByUserId(userId);
      if (teacherProfileId === note.teacherProfileId) {
        return note;
      }
    }

    const isEnrolled = await this.noteRepo.isStudentEnrolled(userId, note.courseId);
    if (!isEnrolled) {
      throw new NoteAccessDeniedError("Access to this note is restricted to enrolled students");
    }

    return note;
  }
}
