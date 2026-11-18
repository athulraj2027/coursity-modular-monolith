import {
  ILectureQueryRepository,
  ITeacherLectureRepository,
} from "../../domain/repositories/lecture.repository";
import {
  LectureAccessDeniedError,
  LectureNotFoundError,
} from "../../domain/errors/lecture.errors";

export type TeacherDeleteLectureRepository = ILectureQueryRepository & ITeacherLectureRepository;

export class TeacherDeleteLectureUseCase {
  constructor(private readonly lectureRepo: TeacherDeleteLectureRepository) {}

  async execute(teacherProfileId: string, lectureId: string): Promise<boolean> {
    const lecture = await this.lectureRepo.findById(lectureId);
    if (!lecture) {
      throw new LectureNotFoundError("Lecture not found.");
    }

    if (lecture.teacherId !== teacherProfileId) {
      throw new LectureAccessDeniedError("You do not have permission to delete this lecture.");
    }

    return this.lectureRepo.softDeleteLecture(lectureId);
  }
}
