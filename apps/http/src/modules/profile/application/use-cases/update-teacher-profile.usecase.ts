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

        // Prevent modifying verified social links (LinkedIn/Twitter) if instructor is approved
        if (existingProfile.teacherProfile?.isApproved) {
            const currentLinkedin = existingProfile.teacherProfile.linkedinUrl ? existingProfile.teacherProfile.linkedinUrl.trim() : null;
            const currentTwitter = existingProfile.teacherProfile.twitterUrl ? existingProfile.teacherProfile.twitterUrl.trim() : null;

            if (data.linkedinUrl !== undefined) {
                const incomingLinkedin = data.linkedinUrl ? data.linkedinUrl.trim() : null;
                if (incomingLinkedin !== currentLinkedin) {
                    throw new BadRequestError(
                        "Verified social links (LinkedIn) cannot be modified once your instructor account is approved by an administrator. You can only update your website URL."
                    );
                }
            }

            if (data.twitterUrl !== undefined) {
                const incomingTwitter = data.twitterUrl ? data.twitterUrl.trim() : null;
                if (incomingTwitter !== currentTwitter) {
                    throw new BadRequestError(
                        "Verified social links (Twitter/X) cannot be modified once your instructor account is approved by an administrator. You can only update your website URL."
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
            linkedinUrl: existingProfile.teacherProfile?.isApproved ? existingProfile.teacherProfile.linkedinUrl : data.linkedinUrl,
            twitterUrl: existingProfile.teacherProfile?.isApproved ? existingProfile.teacherProfile.twitterUrl : data.twitterUrl,
            websiteUrl: data.websiteUrl,
        });

        const updatedProfile = await this.profileRepository.getFullProfileByUserId(userId);
        if (!updatedProfile) {
            throw new NotFoundError("Updated teacher profile not found");
        }

        return updatedProfile;
    }
}
