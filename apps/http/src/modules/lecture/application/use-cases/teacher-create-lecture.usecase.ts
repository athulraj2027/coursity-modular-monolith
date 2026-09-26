import { ILectureRepository } from "../../domain/repositories/lecture.repository";
import { CreateLectureDTO } from "../../domain/dtos/lecture.dto";
import { LectureEntity } from "../../domain/entities/lecture.entity";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "@/app/errors";

export class TeacherCreateLectureUseCase {
  constructor(private readonly lectureRepo: ILectureRepository) {}

  async execute(teacherProfileId: string, dto: CreateLectureDTO): Promise<LectureEntity> {
    if (!dto.courseId) {
      throw new BadRequestError("Course ID is required to create a lecture.");
    }

    if (!dto.title || !dto.title.trim()) {
      throw new BadRequestError("Lecture name/title is required.");
    }

    const courseInfo = await this.lectureRepo.findCourseWithDefaultModule(dto.courseId);
    if (!courseInfo) {
      throw new NotFoundError("Associated course not found.");
    }

    if (courseInfo.teacherProfileId !== teacherProfileId) {
      throw new ForbiddenError("You do not have permission to add lectures to this course.");
    }

    const targetModuleId = dto.moduleId || courseInfo.defaultModuleId;
    const durationSeconds = dto.durationSeconds && dto.durationSeconds > 0 ? dto.durationSeconds : 3600;
    let scheduledDate: Date | null = null;

    if (dto.scheduledAt) {
      scheduledDate = new Date(dto.scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        throw new BadRequestError("Invalid start time date format.");
      }

      // Allow 5 minutes leeway for clock drift
      if (scheduledDate.getTime() < Date.now() - 5 * 60 * 1000) {
        throw new BadRequestError("Lecture start time cannot be in the past.");
      }

      const endTime = new Date(scheduledDate.getTime() + durationSeconds * 1000);

      // Check for overlapping/conflicting lectures
      const conflicting = await this.lectureRepo.findConflictingLecture(
        teacherProfileId,
        scheduledDate,
        endTime
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

    return this.lectureRepo.createLecture(dto.courseId, targetModuleId, {
      ...dto,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      scheduledAt: scheduledDate,
      durationSeconds,
    });
  }
}
