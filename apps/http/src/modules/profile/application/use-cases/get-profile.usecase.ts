import { NotFoundError } from "@/app/errors";
import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { FullUserProfile } from "../../domain/entities/profile.entity";

export class GetProfile {
    constructor(private readonly profileRepository: ProfileRepository) { }

    async execute(userId: string): Promise<FullUserProfile> {
        const profile = await this.profileRepository.getFullProfileByUserId(userId);
        if (!profile) {
            throw new NotFoundError("User profile not found");
        }
        return profile;
    }
}
