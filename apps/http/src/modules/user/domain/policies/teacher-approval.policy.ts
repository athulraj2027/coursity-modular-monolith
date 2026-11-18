import { ApprovalStatus } from "../entities/user.entity";
import {
  ApprovalFeedbackRequiredError,
  InvalidApprovalTransitionError,
} from "../errors/user.errors";

export const ALLOWED_APPROVAL_TRANSITIONS: Record<ApprovalStatus, ApprovalStatus[]> = {
  PENDING: [],
  IN_PROGRESS: ["VERIFIED", "REDO"],
  VERIFIED: ["REVOKED"],
  REVOKED: ["PENDING"],
  REDO: [],
};

export class TeacherApprovalPolicy {
  /**
   * Validates whether transition from currentStatus to targetStatus is permitted.
   */
  static validateTransition(currentStatus: ApprovalStatus, targetStatus: ApprovalStatus): void {
    const allowed = ALLOWED_APPROVAL_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      if (currentStatus === "PENDING") {
        throw new InvalidApprovalTransitionError(
          "Instructor application is currently in draft (Pending). The instructor must submit their application for verification before administrative evaluation."
        );
      }
      if (currentStatus === "REDO") {
        throw new InvalidApprovalTransitionError(
          "Instructor application is currently marked for revision (Redo). The instructor must revise their profile and re-submit for verification before administrative evaluation."
        );
      }
      throw new InvalidApprovalTransitionError(
        `Invalid status transition from ${currentStatus} to ${targetStatus}. Allowed transition(s) from ${currentStatus}: ${allowed.join(", ")}.`
      );
    }
  }

  /**
   * Validates that feedback is provided when status is REVOKED or REDO (at least 5 characters).
   */
  static validateFeedback(status: ApprovalStatus, feedback?: string | null): void {
    if (status === "REVOKED" || status === "REDO") {
      if (!feedback || feedback.trim().length < 5) {
        throw new ApprovalFeedbackRequiredError(
          `Please provide a suggestion or feedback (at least 5 characters) explaining what the instructor should improve when setting status to ${status.toLowerCase()}`
        );
      }
    }
  }

  /**
   * Formats the user-facing confirmation message for the status change.
   */
  static formatActionMessage(status: ApprovalStatus): string {
    switch (status) {
      case "VERIFIED":
        return "Instructor has been verified and approved successfully";
      case "IN_PROGRESS":
        return "Instructor application marked as in progress";
      case "REVOKED":
        return "Instructor verification has been revoked with feedback";
      case "REDO":
        return "Instructor application marked for revision (redo) with feedback";
      case "PENDING":
      default:
        return "Instructor application status reset to pending";
    }
  }
}
