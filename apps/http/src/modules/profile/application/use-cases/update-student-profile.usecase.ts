import { IProfileQueryRepository, IProfileMutationRepository } from "../../domain/repositories/profile.repository";
import { FullUserProfile } from "../../domain/entities/profile.entity";
import { UpdateStudentProfileDTO } from "../../domain/dtos/update-student-profile.dto";
import { ProfileNotFoundError } from "../../domain/errors/profile.errors";
import { ProfileValidationPolicy } from "../../domain/policies";

export class UpdateStudentProfile {
    constructor(
        private readonly profileRepository: IProfileQueryRepository & IProfileMutationRepository
    ) { }

    async execute(userId: string, data: UpdateStudentProfileDTO): Promise<FullUserProfile> {
        const existingProfile = await this.profileRepository.getFullProfileByUserId(userId);
        if (!existingProfile) {
            throw new ProfileNotFoundError("User profile not found");
        }

        // Domain validation policy
        ProfileValidationPolicy.validateName(data.name);
        ProfileValidationPolicy.validateBio(data.bio);

        if (data.name !== undefined && data.name.trim() !== "") {
            await this.profileRepository.updateUserName(userId, data.name.trim());
        }

        await this.profileRepository.upsertProfile(userId, {
            avatar: data.avatar,
            bio: data.bio,
            phone: data.phone,
            country: data.country,
        });

        const updatedProfile = await this.profileRepository.getFullProfileByUserId(userId);
        if (!updatedProfile) {
            throw new ProfileNotFoundError("Updated student profile not found");
        }

        return updatedProfile;
    }
}
