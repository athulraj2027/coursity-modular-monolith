import { ILectureRepository } from "../../domain/repositories/lecture.repository";
import { UpdateLectureDTO } from "../../domain/dtos/lecture.dto";
import { LectureEntity } from "../../domain/entities/lecture.entity";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "@/app/errors";

export class TeacherUpdateLectureUseCase {
  constructor(private readonly lectureRepo: ILectureRepository) {}

  async execute(
    teacherProfileId: string,
    lectureId: string,
    dto: UpdateLectureDTO
  ): Promise<LectureEntity> {
    const lecture = await this.lectureRepo.findById(lectureId);
    if (!lecture) {
      throw new NotFoundError("Lecture not found.");
    }

    if (lecture.teacherId !== teacherProfileId) {
      throw new ForbiddenError("You do not have permission to modify this lecture.");
    }

    if (dto.title !== undefined && !dto.title.trim()) {
      throw new BadRequestError("Lecture name cannot be empty.");
    }

    const newScheduledAt = dto.scheduledAt !== undefined ? dto.scheduledAt : lecture.scheduledAt;
    const newDurationSeconds =
      dto.durationSeconds !== undefined && dto.durationSeconds > 0
        ? dto.durationSeconds
        : lecture.durationSeconds || 3600;

    let scheduledDate: Date | null = null;

    if (newScheduledAt) {
      scheduledDate = new Date(newScheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        throw new BadRequestError("Invalid start time date format.");
      }

      const endTime = new Date(scheduledDate.getTime() + newDurationSeconds * 1000);

      // Check for overlapping/conflicting lectures (excluding current lectureId)
      const conflicting = await this.lectureRepo.findConflictingLecture(
        teacherProfileId,
        scheduledDate,
        endTime,
        lectureId
      );

      if (conflicting) {
        const conflictStart = conflicting.scheduledAt
          ? new Date(conflicting.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "TBD";
        const conflictEnd = conflicting.scheduledAt
          ? new Date(new Date(conflicting.scheduledAt).getTime() + conflicting.durationSeconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "TBD";
        const conflictDate = conflicting.scheduledAt
          ? new Date(conflicting.scheduledAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
          : "";

        throw new ConflictError(
          `Schedule conflict: You already have another lecture "${conflicting.title}" scheduled on ${conflictDate} from ${conflictStart} to ${conflictEnd} (${Math.round(conflicting.durationSeconds / 60)} mins). Live lectures cannot overlap.`
        );
      }
    }

    return this.lectureRepo.updateLecture(lectureId, {
      ...dto,
      title: dto.title !== undefined ? dto.title.trim() : undefined,
      description: dto.description !== undefined ? (dto.description?.trim() || null) : undefined,
      scheduledAt: dto.scheduledAt !== undefined ? scheduledDate : undefined,
      durationSeconds: dto.durationSeconds !== undefined ? newDurationSeconds : undefined,
    });
  }
}
