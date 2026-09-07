import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { FullUserProfile, UserProfile, TeacherProfile } from "../../domain/entities/profile.entity";

export class PrismaProfileRepository implements ProfileRepository {
    constructor(private readonly prisma: PrismaClient = defaultPrisma) { }

    async getFullProfileByUserId(userId: string): Promise<FullUserProfile | null> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: {
                    include: {
                        teacherProfile: true,
                    },
                },
            },
        });

        if (!user) return null;

        const { password, profile, ...safeUser } = user;
        const teacherProfile = profile?.teacherProfile || null;

        return {
            ...safeUser,
            profile: profile
                ? {
                    id: profile.id,
                    userId: profile.userId,
                    avatar: profile.avatar,
                    bio: profile.bio,
                    phone: profile.phone,
                    createdAt: profile.createdAt,
                    updatedAt: profile.updatedAt,
                }
                : null,
            teacherProfile: teacherProfile
                ? {
                    id: teacherProfile.id,
                    profileId: teacherProfile.profileId,
                    expertise: teacherProfile.expertise,
                    qualifications: teacherProfile.qualifications,
                    experienceYears: teacherProfile.experienceYears,
                    linkedinUrl: teacherProfile.linkedinUrl,
                    twitterUrl: teacherProfile.twitterUrl,
                    websiteUrl: teacherProfile.websiteUrl,
                    isApproved: teacherProfile.isApproved,
                    createdAt: teacherProfile.createdAt,
                    updatedAt: teacherProfile.updatedAt,
                }
                : null,
        };
    }

    async getProfileByUserId(userId: string): Promise<UserProfile | null> {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });
        return profile;
    }

    async getTeacherProfileByProfileId(profileId: string): Promise<TeacherProfile | null> {
        const profile = await this.prisma.teacherProfile.findUnique({
            where: { profileId },
        });
        return profile;
    }

    async upsertProfile(
        userId: string,
        data: Partial<Omit<UserProfile, "id" | "userId" | "createdAt" | "updatedAt">>
    ): Promise<UserProfile> {
        return await this.prisma.profile.upsert({
            where: { userId },
            create: {
                userId,
                avatar: data.avatar ?? null,
                bio: data.bio ?? null,
                phone: data.phone ?? null,
            },
            update: {
                ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
                ...(data.bio !== undefined ? { bio: data.bio } : {}),
                ...(data.phone !== undefined ? { phone: data.phone } : {}),
            },
        });
    }

    async upsertTeacherProfile(
        profileId: string,
        data: Partial<Omit<TeacherProfile, "id" | "profileId" | "createdAt" | "updatedAt">>
    ): Promise<TeacherProfile> {
        return await this.prisma.teacherProfile.upsert({
            where: { profileId },
            create: {
                profileId,
                expertise: data.expertise ?? [],
                qualifications: data.qualifications ?? null,
                experienceYears: data.experienceYears ?? null,
                linkedinUrl: data.linkedinUrl ?? null,
                twitterUrl: data.twitterUrl ?? null,
                websiteUrl: data.websiteUrl ?? null,
            },
            update: {
                ...(data.expertise !== undefined ? { expertise: data.expertise } : {}),
                ...(data.qualifications !== undefined ? { qualifications: data.qualifications } : {}),
                ...(data.experienceYears !== undefined ? { experienceYears: data.experienceYears } : {}),
                ...(data.linkedinUrl !== undefined ? { linkedinUrl: data.linkedinUrl } : {}),
                ...(data.twitterUrl !== undefined ? { twitterUrl: data.twitterUrl } : {}),
                ...(data.websiteUrl !== undefined ? { websiteUrl: data.websiteUrl } : {}),
            },
        });
    }

    async updateUserName(userId: string, name: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { name },
        });
    }
}
