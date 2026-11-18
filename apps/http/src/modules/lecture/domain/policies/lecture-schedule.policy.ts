import { LectureConflictError, LectureValidationError } from "../errors/lecture.errors";
import { LectureEntity } from "../entities/lecture.entity";

export class LectureSchedulePolicy {
  public static readonly CLOCK_DRIFT_LEEWAY_MS = 5 * 60 * 1000; // 5 minutes leeway
  public static readonly DATE_ONLY_TIMEZONE_BUFFER_MS = 12 * 60 * 60 * 1000; // 12 hours buffer

  /**
   * Validates and parses a lecture start time against current time and course start date
   */
  static validateScheduledTime(params: {
    scheduledAt: Date | string | null | undefined;
    courseStartingDate?: Date | string | null;
    isUpdating?: boolean;
    now?: Date;
  }): Date | null {
    const { scheduledAt, courseStartingDate, isUpdating = false, now = new Date() } = params;

    if (!scheduledAt) return null;

    const scheduledDate = scheduledAt instanceof Date ? scheduledAt : new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      throw new LectureValidationError("Invalid start time date format.");
    }

    // Allow 5 minutes leeway for clock drift
    if (scheduledDate.getTime() < now.getTime() - this.CLOCK_DRIFT_LEEWAY_MS) {
      throw new LectureValidationError("Lecture start time cannot be in the past.");
    }

    // Ensure lecture is not scheduled before the course start date
    if (courseStartingDate) {
      const courseStartDate =
        courseStartingDate instanceof Date
          ? courseStartingDate
          : new Date(courseStartingDate);

      if (!isNaN(courseStartDate.getTime())) {
        const isDateOnly =
          courseStartDate.getUTCHours() === 0 &&
          courseStartDate.getUTCMinutes() === 0 &&
          courseStartDate.getUTCSeconds() === 0;

        // Allow 12 hours buffer if date-only so all world timezones on that date are permitted
        const minAllowedTime = isDateOnly
          ? courseStartDate.getTime() - this.DATE_ONLY_TIMEZONE_BUFFER_MS
          : courseStartDate.getTime();

        if (scheduledDate.getTime() < minAllowedTime) {
          const formattedCourseStart = courseStartDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          throw new LectureValidationError(
            `Lecture start time cannot be earlier than the course start date (${formattedCourseStart}).`
          );
        }
      }
    }

    return scheduledDate;
  }

  /**
   * Calculates lecture end time from start date and duration
   */
  static calculateEndTime(startTime: Date, durationSeconds: number): Date {
    return new Date(startTime.getTime() + durationSeconds * 1000);
  }

  /**
   * Builds formatted schedule conflict error message
   */
  static buildConflictError(conflicting: LectureEntity): LectureConflictError {
    const conflictStart = conflicting.scheduledAt
      ? new Date(conflicting.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "TBD";
    const conflictEnd = conflicting.scheduledAt
      ? new Date(new Date(conflicting.scheduledAt).getTime() + conflicting.durationSeconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "TBD";
    const conflictDate = conflicting.scheduledAt
      ? new Date(conflicting.scheduledAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
      : "";

    return new LectureConflictError(
      `Schedule conflict: You already have another lecture "${conflicting.title}" scheduled on ${conflictDate} from ${conflictStart} to ${conflictEnd} (${Math.round(conflicting.durationSeconds / 60)} mins). Live lectures cannot overlap.`
    );
  }
}
