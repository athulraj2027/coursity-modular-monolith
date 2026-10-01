import { INoteRepository } from "../../domain/repositories/note.repository";
import { NoteEntity } from "../../domain/entities/note.entity";
import { NoteAccessDeniedError } from "../../domain/errors/note.errors";

export interface GetNotesByCourseInput {
  courseId: string;
  userId: string;
  userRole: string;
}

export class GetNotesByCourseUseCase {
  constructor(private readonly noteRepo: INoteRepository) {}

  async execute(input: GetNotesByCourseInput): Promise<NoteEntity[]> {
    const { courseId, userId, userRole } = input;

    if (userRole === "ADMIN" || userRole === "SUPERADMIN") {
      // Admins have access
    } else if (userRole === "TEACHER") {
      const teacherProfileId = await this.noteRepo.getTeacherProfileIdByUserId(userId);
      const isEnrolled = await this.noteRepo.isStudentEnrolled(userId, courseId);
      // If not enrolled and we don't know if they own the course, fetch and verify
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
