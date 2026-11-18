import { InterviewOutcome } from "../entities/interview.entity";
import { InterviewValidationError } from "../errors/interview.error";

export class InterviewEvaluationPolicy {
  /**
   * Determines evaluation outcome based on overall score and passing threshold
   */
  static determineOutcome(params: {
    overallScore: number;
    passingScore?: number;
    explicitOutcome?: InterviewOutcome;
  }): InterviewOutcome {
    if (params.explicitOutcome) {
      return params.explicitOutcome;
    }

    if (params.passingScore !== undefined && params.passingScore !== null) {
      return params.overallScore >= params.passingScore ? "PASSED" : "FAILED";
    }

    return "NEEDS_HUMAN_REVIEW";
  }

  /**
   * Calculates interview duration in seconds safely
   */
  static calculateDurationSeconds(
    startedAt?: Date | null,
    endedAt: Date = new Date(),
    fallbackSeconds: number = 0
  ): number {
    if (!startedAt) return fallbackSeconds;
    const start = new Date(startedAt).getTime();
    const end = new Date(endedAt).getTime();
    if (isNaN(start) || isNaN(end) || end < start) {
      return fallbackSeconds;
    }
    return Math.round((end - start) / 1000);
  }

  /**
   * Validates that scores are bounded between 0 and 100
   */
  static validateScoreBounds(score: number, fieldName = "Score"): void {
    if (typeof score !== "number" || isNaN(score) || score < 0 || score > 100) {
      throw new InterviewValidationError(
        `${fieldName} must be a number between 0 and 100`
      );
    }
  }

  /**
   * Normalizes score to 2 decimal places bounded between 0 and 100
   */
  static normalizeScore(score?: number | null): number {
    if (score === undefined || score === null || isNaN(score)) {
      return 0;
    }
    return Math.min(100, Math.max(0, Math.round(score * 100) / 100));
  }
}
