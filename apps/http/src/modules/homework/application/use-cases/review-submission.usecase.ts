import {
  IHomeworkQueryRepository,
  IHomeworkSubmissionRepository,
  IHomeworkReviewRepository,
  IHomeworkContextRepository,
} from "../../domain/repositories/homework.repository";
import { ReviewSubmissionDTO } from "../../domain/dtos/homework.dto";
import { HomeworkSubmissionEntity } from "../../domain/entities/homework.entity";
import {
  SubmissionNotFoundError,
  HomeworkAccessDeniedError,
} from "../../domain/errors/homework.errors";
import { HomeworkGradingPolicy } from "../../domain/policies/homework-grading.policy";

export interface ReviewSubmissionInput {
  submissionId: string;
  userId: string;
  userRole: string;
  data: ReviewSubmissionDTO;
}

export type ReviewSubmissionRepository = IHomeworkQueryRepository &
  IHomeworkSubmissionRepository &
  IHomeworkReviewRepository &
  IHomeworkContextRepository;

export class ReviewSubmissionUseCase {
  constructor(private readonly homeworkRepo: ReviewSubmissionRepository) {}

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

    // 3. Domain policy validation & sanitization
    const sanitizedData = HomeworkGradingPolicy.sanitizeReviewData(data, homework.maxScore);

    return this.homeworkRepo.reviewSubmission(submissionId, teacherProfileId, sanitizedData);
  }
}
