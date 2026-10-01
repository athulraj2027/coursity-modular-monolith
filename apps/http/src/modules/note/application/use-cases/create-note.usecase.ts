import { INoteRepository } from "../../domain/repositories/note.repository";
import { CreateNoteDTO } from "../../domain/dtos/note.dto";
import { NoteEntity } from "../../domain/entities/note.entity";
import { NoteValidationError, NoteAccessDeniedError, NoteNotFoundError } from "../../domain/errors/note.errors";

export interface CreateNoteInput {
  userId: string;
  userRole: string;
  data: CreateNoteDTO;
}

export class CreateNoteUseCase {
  constructor(private readonly noteRepo: INoteRepository) {}

  async execute(input: CreateNoteInput): Promise<NoteEntity> {
    const { userId, userRole, data } = input;

    if (!data.name || !data.name.trim()) {
      throw new NoteValidationError("Note name is required");
    }

    if (!data.fileUrl || !data.fileKey) {
      throw new NoteValidationError("File URL and file storage key are required");
    }

    if (!data.lectureId) {
      throw new NoteValidationError("Lecture ID is required to associate note");
    }

    // 1. Verify lecture exists and fetch course & teacherProfile info
    const lectureInfo = await this.noteRepo.findLectureWithCourse(data.lectureId);
    if (!lectureInfo) {
      throw new NoteNotFoundError("Associated lecture not found");
    }

    // 2. Resolve teacher profile ID
    let teacherProfileId = lectureInfo.teacherProfileId;

    if (userRole === "TEACHER") {
      const userTeacherProfileId = await this.noteRepo.getTeacherProfileIdByUserId(userId);
      if (!userTeacherProfileId || userTeacherProfileId !== lectureInfo.teacherProfileId) {
        throw new NoteAccessDeniedError("You can only add notes to lectures of courses you instruct");
      }
      teacherProfileId = userTeacherProfileId;
    } else if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      throw new NoteAccessDeniedError("Only instructors and administrators can upload notes");
    }

    // 3. Extract file extension if not explicitly supplied
    let fileExtension = data.fileExtension;
    if (!fileExtension && data.fileUrl) {
      const match = data.fileUrl.split("?")[0].split(".").pop();
      if (match) fileExtension = match.toLowerCase();
    }

    return this.noteRepo.create(lectureInfo.courseId, teacherProfileId, {
      ...data,
      name: data.name.trim(),
      description: data.description ? data.description.trim() : null,
      fileExtension,
    });
  }
}
