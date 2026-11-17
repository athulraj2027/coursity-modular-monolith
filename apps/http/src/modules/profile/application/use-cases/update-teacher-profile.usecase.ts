import { IProfileRepository } from "../../domain/repositories/profile.repository";
import { FullUserProfile } from "../../domain/entities/profile.entity";
import { UpdateTeacherProfileDTO } from "../../domain/dtos/update-teacher-profile.dto";
import { ProfileNotFoundError } from "../../domain/errors/profile.errors";
import { ProfileSocialLinksPolicy, ProfileValidationPolicy } from "../../domain/policies";

export class UpdateTeacherProfile {
    constructor(private readonly profileRepository: IProfileRepository) { }

    async execute(userId: string, data: UpdateTeacherProfileDTO): Promise<FullUserProfile> {
        const existingProfile = await this.profileRepository.getFullProfileByUserId(userId);
        if (!existingProfile) {
            throw new ProfileNotFoundError("User profile not found");
        }

        // 1. Policy domain validations
        ProfileValidationPolicy.validateName(data.name);
        ProfileValidationPolicy.validateBio(data.bio);
        ProfileValidationPolicy.validateExperienceYears(data.experienceYears);

        // 2. Validate social link edit permissions
        ProfileSocialLinksPolicy.assertCanModifySocialLinks({
            teacherProfile: existingProfile.teacherProfile,
            incomingLinkedin: data.linkedinUrl,
            incomingTwitter: data.twitterUrl,
        });

        // 3. Compute current status
        const currentStatus =
            existingProfile.teacherProfile?.approvalStatus ||
            (existingProfile.teacherProfile?.isApproved ? "VERIFIED" : "PENDING");

        // 4. Update user name if provided
        if (data.name !== undefined && data.name.trim() !== "") {
            await this.profileRepository.updateUserName(userId, data.name.trim());
        }

        // 5. Upsert common profile
        const profileRecord = await this.profileRepository.upsertProfile(userId, {
            avatar: data.avatar,
            bio: data.bio,
            phone: data.phone,
            country: data.country,
        });

        const effectiveSocial = ProfileSocialLinksPolicy.resolveEffectiveUrls({
            teacherProfile: existingProfile.teacherProfile,
            incomingLinkedin: data.linkedinUrl,
            incomingTwitter: data.twitterUrl,
        });

        // 6. Upsert teacher-specific fields
        await this.profileRepository.upsertTeacherProfile(profileRecord.id, {
            expertise: data.expertise,
            qualifications: data.qualifications,
            experienceYears: data.experienceYears,
            resume: data.resume,
            credentials: data.credentials,
            identityCard: data.identityCard,
            linkedinUrl: effectiveSocial.linkedinUrl,
            twitterUrl: effectiveSocial.twitterUrl,
            websiteUrl: data.websiteUrl,
            approvalStatus: currentStatus,
            rejectionReason: existingProfile.teacherProfile?.rejectionReason,
            submissionCount: (currentStatus === "VERIFIED" || existingProfile.teacherProfile?.isApproved)
                ? 0
                : (existingProfile.teacherProfile?.submissionCount ?? 0),
        });

        const updatedProfile = await this.profileRepository.getFullProfileByUserId(userId);
        if (!updatedProfile) {
            throw new ProfileNotFoundError("Updated teacher profile not found");
        }

        return updatedProfile;
    }
}
