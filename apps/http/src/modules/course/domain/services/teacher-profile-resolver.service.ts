import { profileRepository } from "@/modules/profile";

export interface ITeacherProfileResolver {
  getTeacherProfileIdByUserId(userId: string): Promise<string>;
}

export class DefaultTeacherProfileResolver implements ITeacherProfileResolver {
  async getTeacherProfileIdByUserId(userId: string): Promise<string> {
    return profileRepository.getOrCreateTeacherProfileId(userId);
  }
}

export const defaultTeacherProfileResolver: ITeacherProfileResolver = new DefaultTeacherProfileResolver();

