import { NotFoundError } from "@/app/errors";
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

        if (data.name !== undefined && data.name.trim() !== "") {
            await this.profileRepository.updateUserName(userId, data.name.trim());
        }

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

        const updatedProfile = await this.profileRepository.getFullProfileByUserId(userId);
        if (!updatedProfile) {
            throw new NotFoundError("Updated teacher profile not found");
        }

        return updatedProfile;
    }
}
