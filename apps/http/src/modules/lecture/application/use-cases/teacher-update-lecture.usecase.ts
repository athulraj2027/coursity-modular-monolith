import {
  ILectureQueryRepository,
  ITeacherLectureRepository,
} from "../../domain/repositories/lecture.repository";
import { UpdateLectureDTO } from "../../domain/dtos/lecture.dto";
import { LectureEntity } from "../../domain/entities/lecture.entity";
import {
  LectureAccessDeniedError,
  LectureNotFoundError,
} from "../../domain/errors/lecture.errors";
import {
  LectureSchedulePolicy,
  LectureValidationPolicy,
} from "../../domain/policies";

export type TeacherUpdateLectureRepository = ILectureQueryRepository & ITeacherLectureRepository;

export class TeacherUpdateLectureUseCase {
  constructor(private readonly lectureRepo: TeacherUpdateLectureRepository) {}

  async execute(
    teacherProfileId: string,
    lectureId: string,
    dto: UpdateLectureDTO
  ): Promise<LectureEntity> {
    const lecture = await this.lectureRepo.findById(lectureId);
    if (!lecture) {
      throw new LectureNotFoundError("Lecture not found.");
    }

    if (lecture.teacherId !== teacherProfileId) {
      throw new LectureAccessDeniedError("You do not have permission to modify this lecture.");
    }

    // 1. Domain Validation Policy
    LectureValidationPolicy.validateUpdate(dto);

    const newScheduledAt = dto.scheduledAt !== undefined ? dto.scheduledAt : lecture.scheduledAt;
    const newDurationSeconds = LectureValidationPolicy.normalizeDuration(
      dto.durationSeconds,
      lecture.durationSeconds || 3600
    );

    let scheduledDate: Date | null = null;

    if (newScheduledAt) {
      // 2. Domain Scheduling Policy
      scheduledDate = LectureSchedulePolicy.validateScheduledTime({
        scheduledAt: newScheduledAt,
        courseStartingDate: dto.scheduledAt !== undefined ? lecture.courseStartingDate : null,
        isUpdating: true,
      });

      if (scheduledDate) {
        const endTime = LectureSchedulePolicy.calculateEndTime(scheduledDate, newDurationSeconds);

        // 3. Conflict detection (excluding current lecture)
        const conflicting = await this.lectureRepo.findConflictingLecture(
          teacherProfileId,
          scheduledDate,
          endTime,
          lectureId
        );

        if (conflicting) {
          throw LectureSchedulePolicy.buildConflictError(conflicting);
        }
      }
    }

    return this.lectureRepo.updateLecture(lectureId, {
      ...dto,
      title: dto.title !== undefined ? dto.title.trim() : undefined,
      description: dto.description !== undefined ? (dto.description?.trim() || null) : undefined,
      scheduledAt: scheduledDate,
      durationSeconds: newDurationSeconds,
    });
  }
}
