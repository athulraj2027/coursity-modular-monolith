import {
  INoteQueryRepository,
  ITeacherNoteRepository,
} from "../../domain/repositories/note.repository";
import { UpdateNoteDTO } from "../../domain/dtos/note.dto";
import { NoteEntity } from "../../domain/entities/note.entity";
import {
  NoteNotFoundError,
  NoteAccessDeniedError,
} from "../../domain/errors/note.errors";
import {
  NoteValidationPolicy,
  NoteAccessPolicy,
} from "../../domain/policies";
import { ITeacherProfileResolver } from "@/modules/course/domain/services/teacher-profile-resolver.service";

export type NoteUpdateRepository = INoteQueryRepository & ITeacherNoteRepository;

export interface UpdateNoteInput {
  noteId: string;
  userId: string;
  userRole: string;
  data: UpdateNoteDTO;
  teacherProfileId?: string | null;
}

export class UpdateNoteUseCase {
  constructor(
    private readonly noteRepo: NoteUpdateRepository,
    private readonly profileResolver?: ITeacherProfileResolver
  ) {}

  async execute(input: UpdateNoteInput): Promise<NoteEntity> {
    const { noteId, userId, userRole, data } = input;

    const existing = await this.noteRepo.findById(noteId);
    if (!existing) {
      throw new NoteNotFoundError("Note not found");
    }

    let teacherProfileId = input.teacherProfileId;
    if (teacherProfileId === undefined && userRole === "TEACHER") {
      if (this.profileResolver) {
        teacherProfileId = await this.profileResolver.getTeacherProfileIdByUserId(userId);
      } else if (typeof (this.noteRepo as any).getTeacherProfileIdByUserId === "function") {
        teacherProfileId = await (this.noteRepo as any).getTeacherProfileIdByUserId(userId);
      }
    }

    if (!NoteAccessPolicy.canModifyNote(userRole, teacherProfileId || null, existing.teacherProfileId)) {
      if (userRole === "TEACHER") {
        throw new NoteAccessDeniedError("You can only modify notes you have uploaded");
      }
      throw new NoteAccessDeniedError("You do not have permission to modify notes");
    }

    const { normalizedExtension } = NoteValidationPolicy.validateUpdate(data);

    return this.noteRepo.update(noteId, {
      ...data,
      name: data.name !== undefined ? data.name.trim() : undefined,
      description:
        data.description !== undefined
          ? data.description ? data.description.trim() : null
          : undefined,
      fileExtension:
        normalizedExtension !== undefined ? (normalizedExtension || null) : data.fileExtension,
    });
  }
}
