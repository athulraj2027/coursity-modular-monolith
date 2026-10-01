import { INoteRepository } from "../../domain/repositories/note.repository";
import { NoteEntity } from "../../domain/entities/note.entity";
import { NoteNotFoundError, NoteAccessDeniedError } from "../../domain/errors/note.errors";

export interface GetNotesByLectureInput {
  lectureId: string;
  userId: string;
  userRole: string;
}

export class GetNotesByLectureUseCase {
  constructor(private readonly noteRepo: INoteRepository) {}

  async execute(input: GetNotesByLectureInput): Promise<NoteEntity[]> {
    const { lectureId, userId, userRole } = input;

    // 1. Verify lecture exists
    const lectureInfo = await this.noteRepo.findLectureWithCourse(lectureId);
    if (!lectureInfo) {
      throw new NoteNotFoundError("Lecture not found");
    }

    // 2. Authorization guard
    if (userRole === "ADMIN" || userRole === "SUPERADMIN") {
      // Admins have full read access
    } else if (userRole === "TEACHER") {
      const teacherProfileId = await this.noteRepo.getTeacherProfileIdByUserId(userId);
      if (teacherProfileId !== lectureInfo.teacherProfileId) {
        // If teacher is not the author, check if they are enrolled as a student or deny
        const isEnrolled = await this.noteRepo.isStudentEnrolled(userId, lectureInfo.courseId);
        if (!isEnrolled) {
          throw new NoteAccessDeniedError("You do not have access to notes for this lecture");
        }
      }
    } else if (userRole === "STUDENT") {
      const isEnrolled = await this.noteRepo.isStudentEnrolled(userId, lectureInfo.courseId);
      if (!isEnrolled) {
        throw new NoteAccessDeniedError("You must be enrolled in this course to access lecture notes");
      }
    } else {
      throw new NoteAccessDeniedError("Unauthorized to view notes");
    }

    return this.noteRepo.findByLectureId(lectureId);
  }
}
