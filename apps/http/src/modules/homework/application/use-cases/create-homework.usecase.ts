import { IHomeworkRepository } from "../../domain/repositories/homework.repository";
import { CreateHomeworkDTO } from "../../domain/dtos/homework.dto";
import { HomeworkEntity } from "../../domain/entities/homework.entity";
import {
  HomeworkValidationError,
  HomeworkAccessDeniedError,
  HomeworkNotFoundError,
} from "../../domain/errors/homework.errors";

export interface CreateHomeworkInput {
  userId: string;
  userRole: string;
  data: CreateHomeworkDTO;
}

export class CreateHomeworkUseCase {
  constructor(private readonly homeworkRepo: IHomeworkRepository) {}

  async execute(input: CreateHomeworkInput): Promise<HomeworkEntity> {
    const { userId, userRole, data } = input;

    if (!data.title || !data.title.trim()) {
      throw new HomeworkValidationError("Homework title is required");
    }

    if (!data.lectureId) {
      throw new HomeworkValidationError("Lecture ID is required to associate homework");
    }

    // Must provide at least one task payload (text content, external link, attachment, or description)
    if (
      !data.description?.trim() &&
      !data.taskContent?.trim() &&
      !data.taskUrl?.trim() &&
      !data.attachmentUrl?.trim()
    ) {
      throw new HomeworkValidationError(
        "Please provide instructions, text task, external link, or an attachment file for this homework"
      );
    }

    // 1. Verify lecture exists and fetch course & teacherProfile info
    const lectureInfo = await this.homeworkRepo.findLectureWithCourse(data.lectureId);
    if (!lectureInfo) {
      throw new HomeworkNotFoundError("Associated lecture not found");
    }

    // 2. Resolve teacher profile ID
    let teacherProfileId = lectureInfo.teacherProfileId;

    if (userRole === "TEACHER") {
      const userTeacherProfileId = await this.homeworkRepo.getTeacherProfileIdByUserId(userId);
      if (!userTeacherProfileId || userTeacherProfileId !== lectureInfo.teacherProfileId) {
        throw new HomeworkAccessDeniedError("You can only assign homework to lectures of courses you instruct");
      }
      teacherProfileId = userTeacherProfileId;
    } else if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      throw new HomeworkAccessDeniedError("Only instructors and administrators can create homework");
    }

    // Parse dueDate if provided
    let parsedDueDate: Date | null = null;
    if (data.dueDate) {
      const d = new Date(data.dueDate);
      if (!isNaN(d.getTime())) {
        parsedDueDate = d;
      }
    }

    return this.homeworkRepo.create(lectureInfo.courseId, teacherProfileId, {
      ...data,
      title: data.title.trim(),
      description: data.description ? data.description.trim() : null,
      taskContent: data.taskContent ? data.taskContent.trim() : null,
      taskUrl: data.taskUrl ? data.taskUrl.trim() : null,
      dueDate: parsedDueDate,
      maxScore: typeof data.maxScore === "number" ? Math.max(0, data.maxScore) : 100,
    });
  }
}
