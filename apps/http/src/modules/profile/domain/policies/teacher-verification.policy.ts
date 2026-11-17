import { FullUserProfile } from "../entities/profile.entity";
import {
    TeacherVerificationNotEligibleError,
    MaxVerificationAttemptsError,
} from "../errors/profile.errors";

export class TeacherVerificationPolicy {
    public static readonly MAX_SUBMISSION_ATTEMPTS = 5;

    /**
     * Asserts that a user profile is fully eligible to submit for teacher verification.
     */
    static assertEligibility(profile: FullUserProfile): void {
        if (profile.role !== "TEACHER") {
            throw new TeacherVerificationNotEligibleError(
                "Only instructor accounts can submit for verification"
            );
        }

        const currentStatus =
            profile.teacherProfile?.approvalStatus ||
            (profile.teacherProfile?.isApproved ? "VERIFIED" : "PENDING");

        if (currentStatus !== "PENDING" && currentStatus !== "REDO") {
            if (currentStatus === "IN_PROGRESS") {
                throw new TeacherVerificationNotEligibleError(
                    "Your application is already actively under review (In Progress)."
                );
            }
            if (currentStatus === "VERIFIED") {
                throw new TeacherVerificationNotEligibleError(
                    "Your instructor account is already verified and approved."
                );
            }
            throw new TeacherVerificationNotEligibleError(
                `Application cannot be submitted while in status ${currentStatus}. Please contact support.`
            );
        }

        const currentAttempts = profile.teacherProfile?.submissionCount ?? 0;
        if (currentAttempts >= this.MAX_SUBMISSION_ATTEMPTS) {
            throw new MaxVerificationAttemptsError(
                `You have reached the maximum verification submission limit (${this.MAX_SUBMISSION_ATTEMPTS} attempts). You cannot apply again. Please contact an administrator to re-evaluate your application.`
            );
        }

        this.assertProfileCompleteness(profile);
    }

    /**
     * Asserts that minimal required profile information is filled out before verification submission.
     */
    static assertProfileCompleteness(profile: FullUserProfile): void {
        const qualifications = profile.teacherProfile?.qualifications;
        const hasQualifications = Array.isArray(qualifications)
            ? qualifications.length > 0
            : typeof qualifications === "string"
            ? Boolean(qualifications.trim())
            : Boolean(qualifications);
        const hasBio = Boolean(profile.profile?.bio?.trim());
        const hasExpertise =
            Array.isArray(profile.teacherProfile?.expertise) &&
            profile.teacherProfile.expertise.length > 0;

        if (!hasQualifications && !hasBio) {
            throw new TeacherVerificationNotEligibleError(
                "Please provide your qualifications or a brief biography before submitting your application for verification."
            );
        }

        if (!hasExpertise) {
            throw new TeacherVerificationNotEligibleError(
                "Please select at least one domain of expertise before submitting your application for verification."
            );
        }
    }

    /**
     * Calculates the next attempt number for tracking submissions.
     */
    static calculateNextAttemptCount(currentAttempts: number = 0): number {
        return currentAttempts + 1;
    }
}
