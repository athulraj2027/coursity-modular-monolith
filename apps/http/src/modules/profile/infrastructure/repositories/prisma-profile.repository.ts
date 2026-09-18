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
        const isTeacherVerified = Boolean(
            teacherProfile &&
            teacherProfile.approvalStatus === "VERIFIED"
        );

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
                    resume: teacherProfile.resume ?? null,
                    linkedinUrl: teacherProfile.linkedinUrl,
                    twitterUrl: teacherProfile.twitterUrl,
                    websiteUrl: teacherProfile.websiteUrl,
                    isApproved: isTeacherVerified,
                    approvalStatus:
                        teacherProfile.approvalStatus ||
                        (teacherProfile.isApproved ? "VERIFIED" : "PENDING"),
                    rejectionReason: teacherProfile.rejectionReason ?? null,
                    submissionCount: isTeacherVerified
                        ? 0
                        : (teacherProfile.submissionCount ?? 0),
                    isInterviewPassed: Boolean(teacherProfile.isInterviewPassed),
                    interviewScore:
                        teacherProfile.interviewScore !== null &&
                        teacherProfile.interviewScore !== undefined
                            ? Number(teacherProfile.interviewScore)
                            : null,
                    interviewFeedback: teacherProfile.interviewFeedback ?? null,
                    interviewAttempts: teacherProfile.interviewAttempts ?? 0,
                    lastInterviewAt: teacherProfile.lastInterviewAt ?? null,
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
        const isVerified =
            data.approvalStatus === "VERIFIED" || data.isApproved === true;
        const effectiveIsApproved = data.isApproved !== undefined
            ? Boolean(data.isApproved)
            : data.approvalStatus !== undefined
            ? data.approvalStatus === "VERIFIED"
            : false;

        return await this.prisma.teacherProfile.upsert({
            where: { profileId },
            create: {
                profileId,
                expertise: data.expertise ?? [],
                qualifications: data.qualifications ?? null,
                experienceYears: data.experienceYears ?? null,
                resume: data.resume ?? null,
                linkedinUrl: data.linkedinUrl ?? null,
                twitterUrl: data.twitterUrl ?? null,
                websiteUrl: data.websiteUrl ?? null,
                isApproved: effectiveIsApproved,
                approvalStatus: data.approvalStatus ?? "PENDING",
                rejectionReason: data.rejectionReason ?? null,
                submissionCount: isVerified ? 0 : (data.submissionCount ?? 0),
            },
            update: {
                ...(data.expertise !== undefined ? { expertise: data.expertise } : {}),
                ...(data.qualifications !== undefined ? { qualifications: data.qualifications } : {}),
                ...(data.experienceYears !== undefined ? { experienceYears: data.experienceYears } : {}),
                ...(data.resume !== undefined ? { resume: data.resume } : {}),
                ...(data.linkedinUrl !== undefined ? { linkedinUrl: data.linkedinUrl } : {}),
                ...(data.twitterUrl !== undefined ? { twitterUrl: data.twitterUrl } : {}),
                ...(data.websiteUrl !== undefined ? { websiteUrl: data.websiteUrl } : {}),
                ...(data.isApproved !== undefined
                    ? { isApproved: Boolean(data.isApproved) }
                    : data.approvalStatus !== undefined
                    ? { isApproved: data.approvalStatus === "VERIFIED" }
                    : {}),
                ...(data.approvalStatus !== undefined ? { approvalStatus: data.approvalStatus } : {}),
                ...(data.rejectionReason !== undefined ? { rejectionReason: data.rejectionReason } : {}),
                ...(isVerified
                    ? { submissionCount: 0 }
                    : data.submissionCount !== undefined
                    ? { submissionCount: data.submissionCount }
                    : {}),
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
