import { profileRepository } from "@/modules/profile";

export interface ITeacherProfileResolver {
  getTeacherProfileIdByUserId(userId: string): Promise<string | null>;
}

export class DefaultTeacherProfileResolver implements ITeacherProfileResolver {
  async getTeacherProfileIdByUserId(userId: string): Promise<string | null> {
    return profileRepository.getTeacherProfileIdByUserId(userId);
  }
}

export const defaultTeacherProfileResolver = new DefaultTeacherProfileResolver();

