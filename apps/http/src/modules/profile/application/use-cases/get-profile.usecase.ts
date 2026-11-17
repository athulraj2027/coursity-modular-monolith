import { IProfileQueryRepository } from "../../domain/repositories/profile.repository";
import { FullUserProfile } from "../../domain/entities/profile.entity";
import { ProfileNotFoundError } from "../../domain/errors/profile.errors";

export class GetProfile {
    constructor(private readonly profileRepository: IProfileQueryRepository) { }

    async execute(userId: string): Promise<FullUserProfile> {
        const profile = await this.profileRepository.getFullProfileByUserId(userId);
        if (!profile) {
            throw new ProfileNotFoundError("User profile not found");
        }
        return profile;
    }
}
