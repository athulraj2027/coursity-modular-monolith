import { IHomeworkRepository } from "../../domain/repositories/homework.repository";
import { ReviewSubmissionDTO } from "../../domain/dtos/homework.dto";
import { HomeworkSubmissionEntity } from "../../domain/entities/homework.entity";
import {
  SubmissionNotFoundError,
  HomeworkAccessDeniedError,
  HomeworkValidationError,
} from "../../domain/errors/homework.errors";

export interface ReviewSubmissionInput {
  submissionId: string;
  userId: string;
  userRole: string;
  data: ReviewSubmissionDTO;
}

export class ReviewSubmissionUseCase {
  constructor(private readonly homeworkRepo: IHomeworkRepository) {}

  async execute(input: ReviewSubmissionInput): Promise<HomeworkSubmissionEntity> {
    const { submissionId, userId, userRole, data } = input;

    // 1. Fetch submission with homework relation info
    const submission = await this.homeworkRepo.findSubmissionById(submissionId);
    if (!submission) {
      throw new SubmissionNotFoundError("Submission not found");
    }

    // 2. Fetch homework to verify teacher ownership
    const homework = await this.homeworkRepo.findById(submission.homeworkId, true);
    if (!homework) {
      throw new SubmissionNotFoundError("Associated homework not found");
    }

    let teacherProfileId = homework.teacherProfileId;
    if (userRole === "TEACHER") {
      const userTeacherProfileId = await this.homeworkRepo.getTeacherProfileIdByUserId(userId);
      if (!userTeacherProfileId || userTeacherProfileId !== homework.teacherProfileId) {
        throw new HomeworkAccessDeniedError("You can only review submissions for your own assignments");
      }
      teacherProfileId = userTeacherProfileId;
    } else if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      throw new HomeworkAccessDeniedError("Only teachers and administrators can review homework submissions");
    }

    // 3. Validation
    if (data.verificationStatus !== "VERIFIED" && data.verificationStatus !== "REDO") {
      throw new HomeworkValidationError("Verification status must be either 'VERIFIED' or 'REDO'");
    }

    if (data.score !== undefined && data.score !== null) {
      if (typeof data.score !== "number" || isNaN(data.score) || data.score < 0) {
        throw new HomeworkValidationError("Score must be a positive number");
      }
      if (homework.maxScore && data.score > homework.maxScore) {
        throw new HomeworkValidationError(`Score cannot exceed maximum score (${homework.maxScore})`);
      }
    }

    return this.homeworkRepo.reviewSubmission(submissionId, teacherProfileId, {
      verificationStatus: data.verificationStatus,
      feedback: data.feedback ? data.feedback.trim() : null,
      score: data.score !== undefined ? data.score : null,
    });
  }
}
