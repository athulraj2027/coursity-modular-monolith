import { ReviewSubmissionDTO } from "../dtos/homework.dto";
import { HomeworkValidationError } from "../errors/homework.errors";

export class HomeworkGradingPolicy {
  /**
   * Validates instructor review payload, verification status, and score bounds
   */
  static validateReview(data: ReviewSubmissionDTO, maxScore: number = 100): void {
    if (data.verificationStatus !== "VERIFIED" && data.verificationStatus !== "REDO") {
      throw new HomeworkValidationError("Verification status must be either 'VERIFIED' or 'REDO'");
    }

    if (data.score !== undefined && data.score !== null) {
      if (typeof data.score !== "number" || isNaN(data.score) || data.score < 0) {
        throw new HomeworkValidationError("Score must be a non-negative number");
      }

      if (maxScore !== undefined && maxScore !== null && maxScore > 0 && data.score > maxScore) {
        throw new HomeworkValidationError(`Score cannot exceed maximum score (${maxScore})`);
      }
    }
  }

  /**
   * Sanitizes feedback text and bounds score
   */
  static sanitizeReviewData(data: ReviewSubmissionDTO, maxScore: number = 100): ReviewSubmissionDTO {
    this.validateReview(data, maxScore);

    return {
      verificationStatus: data.verificationStatus,
      feedback: data.feedback ? data.feedback.trim() : null,
      score: data.score !== undefined && data.score !== null ? Math.floor(data.score) : null,
    };
  }
}
