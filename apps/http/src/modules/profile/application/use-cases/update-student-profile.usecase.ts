import { NotFoundError } from "@/app/errors";
import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { FullUserProfile } from "../../domain/entities/profile.entity";
import { UpdateStudentProfileDTO } from "../../domain/dtos/update-student-profile.dto";

export class UpdateStudentProfile {
    constructor(private readonly profileRepository: ProfileRepository) { }

    async execute(userId: string, data: UpdateStudentProfileDTO): Promise<FullUserProfile> {
        const existingProfile = await this.profileRepository.getFullProfileByUserId(userId);
        if (!existingProfile) {
            throw new NotFoundError("User profile not found");
        }

        if (data.name !== undefined && data.name.trim() !== "") {
            await this.profileRepository.updateUserName(userId, data.name.trim());
        }

        await this.profileRepository.upsertStudentProfile(userId, {
            avatar: data.avatar,
            bio: data.bio,
            phone: data.phone,
            headline: data.headline,
            education: data.education,
            interests: data.interests,
        });

        const updatedProfile = await this.profileRepository.getFullProfileByUserId(userId);
        if (!updatedProfile) {
            throw new NotFoundError("Updated student profile not found");
        }

        return updatedProfile;
    }
}
