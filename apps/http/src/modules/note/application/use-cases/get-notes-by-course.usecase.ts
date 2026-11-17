import {
  INoteQueryRepository,
  IStudentNoteAccessRepository,
} from "../../domain/repositories/note.repository";
import { NoteEntity } from "../../domain/entities/note.entity";
import { NoteAccessDeniedError } from "../../domain/errors/note.errors";
import { ITeacherProfileResolver } from "@/modules/course/domain/services/teacher-profile-resolver.service";

export type NotesByCourseRepository = INoteQueryRepository & IStudentNoteAccessRepository;

export interface GetNotesByCourseInput {
  courseId: string;
  userId: string;
  userRole: string;
  teacherProfileId?: string | null;
}

export class GetNotesByCourseUseCase {
  constructor(
    private readonly noteRepo: NotesByCourseRepository,
    private readonly profileResolver?: ITeacherProfileResolver
  ) {}

  async execute(input: GetNotesByCourseInput): Promise<NoteEntity[]> {
    const { courseId, userId, userRole } = input;

    if (userRole === "ADMIN" || userRole === "SUPERADMIN") {
      // Admins have access
    } else if (userRole === "TEACHER") {
      let teacherProfileId = input.teacherProfileId;
      if (teacherProfileId === undefined) {
        if (this.profileResolver) {
          teacherProfileId = await this.profileResolver.getTeacherProfileIdByUserId(userId);
        } else if (typeof (this.noteRepo as any).getTeacherProfileIdByUserId === "function") {
          teacherProfileId = await (this.noteRepo as any).getTeacherProfileIdByUserId(userId);
        }
      }
      const isEnrolled = await this.noteRepo.isStudentEnrolled(userId, courseId);
      if (!isEnrolled && !teacherProfileId) {
        throw new NoteAccessDeniedError("You do not have access to notes for this course");
      }
    } else if (userRole === "STUDENT") {
      const isEnrolled = await this.noteRepo.isStudentEnrolled(userId, courseId);
      if (!isEnrolled) {
        throw new NoteAccessDeniedError("You must be enrolled in this course to access course notes");
      }
    }

    return this.noteRepo.findByCourseId(courseId);
  }
}
