import { NotFoundError } from "@/app/errors";
import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { FullUserProfile } from "../../domain/entities/profile.entity";
import { UpdateProfileDTO } from "../../domain/dtos/update-profile.dto";

export class UpdateProfile {
    constructor(private readonly profileRepository: ProfileRepository) { }

    async execute(userId: string, data: UpdateProfileDTO): Promise<FullUserProfile> {
        const existingProfile = await this.profileRepository.getFullProfileByUserId(userId);
        if (!existingProfile) {
            throw new NotFoundError("User profile not found");
        }

        // 1. Update user name if provided
        if (data.name !== undefined && data.name.trim() !== "") {
            await this.profileRepository.updateUserName(userId, data.name.trim());
        }

        // 2. Update role-specific profile
        if (existingProfile.role === "TEACHER") {
            await this.profileRepository.upsertTeacherProfile(userId, {
                avatar: data.avatar,
                bio: data.bio,
                phone: data.phone,
                headline: data.headline,
                expertise: data.expertise,
                qualifications: data.qualifications,
                experienceYears: data.experienceYears,
                linkedinUrl: data.linkedinUrl,
                twitterUrl: data.twitterUrl,
                websiteUrl: data.websiteUrl,
            });
        } else {
            // Default or STUDENT role
            await this.profileRepository.upsertStudentProfile(userId, {
                avatar: data.avatar,
                bio: data.bio,
                phone: data.phone,
                headline: data.headline,
                education: data.education,
                interests: data.interests,
            });
        }

        const updatedProfile = await this.profileRepository.getFullProfileByUserId(userId);
        if (!updatedProfile) {
            throw new NotFoundError("Updated profile not found");
        }

        return updatedProfile;
    }
}
