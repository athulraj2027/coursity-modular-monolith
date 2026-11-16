import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { PrismaBaseRepository } from "@/shared/infrastructure/repositories/prisma-base.repository";
import {
  TeacherCouponRepository,
  ICouponValidationRepository,
  ITeacherCouponRepository,
  IAdminCouponRepository,
  AdminCouponFilterParams,
  AdminCouponsListResult,
} from "../../domain/repositories/teacher-coupon.repository";
import {
  TeacherCouponEntity,
  CouponDetailsWithRedemptions,
} from "../../domain/entities/teacher-coupon.entity";
import { CreateTeacherCouponDto, UpdateTeacherCouponDto } from "../../domain/dtos/teacher-coupon.dto";

export class PrismaTeacherCouponRepository
  extends PrismaBaseRepository<
    TeacherCouponEntity,
    typeof defaultPrisma.teacherCoupon,
    CreateTeacherCouponDto,
    UpdateTeacherCouponDto,
    AdminCouponFilterParams
  >
  implements
    TeacherCouponRepository,
    ICouponValidationRepository,
    ITeacherCouponRepository,
    IAdminCouponRepository
{
  constructor(prisma: PrismaClient = defaultPrisma) {
    super(prisma, (prisma as any).teacherCoupon);
  }

  protected mapToEntity(record: any): TeacherCouponEntity {
    if (!record) return record;

    const instructorUser = record.teacherProfile?.profile?.user;
    return new TeacherCouponEntity({
      id: record.id,
      code: record.code,
      description: record.description ?? null,
      discountType: record.discountType,
      discountValue: Number(record.discountValue),
      maxDiscountAmount: record.maxDiscountAmount ? Number(record.maxDiscountAmount) : null,
      minOrderAmount: record.minOrderAmount ? Number(record.minOrderAmount) : null,
      teacherProfileId: record.teacherProfileId,
      courseId: record.courseId ?? null,
      maxUses: record.maxUses ?? null,
      usedCount: record.usedCount ?? 0,
      maxUsesPerStudent: record.maxUsesPerStudent ?? 1,
      validFrom: record.validFrom,
      expiresAt: record.expiresAt ?? null,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      courseTitle: record.course?.title || null,
      instructorName: instructorUser?.name || null,
      instructorEmail: instructorUser?.email || null,
      instructorAvatar: record.teacherProfile?.profile?.avatar || null,
      totalDiscountGiven:
        record.enrollments?.reduce(
          (sum: number, e: any) => sum + (Number(e.discountAmount) || 0),
          0
        ) || 0,
    });
  }

  override async create(
    teacherProfileIdOrData: any,
    data?: CreateTeacherCouponDto
  ): Promise<TeacherCouponEntity> {
    const teacherProfileId =
      typeof teacherProfileIdOrData === "string"
        ? teacherProfileIdOrData
        : teacherProfileIdOrData.teacherProfileId;
    const couponData: CreateTeacherCouponDto =
      typeof teacherProfileIdOrData === "string"
        ? data!
        : teacherProfileIdOrData;

    const record = await (this.prisma as any).teacherCoupon.create({
      data: {
        code: couponData.code.trim().toUpperCase(),
        description: couponData.description,
        discountType: couponData.discountType,
        discountValue: couponData.discountValue,
        maxDiscountAmount: couponData.maxDiscountAmount,
        minOrderAmount: couponData.minOrderAmount,
        courseId: couponData.courseId || null,
        teacherProfileId,
        maxUses: couponData.maxUses,
        maxUsesPerStudent: couponData.maxUsesPerStudent || 1,
        validFrom: couponData.validFrom || new Date(),
        expiresAt: couponData.expiresAt || null,
        isActive: couponData.isActive !== undefined ? couponData.isActive : true,
      },
      include: {
        course: { select: { title: true } },
        teacherProfile: {
          include: {
            profile: {
              include: { user: true },
            },
          },
        },
      },
    });
    return this.mapToEntity(record);
  }

  async findById(id: string): Promise<TeacherCouponEntity | null> {
    const record = await (this.prisma as any).teacherCoupon.findUnique({
      where: { id },
      include: {
        course: { select: { title: true } },
        teacherProfile: {
          include: {
            profile: {
              include: { user: true },
            },
          },
        },
        enrollments: {
          select: { discountAmount: true },
        },
      },
    });
    return record ? this.mapToEntity(record) : null;
  }

  async findByCodeAndTeacher(teacherProfileId: string, code: string): Promise<TeacherCouponEntity | null> {
    const record = await (this.prisma as any).teacherCoupon.findFirst({
      where: {
        teacherProfileId,
        code: code.trim().toUpperCase(),
      },
      include: {
        course: { select: { title: true } },
        teacherProfile: {
          include: {
            profile: {
              include: { user: true },
            },
          },
        },
      },
    });
    return record ? this.mapToEntity(record) : null;
  }

  async findByCode(code: string): Promise<TeacherCouponEntity | null> {
    const record = await (this.prisma as any).teacherCoupon.findFirst({
      where: {
        code: code.trim().toUpperCase(),
      },
      include: {
        course: { select: { title: true } },
        teacherProfile: {
          include: {
            profile: {
              include: { user: true },
            },
          },
        },
      },
    });
    return record ? this.mapToEntity(record) : null;
  }

  async listByTeacher(
    teacherProfileId: string,
    options?: { courseId?: string; isActive?: boolean }
  ): Promise<TeacherCouponEntity[]> {
    const where: any = { teacherProfileId };
    if (options?.courseId) where.courseId = options.courseId;
    if (options?.isActive !== undefined) where.isActive = options.isActive;

    const records = await (this.prisma as any).teacherCoupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        course: { select: { title: true } },
        teacherProfile: {
          include: {
            profile: {
              include: { user: true },
            },
          },
        },
        enrollments: {
          select: { discountAmount: true },
        },
      },
    });
    return records.map(this.mapToEntity.bind(this));
  }

  /**
   * Optimized admin listing using database-level aggregations instead of in-memory full table scanning.
   */
  async listAllCoupons(filters?: AdminCouponFilterParams): Promise<AdminCouponsListResult> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    if (filters?.discountType) {
      where.discountType = filters.discountType;
    }
    if (filters?.teacherProfileId) {
      where.teacherProfileId = filters.teacherProfileId;
    }
    if (filters?.courseId) {
      where.courseId = filters.courseId;
    }

    if (filters?.search && filters.search.trim() !== "") {
      const q = filters.search.trim();
      where.OR = [
        { code: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { course: { title: { contains: q, mode: "insensitive" } } },
        {
          teacherProfile: {
            profile: {
              user: {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { email: { contains: q, mode: "insensitive" } },
                ],
              },
            },
          },
        },
      ];
    }

    const sortField = filters?.sortBy || "createdAt";
    const sortOrder = filters?.sortOrder || "desc";
    const orderBy: any = { [sortField]: sortOrder };

    const [records, total, totalCoupons, activeCoupons, redemptionsAgg, discountAgg] =
      await Promise.all([
        (this.prisma as any).teacherCoupon.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            course: { select: { title: true } },
            teacherProfile: {
              include: {
                profile: {
                  include: { user: true },
                },
              },
            },
            enrollments: {
              select: { discountAmount: true },
            },
          },
        }),
        (this.prisma as any).teacherCoupon.count({ where }),
        (this.prisma as any).teacherCoupon.count(),
        (this.prisma as any).teacherCoupon.count({ where: { isActive: true } }),
        (this.prisma as any).teacherCoupon.aggregate({
          _sum: { usedCount: true },
        }),
        (this.prisma as any).courseEnrollment.aggregate({
          where: {
            teacherCouponId: { not: null },
            status: { not: "REFUNDED" },
          },
          _sum: {
            discountAmount: true,
          },
        }),
      ]);

    const totalRedemptions = Number(redemptionsAgg?._sum?.usedCount || 0);
    const totalDiscountGiven = Number(discountAgg?._sum?.discountAmount || 0);

    return {
      items: records.map(this.mapToEntity.bind(this)),
      total,
      metrics: {
        totalCoupons,
        activeCoupons,
        totalRedemptions,
        totalDiscountGiven,
      },
    };
  }

  async update(id: string, data: UpdateTeacherCouponDto): Promise<TeacherCouponEntity> {
    const record = await (this.prisma as any).teacherCoupon.update({
      where: { id },
      data: {
        ...(data.description !== undefined && { description: data.description }),
        ...(data.discountType !== undefined && { discountType: data.discountType }),
        ...(data.discountValue !== undefined && { discountValue: data.discountValue }),
        ...(data.maxDiscountAmount !== undefined && { maxDiscountAmount: data.maxDiscountAmount }),
        ...(data.minOrderAmount !== undefined && { minOrderAmount: data.minOrderAmount }),
        ...(data.courseId !== undefined && { courseId: data.courseId }),
        ...(data.maxUses !== undefined && { maxUses: data.maxUses }),
        ...(data.maxUsesPerStudent !== undefined && { maxUsesPerStudent: data.maxUsesPerStudent }),
        ...(data.validFrom !== undefined && { validFrom: data.validFrom }),
        ...(data.expiresAt !== undefined && { expiresAt: data.expiresAt }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        course: { select: { title: true } },
        teacherProfile: {
          include: {
            profile: {
              include: { user: true },
            },
          },
        },
        enrollments: {
          select: { discountAmount: true },
        },
      },
    });
    return this.mapToEntity(record);
  }

  override async delete(id: string): Promise<boolean> {
    await (this.prisma as any).teacherCoupon.delete({ where: { id } });
    return true;
  }

  async incrementUsedCount(id: string): Promise<void> {
    await (this.prisma as any).teacherCoupon.update({
      where: { id },
      data: { usedCount: { increment: 1 } },
    });
  }

  async getStudentUsageCount(couponId: string, studentId: string): Promise<number> {
    return (this.prisma as any).courseEnrollment.count({
      where: {
        teacherCouponId: couponId,
        studentId,
        status: { not: "REFUNDED" },
      },
    });
  }

  async findCouponWithRedemptions(id: string): Promise<CouponDetailsWithRedemptions | null> {
    const record = await (this.prisma as any).teacherCoupon.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true, slug: true, price: true, thumbnail: true } },
        teacherProfile: {
          include: {
            profile: {
              include: { user: true },
            },
          },
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                profile: { select: { avatar: true } },
              },
            },
            course: {
              select: { title: true, slug: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!record) return null;

    const baseEntity = this.mapToEntity(record);
    const mappedRedemptions = (record.enrollments || []).map((e: any) => ({
      id: e.id,
      studentId: e.studentId,
      studentName: e.student?.name || "Student",
      studentEmail: e.student?.email || "",
      studentAvatar: e.student?.profile?.avatar || null,
      courseTitle: e.course?.title || record.course?.title || "Course",
      discountAmount: Number(e.discountAmount),
      finalAmount: Number(e.finalAmount),
      paymentMethod: e.paymentMethod,
      enrolledAt: e.enrolledAt || e.createdAt,
      status: e.status,
    }));

    return {
      ...baseEntity,
      courseSlug: record.course?.slug || null,
      coursePrice: record.course?.price ? Number(record.course.price) : null,
      courseThumbnail: record.course?.thumbnail || null,
      redemptions: mappedRedemptions,
    };
  }
}
