import { IProfileRepository } from "../../domain/repositories/profile.repository";
import { FullUserProfile } from "../../domain/entities/profile.entity";
import { UpdateProfileDTO } from "../../domain/dtos/update-profile.dto";
import { ProfileNotFoundError } from "../../domain/errors/profile.errors";
import { ProfileSocialLinksPolicy, ProfileValidationPolicy } from "../../domain/policies";

export class UpdateProfile {
    constructor(private readonly profileRepository: IProfileRepository) { }

    async execute(userId: string, data: UpdateProfileDTO): Promise<FullUserProfile> {
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

        // 3. Update user name if provided
        if (data.name !== undefined && data.name.trim() !== "") {
            await this.profileRepository.updateUserName(userId, data.name.trim());
        }

        // 4. Upsert common profile (avatar, bio, phone, country)
        const updatedProfileRecord = await this.profileRepository.upsertProfile(userId, {
            avatar: data.avatar,
            bio: data.bio,
            phone: data.phone,
            country: data.country,
        });

        // 5. If teacher role or teacher-specific fields provided, upsert teacher profile using profileId
        if (
            existingProfile.role === "TEACHER" ||
            data.expertise !== undefined ||
            data.qualifications !== undefined ||
            data.experienceYears !== undefined ||
            data.resume !== undefined ||
            data.credentials !== undefined ||
            data.identityCard !== undefined ||
            data.linkedinUrl !== undefined ||
            data.twitterUrl !== undefined ||
            data.websiteUrl !== undefined
        ) {
            const effectiveSocial = ProfileSocialLinksPolicy.resolveEffectiveUrls({
                teacherProfile: existingProfile.teacherProfile,
                incomingLinkedin: data.linkedinUrl,
                incomingTwitter: data.twitterUrl,
            });

            await this.profileRepository.upsertTeacherProfile(updatedProfileRecord.id, {
                expertise: data.expertise,
                qualifications: data.qualifications,
                experienceYears: data.experienceYears,
                resume: data.resume,
                credentials: data.credentials,
                identityCard: data.identityCard,
                linkedinUrl: effectiveSocial.linkedinUrl,
                twitterUrl: effectiveSocial.twitterUrl,
                websiteUrl: data.websiteUrl,
            });
        }

        const updatedProfile = await this.profileRepository.getFullProfileByUserId(userId);
        if (!updatedProfile) {
            throw new ProfileNotFoundError("Updated profile not found");
        }

        return updatedProfile;
    }
}
