import { IHomeworkRepository } from "../../domain/repositories/homework.repository";
import { SubmitHomeworkDTO } from "../../domain/dtos/homework.dto";
import { HomeworkSubmissionEntity } from "../../domain/entities/homework.entity";
import {
  HomeworkNotFoundError,
  HomeworkAccessDeniedError,
  HomeworkValidationError,
} from "../../domain/errors/homework.errors";

export interface SubmitHomeworkInput {
  homeworkId: string;
  studentId: string;
  userRole: string;
  data: SubmitHomeworkDTO;
}

export class SubmitHomeworkUseCase {
  constructor(private readonly homeworkRepo: IHomeworkRepository) {}

  async execute(input: SubmitHomeworkInput): Promise<HomeworkSubmissionEntity> {
    const { homeworkId, studentId, userRole, data } = input;

    // 1. Verify homework exists
    const homework = await this.homeworkRepo.findById(homeworkId, false);
    if (!homework || homework.isDeleted || !homework.isPublished) {
      throw new HomeworkNotFoundError("Homework assignment not found or is unavailable");
    }

    // 2. Verify student is enrolled in course
    const isEnrolled = await this.homeworkRepo.isStudentEnrolled(studentId, homework.courseId);
    if (!isEnrolled && userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      throw new HomeworkAccessDeniedError("You must be enrolled in this course to submit homework");
    }

    // 3. Validate that student provided at least one form of response
    const hasText = Boolean(data.submissionText && data.submissionText.trim().length > 0);
    const hasUrl = Boolean(data.submissionUrl && data.submissionUrl.trim().length > 0);
    const hasFile = Boolean(data.fileUrl && data.fileUrl.trim().length > 0);

    if (!hasText && !hasUrl && !hasFile) {
      throw new HomeworkValidationError(
        "Please provide a written response, a link (GitHub / Figma / Colab), or upload a submission file"
      );
    }

    // 4. Calculate if late
    let isLate = false;
    if (homework.dueDate) {
      const now = new Date();
      if (now.getTime() > new Date(homework.dueDate).getTime()) {
        isLate = true;
      }
    }

    return this.homeworkRepo.createOrUpdateSubmission(
      homeworkId,
      studentId,
      {
        ...data,
        submissionText: data.submissionText ? data.submissionText.trim() : null,
        submissionUrl: data.submissionUrl ? data.submissionUrl.trim() : null,
      },
      isLate
    );
  }
}
