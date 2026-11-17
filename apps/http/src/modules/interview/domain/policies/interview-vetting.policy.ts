import {
  InterviewAccessDeniedError,
  InterviewAlreadyPassedError,
  MaxInterviewAttemptsReachedError,
} from "../errors/interview.error";
import {
  InterviewSessionEntity,
  InterviewType,
} from "../entities/interview.entity";

export class InterviewVettingPolicy {
  public static readonly MAX_VETTING_ATTEMPTS = 3;

  /**
   * Counts non-cancelled teacher vetting attempts
   */
  static countVettingAttempts(sessions: InterviewSessionEntity[]): number {
    return sessions.filter(
      (s) => s.type === "TEACHER_VETTING" && s.status !== "CANCELLED"
    ).length;
  }

  /**
   * Checks whether the candidate has already passed any interview session
   */
  static hasPassedVetting(sessions: InterviewSessionEntity[], excludeSessionId?: string): boolean {
    return sessions.some(
      (s) => s.outcome === "PASSED" && (!excludeSessionId || s.id !== excludeSessionId)
    );
  }

  /**
   * Validates whether a user can initiate or start an interview session
   */
  static validateCanInitiate(params: {
    userRole?: string;
    existingSessions: InterviewSessionEntity[];
    type?: InterviewType;
    excludeSessionId?: string;
  }): void {
    const { userRole, existingSessions, type = "TEACHER_VETTING", excludeSessionId } = params;

    // 1. Role verification
    if (userRole === "STUDENT" || userRole === "student") {
      throw new InterviewAccessDeniedError(
        "Students cannot initiate arbitrary AI interviews. Course-specific AI assessments are only accessible when released by your course instructor."
      );
    }

    // 2. Already passed check
    if (this.hasPassedVetting(existingSessions, excludeSessionId)) {
      throw new InterviewAlreadyPassedError(
        "Candidate has already passed the interview assessment. Starting a new interview is not permitted."
      );
    }

    // 3. Attempt quota check for TEACHER_VETTING
    if (type === "TEACHER_VETTING") {
      const vettingAttempts = this.countVettingAttempts(existingSessions);
      if (vettingAttempts >= this.MAX_VETTING_ATTEMPTS) {
        throw new MaxInterviewAttemptsReachedError(
          `Maximum interview attempts (${this.MAX_VETTING_ATTEMPTS} of ${this.MAX_VETTING_ATTEMPTS}) reached. Starting a new interview is not permitted. Please contact admissions support.`
        );
      }
    }
  }
}
