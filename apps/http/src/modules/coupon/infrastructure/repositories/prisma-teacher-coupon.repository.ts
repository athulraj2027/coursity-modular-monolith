import { PrismaClient } from "@prisma/client";
import { TeacherCouponRepository } from "../../domain/repositories/teacher-coupon.repository";
import { TeacherCouponEntity } from "../../domain/entities/teacher-coupon.entity";
import { CreateTeacherCouponDto, UpdateTeacherCouponDto } from "../../domain/dtos/teacher-coupon.dto";

export class PrismaTeacherCouponRepository implements TeacherCouponRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToEntity(record: any): TeacherCouponEntity {
    const instructorUser = record.teacherProfile?.profile?.user;
    return {
      id: record.id,
      code: record.code,
      description: record.description,
      discountType: record.discountType,
      discountValue: Number(record.discountValue),
      maxDiscountAmount: record.maxDiscountAmount ? Number(record.maxDiscountAmount) : null,
      minOrderAmount: record.minOrderAmount ? Number(record.minOrderAmount) : null,
      teacherProfileId: record.teacherProfileId,
      courseId: record.courseId,
      maxUses: record.maxUses,
      usedCount: record.usedCount,
      maxUsesPerStudent: record.maxUsesPerStudent,
      validFrom: record.validFrom,
      expiresAt: record.expiresAt,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      courseTitle: record.course?.title || null,
      instructorName: instructorUser?.name || null,
      instructorEmail: instructorUser?.email || null,
      instructorAvatar: record.teacherProfile?.profile?.avatar || null,
      totalDiscountGiven: record.enrollments?.reduce(
        (sum: number, e: any) => sum + (Number(e.discountAmount) || 0),
        0
      ) || 0,
    };
  }

  async create(teacherProfileId: string, data: CreateTeacherCouponDto): Promise<TeacherCouponEntity> {
    const record = await this.prisma.teacherCoupon.create({
      data: {
        code: data.code.trim().toUpperCase(),
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxDiscountAmount: data.maxDiscountAmount,
        minOrderAmount: data.minOrderAmount,
        courseId: data.courseId || null,
        teacherProfileId,
        maxUses: data.maxUses,
        maxUsesPerStudent: data.maxUsesPerStudent || 1,
        validFrom: data.validFrom || new Date(),
        expiresAt: data.expiresAt || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
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
    const record = await this.prisma.teacherCoupon.findUnique({
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
    const record = await this.prisma.teacherCoupon.findFirst({
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
    const record = await this.prisma.teacherCoupon.findFirst({
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

    const records = await this.prisma.teacherCoupon.findMany({
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

  async listAllCoupons(filters?: {
    search?: string;
    isActive?: boolean;
    discountType?: "PERCENTAGE" | "FLAT";
    teacherProfileId?: string;
    courseId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{
    items: TeacherCouponEntity[];
    total: number;
    metrics: {
      totalCoupons: number;
      activeCoupons: number;
      totalRedemptions: number;
      totalDiscountGiven: number;
    };
  }> {
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

    const [records, total, allCouponsForMetrics, allEnrollmentsWithCoupon] = await Promise.all([
      this.prisma.teacherCoupon.findMany({
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
      this.prisma.teacherCoupon.count({ where }),
      this.prisma.teacherCoupon.findMany({
        select: {
          id: true,
          isActive: true,
          usedCount: true,
        },
      }),
      this.prisma.courseEnrollment.aggregate({
        where: {
          teacherCouponId: { not: null },
          status: { not: "REFUNDED" },
        },
        _sum: {
          discountAmount: true,
        },
      }),
    ]);

    const totalCoupons = allCouponsForMetrics.length;
    const activeCoupons = allCouponsForMetrics.filter((c) => c.isActive).length;
    const totalRedemptions = allCouponsForMetrics.reduce((sum, c) => sum + c.usedCount, 0);
    const totalDiscountGiven = Number(allEnrollmentsWithCoupon._sum.discountAmount || 0);

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
    const record = await this.prisma.teacherCoupon.update({
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

  async delete(id: string): Promise<void> {
    await this.prisma.teacherCoupon.delete({ where: { id } });
  }

  async incrementUsedCount(id: string): Promise<void> {
    await this.prisma.teacherCoupon.update({
      where: { id },
      data: { usedCount: { increment: 1 } },
    });
  }

  async getStudentUsageCount(couponId: string, studentId: string): Promise<number> {
    return this.prisma.courseEnrollment.count({
      where: {
        teacherCouponId: couponId,
        studentId,
        status: { not: "REFUNDED" },
      },
    });
  }
}

