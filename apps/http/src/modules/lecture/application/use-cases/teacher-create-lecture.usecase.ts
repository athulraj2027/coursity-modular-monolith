import { ITeacherLectureRepository } from "../../domain/repositories/lecture.repository";
import { CreateLectureDTO } from "../../domain/dtos/lecture.dto";
import { LectureEntity } from "../../domain/entities/lecture.entity";
import {
  LectureAccessDeniedError,
  LectureNotFoundError,
} from "../../domain/errors/lecture.errors";
import {
  LectureSchedulePolicy,
  LectureValidationPolicy,
} from "../../domain/policies";

export class TeacherCreateLectureUseCase {
  constructor(private readonly lectureRepo: ITeacherLectureRepository) {}

  async execute(teacherProfileId: string, dto: CreateLectureDTO): Promise<LectureEntity> {
    // 1. Domain Validation Policy
    LectureValidationPolicy.validateCreation(dto);

    // 2. Fetch course & default module context
    const courseInfo = await this.lectureRepo.findCourseWithDefaultModule(dto.courseId);
    if (!courseInfo) {
      throw new LectureNotFoundError("Associated course not found.");
    }

    // 3. Verify instructor ownership
    if (courseInfo.teacherProfileId !== teacherProfileId) {
      throw new LectureAccessDeniedError("You do not have permission to add lectures to this course.");
    }

    const targetModuleId = dto.moduleId || courseInfo.defaultModuleId;
    const durationSeconds = LectureValidationPolicy.normalizeDuration(dto.durationSeconds);
    let scheduledDate: Date | null = null;

    if (dto.scheduledAt) {
      // 4. Domain Scheduling Policy
      scheduledDate = LectureSchedulePolicy.validateScheduledTime({
        scheduledAt: dto.scheduledAt,
        courseStartingDate: courseInfo.startingDate,
      });

      if (scheduledDate) {
        const endTime = LectureSchedulePolicy.calculateEndTime(scheduledDate, durationSeconds);

        // 5. Conflict detection
        const conflicting = await this.lectureRepo.findConflictingLecture(
          teacherProfileId,
          scheduledDate,
          endTime
        );

        if (conflicting) {
          throw LectureSchedulePolicy.buildConflictError(conflicting);
        }
      }
    }

    return this.lectureRepo.createLecture(dto.courseId, targetModuleId, {
      ...dto,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      scheduledAt: scheduledDate,
      durationSeconds,
    });
  }
}
