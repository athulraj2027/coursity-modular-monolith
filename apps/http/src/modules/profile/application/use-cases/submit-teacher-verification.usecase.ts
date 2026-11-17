import { IProfileQueryRepository, ITeacherProfileMutationRepository } from "../../domain/repositories/profile.repository";
import { FullUserProfile } from "../../domain/entities/profile.entity";
import { IEmailService } from "@/infrastructure/email";
import { ProfileNotFoundError } from "../../domain/errors/profile.errors";
import { TeacherVerificationPolicy } from "../../domain/policies";

export const MAX_SUBMISSION_ATTEMPTS = TeacherVerificationPolicy.MAX_SUBMISSION_ATTEMPTS;

export class SubmitTeacherVerification {
    constructor(
        private readonly profileRepository: IProfileQueryRepository & ITeacherProfileMutationRepository,
        private readonly emailService?: IEmailService
    ) { }

    async execute(userId: string): Promise<{ profile: FullUserProfile; message: string }> {
        const existingProfile = await this.profileRepository.getFullProfileByUserId(userId);
        if (!existingProfile) {
            throw new ProfileNotFoundError("Teacher profile not found");
        }

        // Domain Policy: check eligibility, status, attempts, completeness
        TeacherVerificationPolicy.assertEligibility(existingProfile);

        const profileId = existingProfile.profile?.id;
        if (!profileId) {
            throw new ProfileNotFoundError("Profile record not found");
        }

        const currentAttempts = existingProfile.teacherProfile?.submissionCount ?? 0;
        const nextAttempts = TeacherVerificationPolicy.calculateNextAttemptCount(currentAttempts);

        await this.profileRepository.upsertTeacherProfile(profileId, {
            isApproved: false,
            approvalStatus: "IN_PROGRESS",
            rejectionReason: null,
            submissionCount: nextAttempts,
        });

        const updated = await this.profileRepository.getFullProfileByUserId(userId);
        if (!updated) {
            throw new ProfileNotFoundError("Updated profile not found");
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
            message: `Application submitted for verification successfully (Submission ${nextAttempts}/${TeacherVerificationPolicy.MAX_SUBMISSION_ATTEMPTS}).`,
        };
    }
}
