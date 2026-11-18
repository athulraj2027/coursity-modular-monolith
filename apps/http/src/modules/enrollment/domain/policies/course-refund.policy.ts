import { CourseEnrollmentEntity } from "../entities/enrollment.entity";
import { RefundEligibilityCheckResult } from "../dtos/enrollment.dto";

export class CourseRefundPolicy {
  public static readonly MAX_DAYS_ALLOWED = 20;
  public static readonly MAX_CLASSES_ALLOWED = 4;

  /**
   * Calculates the 20-day refund window end date based on course starting date or enrollment date.
   */
  public static calculateRefundEligibleUntil(courseStartingDate: Date | null | undefined, enrolledAt: Date = new Date()): Date {
    const enrolledDate = new Date(enrolledAt);
    const startingDate = courseStartingDate ? new Date(courseStartingDate) : enrolledDate;
    const effectiveStart = startingDate > enrolledDate ? startingDate : enrolledDate;
    return new Date(effectiveStart.getTime() + this.MAX_DAYS_ALLOWED * 24 * 60 * 60 * 1000);
  }

  /**
   * Evaluates complete eligibility under the 20-Day / 4-Classes Full Refund Guarantee.
   */
  public static checkEligibility(params: {
    enrollment: CourseEnrollmentEntity;
    classesConductedCount: number;
    classesAttendedCount: number;
    hasClaimedCertificate: boolean;
    now?: Date;
  }): RefundEligibilityCheckResult {
    const { enrollment, classesConductedCount, classesAttendedCount, hasClaimedCertificate } = params;
    const now = params.now || new Date();

    const enrolledDate = new Date(enrollment.enrolledAt);
    const startingDate = enrollment.courseStartingDate ? new Date(enrollment.courseStartingDate) : enrolledDate;
    const effectiveStartDate = startingDate > enrolledDate ? startingDate : enrolledDate;
    const daysElapsed = Math.max(0, Math.floor((now.getTime() - effectiveStartDate.getTime()) / (1000 * 60 * 60 * 24)));

    const refundDeadline = new Date(enrollment.refundEligibleUntil).getTime();
    const daysRemaining = Math.max(0, Math.ceil((refundDeadline - now.getTime()) / (1000 * 60 * 60 * 24)));
    const paidAmount = Number(enrollment.finalAmount || 0);

    // 1. Status Check
    if (enrollment.status === "REFUNDED") {
      return {
        isEligible: false,
        daysElapsed,
        daysRemaining,
        classesConducted: classesConductedCount,
        classesAttended: classesAttendedCount,
        maxDaysAllowed: this.MAX_DAYS_ALLOWED,
        maxClassesAllowed: this.MAX_CLASSES_ALLOWED,
        refundEligibleUntil: enrollment.refundEligibleUntil,
        paidAmount,
        reasonIfNotEligible: "This course enrollment has already been refunded.",
      };
    }

    if (enrollment.status !== "ACTIVE") {
      return {
        isEligible: false,
        daysElapsed,
        daysRemaining,
        classesConducted: classesConductedCount,
        classesAttended: classesAttendedCount,
        maxDaysAllowed: this.MAX_DAYS_ALLOWED,
        maxClassesAllowed: this.MAX_CLASSES_ALLOWED,
        refundEligibleUntil: enrollment.refundEligibleUntil,
        paidAmount,
        reasonIfNotEligible: `Cannot refund enrollment with status '${enrollment.status}'.`,
      };
    }

    // 2. Monetary Check
    if (paidAmount <= 0) {
      return {
        isEligible: false,
        daysElapsed,
        daysRemaining,
        classesConducted: classesConductedCount,
        classesAttended: classesAttendedCount,
        maxDaysAllowed: this.MAX_DAYS_ALLOWED,
        maxClassesAllowed: this.MAX_CLASSES_ALLOWED,
        refundEligibleUntil: enrollment.refundEligibleUntil,
        paidAmount,
        reasonIfNotEligible: "Cannot process a monetary refund for a free enrollment.",
      };
    }

    // 3. Time Window Check (20 Days)
    if (daysElapsed > this.MAX_DAYS_ALLOWED || now.getTime() > refundDeadline) {
      return {
        isEligible: false,
        daysElapsed,
        daysRemaining: 0,
        classesConducted: classesConductedCount,
        classesAttended: classesAttendedCount,
        maxDaysAllowed: this.MAX_DAYS_ALLOWED,
        maxClassesAllowed: this.MAX_CLASSES_ALLOWED,
        refundEligibleUntil: enrollment.refundEligibleUntil,
        paidAmount,
        reasonIfNotEligible: `Refund window expired. The 20-day refund policy ended ${daysElapsed - this.MAX_DAYS_ALLOWED} day(s) ago.`,
      };
    }

    // 4. Conducted Classes Check (4 Classes)
    if (classesConductedCount >= this.MAX_CLASSES_ALLOWED) {
      return {
        isEligible: false,
        daysElapsed,
        daysRemaining,
        classesConducted: classesConductedCount,
        classesAttended: classesAttendedCount,
        maxDaysAllowed: this.MAX_DAYS_ALLOWED,
        maxClassesAllowed: this.MAX_CLASSES_ALLOWED,
        refundEligibleUntil: enrollment.refundEligibleUntil,
        paidAmount,
        reasonIfNotEligible: `Refund policy limit reached. 4 live class sessions have already been conducted for this course (${classesConductedCount} held).`,
      };
    }

    // 5. Attended Classes Check (4 Classes)
    if (classesAttendedCount >= this.MAX_CLASSES_ALLOWED) {
      return {
        isEligible: false,
        daysElapsed,
        daysRemaining,
        classesConducted: classesConductedCount,
        classesAttended: classesAttendedCount,
        maxDaysAllowed: this.MAX_DAYS_ALLOWED,
        maxClassesAllowed: this.MAX_CLASSES_ALLOWED,
        refundEligibleUntil: enrollment.refundEligibleUntil,
        paidAmount,
        reasonIfNotEligible: `Refund policy limit reached. You have already attended 4 or more live classes (${classesAttendedCount} attended).`,
      };
    }

    // 6. Certificate Claim Check
    if (hasClaimedCertificate) {
      return {
        isEligible: false,
        daysElapsed,
        daysRemaining,
        classesConducted: classesConductedCount,
        classesAttended: classesAttendedCount,
        maxDaysAllowed: this.MAX_DAYS_ALLOWED,
        maxClassesAllowed: this.MAX_CLASSES_ALLOWED,
        refundEligibleUntil: enrollment.refundEligibleUntil,
        paidAmount,
        reasonIfNotEligible: "Refunds cannot be issued after a course completion certificate has been claimed.",
      };
    }

    return {
      isEligible: true,
      daysElapsed,
      daysRemaining,
      classesConducted: classesConductedCount,
      classesAttended: classesAttendedCount,
      maxDaysAllowed: this.MAX_DAYS_ALLOWED,
      maxClassesAllowed: this.MAX_CLASSES_ALLOWED,
      refundEligibleUntil: enrollment.refundEligibleUntil,
      paidAmount,
    };
  }
}
