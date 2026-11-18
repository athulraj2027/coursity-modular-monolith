import {
  INoteQueryRepository,
  IStudentNoteAccessRepository,
} from "../../domain/repositories/note.repository";
import { NoteEntity } from "../../domain/entities/note.entity";
import {
  NoteNotFoundError,
  NoteAccessDeniedError,
} from "../../domain/errors/note.errors";
import { ITeacherProfileResolver } from "@/modules/course/domain/services/teacher-profile-resolver.service";

export type NoteDetailRepository = INoteQueryRepository & IStudentNoteAccessRepository;

export interface GetNoteDetailInput {
  noteId: string;
  userId: string;
  userRole: string;
  teacherProfileId?: string | null;
}

export class GetNoteDetailUseCase {
  constructor(
    private readonly noteRepo: NoteDetailRepository,
    private readonly profileResolver?: ITeacherProfileResolver
  ) {}

  async execute(input: GetNoteDetailInput): Promise<NoteEntity> {
    const { noteId, userId, userRole } = input;

    const note = await this.noteRepo.findById(noteId);
    if (!note || note.isDeleted) {
      throw new NoteNotFoundError("Note not found");
    }

    if (userRole === "ADMIN" || userRole === "SUPERADMIN") {
      return note;
    }

    if (userRole === "TEACHER") {
      let teacherProfileId = input.teacherProfileId;
      if (teacherProfileId === undefined) {
        if (this.profileResolver) {
          teacherProfileId = await this.profileResolver.getTeacherProfileIdByUserId(userId);
        } else if (typeof (this.noteRepo as any).getTeacherProfileIdByUserId === "function") {
          teacherProfileId = await (this.noteRepo as any).getTeacherProfileIdByUserId(userId);
        }
      }

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
