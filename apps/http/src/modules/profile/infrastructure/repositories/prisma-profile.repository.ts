import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { ProfileRepository } from "../../domain/repositories/profile.repository";
import { FullUserProfile } from "../../domain/entities/profile.entity";
import { StudentProfile } from "../../domain/entities/student-profile.entity";
import { TeacherProfile } from "../../domain/entities/teacher-profile.entity";

export class PrismaProfileRepository implements ProfileRepository {

    constructor(private readonly prisma: PrismaClient = defaultPrisma) { }

    async getFullProfileByUserId(userId: string): Promise<FullUserProfile | null> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: true,
                teacherProfile: true,
            },
        });

        if (!user) return null;

        const { password, ...safeUser } = user;
        return safeUser as FullUserProfile;
    }

    async getStudentProfile(userId: string): Promise<StudentProfile | null> {
        const profile = await this.prisma.studentProfile.findUnique({
            where: { userId },
        });
        return profile;
    }

    async getTeacherProfile(userId: string): Promise<TeacherProfile | null> {
        const profile = await this.prisma.teacherProfile.findUnique({
            where: { userId },
        });
        return profile;
    }

    async upsertStudentProfile(
        userId: string,
        data: Partial<Omit<StudentProfile, "id" | "userId" | "createdAt" | "updatedAt">>
    ): Promise<StudentProfile> {
        return await this.prisma.studentProfile.upsert({
            where: { userId },
            create: {
                userId,
                avatar: data.avatar ?? null,
                bio: data.bio ?? null,
                phone: data.phone ?? null,
                headline: data.headline ?? null,
                education: data.education ?? null,
                interests: data.interests ?? [],
            },
            update: {
                ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
                ...(data.bio !== undefined ? { bio: data.bio } : {}),
                ...(data.phone !== undefined ? { phone: data.phone } : {}),
                ...(data.headline !== undefined ? { headline: data.headline } : {}),
                ...(data.education !== undefined ? { education: data.education } : {}),
                ...(data.interests !== undefined ? { interests: data.interests } : {}),
            },
        });
    }

    async upsertTeacherProfile(
        userId: string,
        data: Partial<Omit<TeacherProfile, "id" | "userId" | "createdAt" | "updatedAt">>
    ): Promise<TeacherProfile> {
        return await this.prisma.teacherProfile.upsert({
            where: { userId },
            create: {
                userId,
                avatar: data.avatar ?? null,
                bio: data.bio ?? null,
                phone: data.phone ?? null,
                headline: data.headline ?? null,
                expertise: data.expertise ?? [],
                qualifications: data.qualifications ?? null,
                experienceYears: data.experienceYears ?? null,
                linkedinUrl: data.linkedinUrl ?? null,
                twitterUrl: data.twitterUrl ?? null,
                websiteUrl: data.websiteUrl ?? null,
            },
            update: {
                ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
                ...(data.bio !== undefined ? { bio: data.bio } : {}),
                ...(data.phone !== undefined ? { phone: data.phone } : {}),
                ...(data.headline !== undefined ? { headline: data.headline } : {}),
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
