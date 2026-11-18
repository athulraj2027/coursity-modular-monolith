import { InvalidInterviewStateError } from "../errors/interview.error";
import { InterviewStatus } from "../entities/interview.entity";

export class InterviewLifecyclePolicy {
  /**
   * Checks if an interview session can be started by a candidate or AI service
   */
  static canStart(status: InterviewStatus): boolean {
    return status === "INITIALIZING" || status === "IN_PROGRESS";
  }

  /**
   * Asserts that an interview session can be started
   */
  static assertCanStart(status: InterviewStatus): void {
    if (!this.canStart(status)) {
      throw new InvalidInterviewStateError(
        `Cannot start interview from state ${status}`
      );
    }
  }

  /**
   * Checks if a real-time WebRTC token can be issued
   */
  static canIssueRealtimeToken(status: InterviewStatus): boolean {
    return status === "INITIALIZING" || status === "IN_PROGRESS";
  }

  /**
   * Asserts that a real-time WebRTC token can be issued
   */
  static assertCanIssueRealtimeToken(status: InterviewStatus): void {
    if (!this.canIssueRealtimeToken(status)) {
      throw new InvalidInterviewStateError(
        `Realtime token can only be issued for active sessions (current status: ${status})`
      );
    }
  }

  /**
   * Checks if a candidate can complete/submit an interview session
   */
  static canComplete(status: InterviewStatus): boolean {
    return status === "IN_PROGRESS" || status === "INITIALIZING";
  }

  /**
   * Asserts that a candidate can complete/submit an interview session
   */
  static assertCanComplete(status: InterviewStatus): void {
    if (!this.canComplete(status)) {
      throw new InvalidInterviewStateError(
        `Cannot complete session with status ${status}`
      );
    }
  }

  /**
   * Checks if an interview session can be cancelled by a candidate
   */
  static canCancel(status: InterviewStatus): boolean {
    return status !== "COMPLETED" && status !== "EVALUATED";
  }

  /**
   * Asserts that an interview session can be cancelled
   */
  static assertCanCancel(status: InterviewStatus): void {
    if (!this.canCancel(status)) {
      throw new InvalidInterviewStateError("Cannot cancel a completed interview");
    }
  }
}
