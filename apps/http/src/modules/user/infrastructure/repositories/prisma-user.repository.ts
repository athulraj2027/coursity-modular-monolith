import { PrismaClient } from "@prisma/client";
import {
    CreateUserData,
    FindUsersOptions,
    PaginatedUsersResult,
    UserRepository,
} from "../../domain/repositories/user.repository";
import { User, UserRole, AuthProvider, ApprovalStatus } from "../../domain/entities/user.entity";
import defaultPrisma from "@/infrastructure/database/prisma.client";

export class PrismaUserRepository implements UserRepository {
    constructor(
        private readonly prisma: PrismaClient = defaultPrisma,
    ) { }

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                profile: {
                    include: {
                        teacherProfile: true,
                    },
                },
            },
        });
        if (!user) return null;
        return this.mapToEntity(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
            include: {
                profile: {
                    include: {
                        teacherProfile: true,
                    },
                },
            },
        });
        if (!user) return null;
        return this.mapToEntity(user);
    }

    async create(data: CreateUserData): Promise<User> {
        const user = await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email.toLowerCase().trim(),
                password: data.password ?? null,
                role: data.role as any,
                authProvider: data.authProvider as any,
            },
            include: {
                profile: {
                    include: {
                        teacherProfile: true,
                    },
                },
            },
        });
        return this.mapToEntity(user);
    }

    async update(id: string, data: Partial<Omit<User, "id" | "createdAt">>): Promise<User> {
        const user = await this.prisma.user.update({
            where: { id },
            data: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.email !== undefined ? { email: data.email.toLowerCase().trim() } : {}),
                ...(data.password !== undefined ? { password: data.password } : {}),
                ...(data.role !== undefined ? { role: data.role as any } : {}),
                ...(data.authProvider !== undefined ? { authProvider: data.authProvider as any } : {}),
                ...(data.isBlocked !== undefined ? { isBlocked: data.isBlocked } : {}),
            },
            include: {
                profile: {
                    include: {
                        teacherProfile: true,
                    },
                },
            },
        });
        return this.mapToEntity(user);
    }

    async updatePassword(id: string, newPasswordHash: string): Promise<User> {
        return this.update(id, { password: newPasswordHash });
    }

    async updateBlockStatus(id: string, isBlocked: boolean): Promise<User> {
        return this.update(id, { isBlocked });
    }

    async updateTeacherApproval(
        userId: string,
        data:
            | {
                  approvalStatus?: ApprovalStatus;
                  isApproved?: boolean;
                  rejectionReason?: string | null;
              }
            | boolean
    ): Promise<User> {
        let approvalStatus: ApprovalStatus = "PENDING";
        let isApproved = false;
        let rejectionReason: string | null = null;

        if (typeof data === "boolean") {
            isApproved = data;
            approvalStatus = data ? "VERIFIED" : "REVOKED";
        } else {
            if (data.approvalStatus) {
                approvalStatus = data.approvalStatus;
                isApproved = data.approvalStatus === "VERIFIED";
            } else if (data.isApproved !== undefined) {
                isApproved = Boolean(data.isApproved);
                approvalStatus = data.isApproved ? "VERIFIED" : "REVOKED";
            }
            if (data.rejectionReason !== undefined) {
                rejectionReason = data.rejectionReason;
            }
        }

        let profile = await this.prisma.profile.findUnique({
            where: { userId },
            include: { teacherProfile: true },
        });

        const isVerified =
            String(approvalStatus).toUpperCase() === "VERIFIED" || isApproved === true;

        if (!profile) {
            profile = await this.prisma.profile.create({
                data: {
                    userId,
                    teacherProfile: {
                        create: {
                            isApproved,
                            approvalStatus: approvalStatus as any,
                            rejectionReason,
                            submissionCount: isVerified ? 0 : 0,
                        },
                    },
                },
                include: { teacherProfile: true },
            });
        } else if (!profile.teacherProfile) {
            await this.prisma.teacherProfile.create({
                data: {
                    profileId: profile.id,
                    isApproved,
                    approvalStatus: approvalStatus as any,
                    rejectionReason,
                    submissionCount: isVerified ? 0 : 0,
                },
            });
        } else {
            await this.prisma.teacherProfile.update({
                where: { profileId: profile.id },
                data: {
                    isApproved,
                    approvalStatus: approvalStatus as any,
                    rejectionReason,
                    submissionCount: isVerified ? 0 : profile.teacherProfile.submissionCount,
                },
            });
        }

        const updatedUser = await this.findById(userId);
        if (!updatedUser) {
            throw new Error(`User with id ${userId} not found`);
        }
        return updatedUser;
    }

    async findMany(options: FindUsersOptions = {}): Promise<PaginatedUsersResult> {
        const page = Math.max(1, options.page || 1);
        const limit = Math.max(1, Math.min(100, options.limit || 10));
        const skip = (page - 1) * limit;

        const andConditions: any[] = [];

        if (options.role) {
            andConditions.push({ role: options.role });
        }

        if (options.authProvider) {
            andConditions.push({ authProvider: options.authProvider });
        }

        if (options.isBlocked !== undefined) {
            andConditions.push({ isBlocked: options.isBlocked });
        }

        if (options.approvalStatus) {
            if (!options.role) {
                andConditions.push({ role: "TEACHER" });
            }
            andConditions.push({
                profile: {
                    teacherProfile: {
                        approvalStatus: options.approvalStatus,
                    },
                },
            });
        } else if (options.isApproved !== undefined) {
            if (!options.role) {
                andConditions.push({ role: "TEACHER" });
            }

            const isApprovedBool = options.isApproved === true || (options.isApproved as any) === "true";
            if (isApprovedBool) {
                andConditions.push({
                    profile: {
                        teacherProfile: {
                            OR: [
                                { isApproved: true },
                                { approvalStatus: "VERIFIED" },
                            ],
                        },
                    },
                });
            } else {
                andConditions.push({
                    OR: [
                        { profile: null },
                        { profile: { teacherProfile: null } },
                        {
                            profile: {
                                teacherProfile: {
                                    AND: [
                                        { isApproved: false },
                                        { approvalStatus: { not: "VERIFIED" } },
                                    ],
                                },
                            },
                        },
                    ],
                });
            }
        }

        if (options.search && options.search.trim() !== "") {
            const search = options.search.trim();
            andConditions.push({
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                ],
            });
        }

        const where = andConditions.length > 0 ? { AND: andConditions } : {};

        const sortBy = options.sortBy || "createdAt";
        const sortOrder = options.sortOrder || "desc";

        const [users, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder,
                },
                include: {
                    profile: {
                        include: {
                            teacherProfile: true,
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        const sanitizedUsers = users.map((u) => {
            const entity = this.mapToEntity(u);
            const { password, ...safeUser } = entity;
            return safeUser as Omit<User, "password">;
        });

        return {
            users: sanitizedUsers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }

    async delete(id: string): Promise<boolean> {
        try {
            await this.prisma.user.delete({
                where: { id },
            });
            return true;
        } catch {
            return false;
        }
    }

    async count(where?: any): Promise<number> {
        return this.prisma.user.count({ where });
    }

    private mapToEntity(raw: any): User {
        const rawTeacherProfile = raw.profile?.teacherProfile;
        const isTeacherVerified = Boolean(
            rawTeacherProfile &&
            rawTeacherProfile.approvalStatus === "VERIFIED"
        );

        return {
            id: raw.id,
            name: raw.name,
            email: raw.email,
            password: raw.password,
            role: raw.role as UserRole,
            authProvider: raw.authProvider as AuthProvider,
            isBlocked: Boolean(raw.isBlocked),
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            profile: raw.profile
                ? {
                      id: raw.profile.id,
                      avatar: raw.profile.avatar ?? null,
                      bio: raw.profile.bio ?? null,
                      phone: raw.profile.phone ?? null,
                      teacherProfile: rawTeacherProfile
                          ? {
                                id: rawTeacherProfile.id,
                                expertise: rawTeacherProfile.expertise || [],
                                qualifications: rawTeacherProfile.qualifications ?? null,
                                experienceYears: rawTeacherProfile.experienceYears ?? null,
                                linkedinUrl: rawTeacherProfile.linkedinUrl ?? null,
                                twitterUrl: rawTeacherProfile.twitterUrl ?? null,
                                websiteUrl: rawTeacherProfile.websiteUrl ?? null,
                                isApproved: isTeacherVerified,
                                approvalStatus:
                                    (rawTeacherProfile.approvalStatus as ApprovalStatus) ||
                                    (rawTeacherProfile.isApproved ? "VERIFIED" : "PENDING"),
                                rejectionReason: rawTeacherProfile.rejectionReason ?? null,
                                submissionCount: isTeacherVerified
                                    ? 0
                                    : ((rawTeacherProfile as any).submissionCount ?? 0),
                                createdAt: rawTeacherProfile.createdAt,
                                updatedAt: rawTeacherProfile.updatedAt,
                            }
                          : null,
                      createdAt: raw.profile.createdAt,
                      updatedAt: raw.profile.updatedAt,
                  }
                : null,
        };
    }
}