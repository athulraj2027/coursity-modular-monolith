import { NotFoundError, BadRequestError } from "@/app/errors";
import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { FullUserProfile } from "../../domain/entities/profile.entity";
import { IEmailService } from "@/modules/email";

export const MAX_SUBMISSION_ATTEMPTS = 5;

export class SubmitTeacherVerification {
    constructor(
        private readonly profileRepository: ProfileRepository,
        private readonly emailService?: IEmailService
    ) { }

    async execute(userId: string): Promise<{ profile: FullUserProfile; message: string }> {
        const existingProfile = await this.profileRepository.getFullProfileByUserId(userId);
        if (!existingProfile) {
            throw new NotFoundError("Teacher profile not found");
        }

        if (existingProfile.role !== "TEACHER") {
            throw new BadRequestError("Only instructor accounts can submit for verification");
        }

        const currentStatus =
            existingProfile.teacherProfile?.approvalStatus ||
            (existingProfile.teacherProfile?.isApproved ? "VERIFIED" : "PENDING");

        if (currentStatus !== "PENDING" && currentStatus !== "REDO") {
            if (currentStatus === "IN_PROGRESS") {
                throw new BadRequestError("Your application is already actively under review (In Progress).");
            }
            if (currentStatus === "VERIFIED") {
                throw new BadRequestError("Your instructor account is already verified and approved.");
            }
            throw new BadRequestError(
                `Application cannot be submitted while in status ${currentStatus}. Please contact support.`
            );
        }

        const currentAttempts = existingProfile.teacherProfile?.submissionCount ?? 0;
        if (currentAttempts >= MAX_SUBMISSION_ATTEMPTS) {
            throw new BadRequestError(
                `You have reached the maximum verification submission limit (${MAX_SUBMISSION_ATTEMPTS} attempts). You cannot apply again. Please contact an administrator to re-evaluate your application.`
            );
        }

        // Validate basic profile completeness before submitting
        const hasQualifications = Boolean(existingProfile.teacherProfile?.qualifications?.trim());
        const hasBio = Boolean(existingProfile.profile?.bio?.trim());
        const hasExpertise =
            Array.isArray(existingProfile.teacherProfile?.expertise) &&
            existingProfile.teacherProfile.expertise.length > 0;

        if (!hasQualifications && !hasBio) {
            throw new BadRequestError(
                "Please provide your qualifications or a brief biography before submitting your application for verification."
            );
        }

        if (!hasExpertise) {
            throw new BadRequestError(
                "Please select at least one domain of expertise before submitting your application for verification."
            );
        }

        const profileId = existingProfile.profile?.id;
        if (!profileId) {
            throw new NotFoundError("Profile record not found");
        }

        const nextAttempts = currentAttempts + 1;

        await this.profileRepository.upsertTeacherProfile(profileId, {
            isApproved: false,
            approvalStatus: "IN_PROGRESS",
            rejectionReason: null,
            submissionCount: nextAttempts,
        });

        const updated = await this.profileRepository.getFullProfileByUserId(userId);
        if (!updated) {
            throw new NotFoundError("Updated profile not found");
        }

        // Asynchronously send "under review" email confirmation via queue
        if (this.emailService && updated.email) {
            await this.emailService
                .sendTeacherStatusUpdate(updated.email, updated.name, "IN_PROGRESS")
                .catch((err) => {
                    console.error(`⚠️ Failed to enqueue submission confirmation email for ${updated.email}:`, err?.message || err);
                });
        }

        return {
            profile: updated,
            message: `Application submitted for verification successfully (Submission ${nextAttempts}/${MAX_SUBMISSION_ATTEMPTS}).`,
        };
    }
}
