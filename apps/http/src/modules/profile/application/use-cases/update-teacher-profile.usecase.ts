import { NotFoundError, BadRequestError } from "@/app/errors";
import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { FullUserProfile } from "../../domain/entities/profile.entity";
import { UpdateTeacherProfileDTO } from "../../domain/dtos/update-teacher-profile.dto";

export class UpdateTeacherProfile {
    constructor(private readonly profileRepository: ProfileRepository) { }

    async execute(userId: string, data: UpdateTeacherProfileDTO): Promise<FullUserProfile> {
        const existingProfile = await this.profileRepository.getFullProfileByUserId(userId);
        if (!existingProfile) {
            throw new NotFoundError("User profile not found");
        }

        const currentStatus =
            existingProfile.teacherProfile?.approvalStatus ||
            (existingProfile.teacherProfile?.isApproved ? "VERIFIED" : "PENDING");
        const isSocialLocked =
            currentStatus === "IN_PROGRESS" ||
            currentStatus === "VERIFIED" ||
            Boolean(existingProfile.teacherProfile?.isApproved);

        // Prevent modifying social links (LinkedIn/Twitter) if instructor is IN_PROGRESS or VERIFIED
        if (isSocialLocked) {
            const currentLinkedin = existingProfile.teacherProfile?.linkedinUrl
                ? existingProfile.teacherProfile.linkedinUrl.trim()
                : null;
            const currentTwitter = existingProfile.teacherProfile?.twitterUrl
                ? existingProfile.teacherProfile.twitterUrl.trim()
                : null;

            if (data.linkedinUrl !== undefined) {
                const incomingLinkedin = data.linkedinUrl ? data.linkedinUrl.trim() : null;
                if (incomingLinkedin !== currentLinkedin) {
                    throw new BadRequestError(
                        currentStatus === "IN_PROGRESS"
                            ? "Social media links (LinkedIn) cannot be modified while your application is under evaluation (In Progress)."
                            : "Verified social links (LinkedIn) cannot be modified once your instructor account is approved by an administrator. You can only update your website URL."
                    );
                }
            }

            if (data.twitterUrl !== undefined) {
                const incomingTwitter = data.twitterUrl ? data.twitterUrl.trim() : null;
                if (incomingTwitter !== currentTwitter) {
                    throw new BadRequestError(
                        currentStatus === "IN_PROGRESS"
                            ? "Social media links (Twitter/X) cannot be modified while your application is under evaluation (In Progress)."
                            : "Verified social links (Twitter/X) cannot be modified once your instructor account is approved by an administrator. You can only update your website URL."
                    );
                }
            }
        }

        if (data.name !== undefined && data.name.trim() !== "") {
            await this.profileRepository.updateUserName(userId, data.name.trim());
        }

        const profileRecord = await this.profileRepository.upsertProfile(userId, {
            avatar: data.avatar,
            bio: data.bio,
            phone: data.phone,
        });

        await this.profileRepository.upsertTeacherProfile(profileRecord.id, {
            expertise: data.expertise,
            qualifications: data.qualifications,
            experienceYears: data.experienceYears,
            linkedinUrl: isSocialLocked ? existingProfile.teacherProfile?.linkedinUrl : data.linkedinUrl,
            twitterUrl: isSocialLocked ? existingProfile.teacherProfile?.twitterUrl : data.twitterUrl,
            websiteUrl: data.websiteUrl,
            approvalStatus: currentStatus,
            rejectionReason: existingProfile.teacherProfile?.rejectionReason,
            submissionCount: existingProfile.teacherProfile?.submissionCount ?? 0,
        });

        const updatedProfile = await this.profileRepository.getFullProfileByUserId(userId);
        if (!updatedProfile) {
            throw new NotFoundError("Updated teacher profile not found");
        }

        return updatedProfile;
    }
}
