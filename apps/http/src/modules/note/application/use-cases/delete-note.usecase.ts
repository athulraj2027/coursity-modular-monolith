import { INoteRepository } from "../../domain/repositories/note.repository";
import { NoteNotFoundError, NoteAccessDeniedError } from "../../domain/errors/note.errors";

export interface DeleteNoteInput {
  noteId: string;
  userId: string;
  userRole: string;
}

export class DeleteNoteUseCase {
  constructor(private readonly noteRepo: INoteRepository) {}

  async execute(input: DeleteNoteInput): Promise<boolean> {
    const { noteId, userId, userRole } = input;

    const existing = await this.noteRepo.findById(noteId);
    if (!existing) {
      throw new NoteNotFoundError("Note not found");
    }

    if (userRole === "TEACHER") {
      const teacherProfileId = await this.noteRepo.getTeacherProfileIdByUserId(userId);
      if (!teacherProfileId || teacherProfileId !== existing.teacherProfileId) {
        throw new NoteAccessDeniedError("You can only delete notes you have created");
      }
    } else if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      throw new NoteAccessDeniedError("You do not have permission to delete notes");
    }

    return this.noteRepo.softDelete(noteId);
  }
}
