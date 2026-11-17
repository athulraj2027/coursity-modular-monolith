import { ITeacherNoteRepository } from "../../domain/repositories/note.repository";
import { CreateNoteDTO } from "../../domain/dtos/note.dto";
import { NoteEntity } from "../../domain/entities/note.entity";
import {
  NoteValidationError,
  NoteAccessDeniedError,
  NoteNotFoundError,
} from "../../domain/errors/note.errors";
import {
  NoteValidationPolicy,
  NoteAccessPolicy,
} from "../../domain/policies";
import { ITeacherProfileResolver } from "@/modules/course/domain/services/teacher-profile-resolver.service";

export interface CreateNoteInput {
  userId: string;
  userRole: string;
  data: CreateNoteDTO;
  teacherProfileId?: string | null;
}

export class CreateNoteUseCase {
  constructor(
    private readonly noteRepo: ITeacherNoteRepository,
    private readonly profileResolver?: ITeacherProfileResolver
  ) {}

  async execute(input: CreateNoteInput): Promise<NoteEntity> {
    const { userId, userRole, data } = input;

    // 1. Role permission guard
    if (!NoteAccessPolicy.canUploadNote(userRole)) {
      throw new NoteAccessDeniedError("Only instructors and administrators can upload notes");
    }

    // 2. Domain Validation Policy
    const { normalizedExtension } = NoteValidationPolicy.validateCreation(data);

    // 3. Verify lecture exists and fetch course & teacherProfile info
    const lectureInfo = await this.noteRepo.findLectureWithCourse(data.lectureId);
    if (!lectureInfo) {
      throw new NoteNotFoundError("Associated lecture not found");
    }

    // 4. Resolve teacher profile ID
    let teacherProfileId = input.teacherProfileId;
    if (teacherProfileId === undefined) {
      if (this.profileResolver) {
        teacherProfileId = await this.profileResolver.getTeacherProfileIdByUserId(userId);
      } else if (typeof (this.noteRepo as any).getTeacherProfileIdByUserId === "function") {
        teacherProfileId = await (this.noteRepo as any).getTeacherProfileIdByUserId(userId);
      }
    }

    if (userRole === "TEACHER") {
      if (!NoteAccessPolicy.isTeacherAuthorizedForLecture(teacherProfileId || null, lectureInfo.teacherProfileId)) {
        throw new NoteAccessDeniedError("You can only add notes to lectures of courses you instruct");
      }
    }

    const assignedTeacherProfileId =
      userRole === "TEACHER" && teacherProfileId
        ? teacherProfileId
        : lectureInfo.teacherProfileId;

    return this.noteRepo.create(lectureInfo.courseId, assignedTeacherProfileId, {
      ...data,
      name: data.name.trim(),
      description: data.description ? data.description.trim() : null,
      fileExtension: normalizedExtension || data.fileExtension || null,
    });
  }
}
