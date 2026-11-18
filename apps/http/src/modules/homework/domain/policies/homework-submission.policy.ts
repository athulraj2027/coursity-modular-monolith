import { SubmitHomeworkDTO } from "../dtos/homework.dto";
import { HomeworkSubmissionEntity, SubmissionStatus } from "../entities/homework.entity";
import { HomeworkValidationError } from "../errors/homework.errors";

export class HomeworkSubmissionPolicy {
  /**
   * Validates student submission payload to ensure at least one content format is supplied
   */
  static validateSubmissionPayload(data: SubmitHomeworkDTO): void {
    const hasText = Boolean(data.submissionText && data.submissionText.trim().length > 0);
    const hasUrl = Boolean(data.submissionUrl && data.submissionUrl.trim().length > 0);
    const hasFile = Boolean(data.fileUrl && data.fileUrl.trim().length > 0);

    if (!hasText && !hasUrl && !hasFile) {
      throw new HomeworkValidationError(
        "Please provide a written response, a project link (GitHub / Figma / Colab), or upload a submission file"
      );
    }
  }

  /**
   * Determines whether a student can submit or resubmit for an assignment.
   * If a submission has already been VERIFIED, students cannot overwrite their grade
   * unless the instructor specifically requested a REDO.
   */
  static canResubmit(existingSubmission: HomeworkSubmissionEntity | null): {
    allowed: boolean;
    reason?: string;
  } {
    if (!existingSubmission) {
      return { allowed: true };
    }

    if (existingSubmission.verificationStatus === "VERIFIED") {
      return {
        allowed: false,
        reason: "This homework submission has already been verified and graded. Resubmission is closed.",
      };
    }

    return { allowed: true };
  }

  /**
   * Computes whether submission occurred after the assignment due date
   */
  static isLate(dueDate: Date | string | null | undefined, submittedAt: Date = new Date()): boolean {
    if (!dueDate) return false;
    const dueTime = new Date(dueDate).getTime();
    if (isNaN(dueTime)) return false;
    return submittedAt.getTime() > dueTime;
  }

  /**
   * Determines status string based on whether this is an initial submission or resubmission
   */
  static determineSubmissionStatus(
    existingSubmission: HomeworkSubmissionEntity | null
  ): SubmissionStatus {
    return existingSubmission ? "RESUBMITTED" : "SUBMITTED";
  }

  /**
   * Increments attempt count
   */
  static calculateAttemptCount(existingSubmission: HomeworkSubmissionEntity | null): number {
    return (existingSubmission?.attemptCount || 0) + 1;
  }
}
