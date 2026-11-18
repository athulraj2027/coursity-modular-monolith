import {
  IHomeworkQueryRepository,
  IHomeworkSubmissionRepository,
  IHomeworkContextRepository,
} from "../../domain/repositories/homework.repository";
import { SubmitHomeworkDTO } from "../../domain/dtos/homework.dto";
import { HomeworkSubmissionEntity } from "../../domain/entities/homework.entity";
import {
  HomeworkNotFoundError,
  HomeworkAccessDeniedError,
  HomeworkValidationError,
} from "../../domain/errors/homework.errors";
import { HomeworkSubmissionPolicy } from "../../domain/policies/homework-submission.policy";

export interface SubmitHomeworkInput {
  homeworkId: string;
  studentId: string;
  userRole: string;
  data: SubmitHomeworkDTO;
}

export type SubmitHomeworkRepository = IHomeworkQueryRepository &
  IHomeworkSubmissionRepository &
  IHomeworkContextRepository;

export class SubmitHomeworkUseCase {
  constructor(private readonly homeworkRepo: SubmitHomeworkRepository) {}

  async execute(input: SubmitHomeworkInput): Promise<HomeworkSubmissionEntity> {
    const { homeworkId, studentId, userRole, data } = input;

    // 1. Verify homework exists and is published
    const homework = await this.homeworkRepo.findById(homeworkId, false);
    if (!homework || homework.isDeleted || !homework.isPublished) {
      throw new HomeworkNotFoundError("Homework assignment not found or is unavailable");
    }

    // 2. Verify student is enrolled in course
    const isEnrolled = await this.homeworkRepo.isStudentEnrolled(studentId, homework.courseId);
    if (!isEnrolled && userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      throw new HomeworkAccessDeniedError("You must be enrolled in this course to submit homework");
    }

    // 3. Domain policy validation for payload
    HomeworkSubmissionPolicy.validateSubmissionPayload(data);

    // 4. Check existing submission to enforce state machine rules (no overwrite of VERIFIED)
    const existing = await this.homeworkRepo.findSubmission(homeworkId, studentId);
    const resubmitCheck = HomeworkSubmissionPolicy.canResubmit(existing);
    if (!resubmitCheck.allowed) {
      throw new HomeworkValidationError(resubmitCheck.reason);
    }

    // 5. Calculate if late via domain policy
    const isLate = HomeworkSubmissionPolicy.isLate(homework.dueDate);

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
