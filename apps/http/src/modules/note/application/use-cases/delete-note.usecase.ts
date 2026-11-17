import {
  INoteQueryRepository,
  ITeacherNoteRepository,
} from "../../domain/repositories/note.repository";
import {
  NoteNotFoundError,
  NoteAccessDeniedError,
} from "../../domain/errors/note.errors";
import { NoteAccessPolicy } from "../../domain/policies";
import { ITeacherProfileResolver } from "@/modules/course/domain/services/teacher-profile-resolver.service";

export type NoteDeleteRepository = INoteQueryRepository & ITeacherNoteRepository;

export interface DeleteNoteInput {
  noteId: string;
  userId: string;
  userRole: string;
  teacherProfileId?: string | null;
}

export class DeleteNoteUseCase {
  constructor(
    private readonly noteRepo: NoteDeleteRepository,
    private readonly profileResolver?: ITeacherProfileResolver
  ) {}

  async execute(input: DeleteNoteInput): Promise<boolean> {
    const { noteId, userId, userRole } = input;

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
        throw new NoteAccessDeniedError("You can only delete notes you have created");
      }
      throw new NoteAccessDeniedError("You do not have permission to delete notes");
    }

    return this.noteRepo.softDelete(noteId);
  }
}
