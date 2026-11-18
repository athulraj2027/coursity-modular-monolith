import { CourseEnrollmentEntity } from "../entities/enrollment.entity";

export class CourseCertificatePolicy {
  public static readonly MINIMUM_PROGRESS_PERCENTAGE = 90;

  /**
   * Evaluates if student is eligible to claim course completion certificate.
   */
  public static isEligibleForCertificate(enrollment: CourseEnrollmentEntity): {
    isEligible: boolean;
    reasonIfNotEligible?: string;
  } {
    if (enrollment.status === "REFUNDED") {
      return {
        isEligible: false,
        reasonIfNotEligible: "Cannot claim a certificate for a refunded enrollment.",
      };
    }

    if (enrollment.status === "CANCELLED") {
      return {
        isEligible: false,
        reasonIfNotEligible: "Cannot claim a certificate for a cancelled enrollment.",
      };
    }

    const totalLessons = enrollment.totalLessons || 1;
    const isProgressSufficient = enrollment.progressPercentage >= this.MINIMUM_PROGRESS_PERCENTAGE;
    const areAllLessonsCompleted = enrollment.completedLessonsCount >= totalLessons;

    if (!isProgressSufficient && !areAllLessonsCompleted) {
      return {
        isEligible: false,
        reasonIfNotEligible: `Course progress is currently at ${enrollment.progressPercentage}%. You must complete at least ${this.MINIMUM_PROGRESS_PERCENTAGE}% of the syllabus to claim your certificate.`,
      };
    }

    return { isEligible: true };
  }

  /**
   * Generates a unique, formatted certificate verification code.
   */
  public static generateCertificateCode(year = new Date().getFullYear()): string {
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `CRT-${year}-${randomHex}`;
  }
}
