import { INoteRepository } from "../../domain/repositories/note.repository";
import { UpdateNoteDTO } from "../../domain/dtos/note.dto";
import { NoteEntity } from "../../domain/entities/note.entity";
import { NoteNotFoundError, NoteAccessDeniedError, NoteValidationError } from "../../domain/errors/note.errors";

export interface UpdateNoteInput {
  noteId: string;
  userId: string;
  userRole: string;
  data: UpdateNoteDTO;
}

export class UpdateNoteUseCase {
  constructor(private readonly noteRepo: INoteRepository) {}

  async execute(input: UpdateNoteInput): Promise<NoteEntity> {
    const { noteId, userId, userRole, data } = input;

    const existing = await this.noteRepo.findById(noteId);
    if (!existing) {
      throw new NoteNotFoundError("Note not found");
    }

    if (userRole === "TEACHER") {
      const teacherProfileId = await this.noteRepo.getTeacherProfileIdByUserId(userId);
      if (!teacherProfileId || teacherProfileId !== existing.teacherProfileId) {
        throw new NoteAccessDeniedError("You can only modify notes you have uploaded");
      }
    } else if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      throw new NoteAccessDeniedError("You do not have permission to modify notes");
    }

    if (data.name !== undefined && !data.name.trim()) {
      throw new NoteValidationError("Note name cannot be empty");
    }

    let fileExtension = data.fileExtension;
    if (data.fileUrl && !fileExtension) {
      const match = data.fileUrl.split("?")[0].split(".").pop();
      if (match) fileExtension = match.toLowerCase();
    }

    return this.noteRepo.update(noteId, {
      ...data,
      name: data.name !== undefined ? data.name.trim() : undefined,
      description: data.description !== undefined ? (data.description ? data.description.trim() : null) : undefined,
      fileExtension: fileExtension || undefined,
    });
  }
}
