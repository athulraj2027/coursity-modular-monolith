import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { ICourseRepository } from "../../domain/repositories/course.repository";
import {
  CourseEntity,
  CourseFilterParams,
  CourseMetrics,
} from "../../domain/entities/course.entity";
import { CreateCourseDTO, UpdateCourseDTO } from "../../domain/dtos/course.dto";

export class PrismaCourseRepository implements ICourseRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  private getInclude(includeCurriculum = false) {
    return {
      teacherProfile: {
        include: {
          profile: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      category: true,
      subcategory: true,
      ...(includeCurriculum
        ? {
            modules: {
              orderBy: { sortOrder: "asc" as const },
              include: {
                lessons: {
                  orderBy: { sortOrder: "asc" as const },
                },
              },
            },
          }
        : {
            _count: {
              select: {
                modules: true,
              },
            },
          }),
    };
  }

  async findById(id: string, includeDeleted = false, includeCurriculum = false): Promise<CourseEntity | null> {
    const where: any = { id };
    if (!includeDeleted) {
      where.isDeleted = false;
    }

    const course = await (this.prisma as any).course.findFirst({
      where,
      include: this.getInclude(includeCurriculum),
    });

    return course as CourseEntity | null;
  }

  async findBySlug(slug: string, includeDeleted = false, includeCurriculum = true): Promise<CourseEntity | null> {
    const where: any = {
      OR: [{ slug }, { id: slug }],
    };
    if (!includeDeleted) {
      where.isDeleted = false;
    }

    const course = await (this.prisma as any).course.findFirst({
      where,
      include: this.getInclude(includeCurriculum),
    });

    return course as CourseEntity | null;
  }

  async findMany(params: CourseFilterParams = {}): Promise<{ items: CourseEntity[]; total: number }> {
    const where: any = {};

    // Soft delete
    if (params.isDeleted !== undefined) {
      where.isDeleted = params.isDeleted;
    } else if (!params.includeDeleted) {
      where.isDeleted = false;
    }

    // Status
    if (params.status) {
      where.status = params.status;
    }

    // Teacher
    if (params.teacherProfileId) {
      where.teacherProfileId = params.teacherProfileId;
    }

    // Category & Subcategory
    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }
    if (params.subcategoryId) {
      where.subcategoryId = params.subcategoryId;
    }

    // Level, Pricing & Language
    if (params.level) {
      where.level = params.level;
    }
    if (params.pricingType) {
      where.pricingType = params.pricingType;
    }
    if (params.language) {
      where.language = params.language;
    }

    // Price range
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.price = {};
      if (params.minPrice !== undefined) where.price.gte = params.minPrice;
      if (params.maxPrice !== undefined) where.price.lte = params.maxPrice;
    }

    // Featured / Trending
    if (params.isFeatured !== undefined) {
      where.isFeatured = params.isFeatured;
    }
    if (params.isTrending !== undefined) {
      where.isTrending = params.isTrending;
    }

    // Search query
    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { subtitle: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
      ];
    }

    // Order By
    const sortBy = params.sortBy || "sortOrder";
    const sortOrder = params.sortOrder || "asc";
    const orderBy = { [sortBy]: sortOrder };

    const total = await (this.prisma as any).course.count({ where });

    const take = params.limit;
    const skip = params.page && params.limit ? (params.page - 1) * params.limit : undefined;

    const items = await (this.prisma as any).course.findMany({
      where,
      orderBy,
      take,
      skip,
      include: this.getInclude(false),
    });

    return { items: items as CourseEntity[], total };
  }

  async create(data: CreateCourseDTO): Promise<CourseEntity> {
    const slug = data.slug || this.generateSlug(data.title);

    const initialModules = data.modules || [];
    const created = await (this.prisma as any).course.create({
      data: {
        title: data.title,
        slug,
        subtitle: data.subtitle,
        description: data.description,
        thumbnail: data.thumbnail,
        promoVideoUrl: data.promoVideoUrl,
        startingDate: data.startingDate ? new Date(data.startingDate) : null,
        level: data.level || "ALL_LEVELS",
        language: data.language || "English",
        pricingType: data.pricingType || "FREE",
        price: data.pricingType === "FREE" ? 0 : data.price || 0,
        currency: data.currency || "INR",
        learningOutcomes: data.learningOutcomes || [],
        requirements: data.requirements || [],
        targetAudience: data.targetAudience || [],
        tags: data.tags || [],
        teacherProfileId: data.teacherProfileId,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId || null,
        status: data.status || "PUBLISHED",
        isApproved: true,
        publishedAt: new Date(),
        totalModules: initialModules.length,
        totalLessons: initialModules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0),
        totalDurationSeconds: initialModules.reduce(
          (acc, m) => acc + (m.lessons?.reduce((lAcc, l) => lAcc + (l.durationSeconds || 0), 0) || 0),
          0
        ),
        ...(initialModules.length > 0
          ? {
              modules: {
                create: initialModules.map((m, mIdx) => ({
                  title: m.title,
                  description: m.description,
                  sortOrder: m.sortOrder ?? mIdx,
                  lessons: {
                    create: (m.lessons || []).map((l, lIdx) => ({
                      title: l.title,
                      description: l.description,
                      lessonType: l.lessonType || "VIDEO",
                      durationSeconds: l.durationSeconds || 0,
                      sortOrder: l.sortOrder ?? lIdx,
                      isFreePreview: l.isFreePreview ?? false,
                      videoUrl: l.videoUrl,
                      videoProvider: l.videoProvider,
                      videoThumbnail: l.videoThumbnail,
                      articleBody: l.articleBody,
                      attachments: l.attachments || [],
                    })),
                  },
                })),
              },
            }
          : {}),
      },
      include: this.getInclude(true),
    });

    return created as CourseEntity;
  }

  async update(id: string, data: UpdateCourseDTO): Promise<CourseEntity> {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
    if (data.promoVideoUrl !== undefined) updateData.promoVideoUrl = data.promoVideoUrl;
    if (data.startingDate !== undefined) updateData.startingDate = data.startingDate ? new Date(data.startingDate) : null;
    if (data.level !== undefined) updateData.level = data.level;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.pricingType !== undefined) {
      updateData.pricingType = data.pricingType;
      if (data.pricingType === "FREE") {
        updateData.price = 0;
      }
    }
    if (data.price !== undefined && data.pricingType !== "FREE") {
      updateData.price = data.price;
    }
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.learningOutcomes !== undefined) updateData.learningOutcomes = data.learningOutcomes;
    if (data.requirements !== undefined) updateData.requirements = data.requirements;
    if (data.targetAudience !== undefined) updateData.targetAudience = data.targetAudience;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.subcategoryId !== undefined) updateData.subcategoryId = data.subcategoryId;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.isTrending !== undefined) updateData.isTrending = data.isTrending;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    const updated = await (this.prisma as any).course.update({
      where: { id },
      data: updateData,
      include: this.getInclude(false),
    });

    return updated as CourseEntity;
  }

  async updateStatus(
    id: string,
    status: CourseEntity["status"],
    extras: {
      rejectionReason?: string | null;
      isApproved?: boolean;
      approvedByAdminId?: string | null;
      publishedAt?: Date | null;
      submittedAt?: Date | null;
    } = {}
  ): Promise<CourseEntity> {
    const data: any = { status };

    if (extras.rejectionReason !== undefined) data.rejectionReason = extras.rejectionReason;
    if (extras.isApproved !== undefined) data.isApproved = extras.isApproved;
    if (extras.approvedByAdminId !== undefined) data.approvedByAdminId = extras.approvedByAdminId;
    if (extras.publishedAt !== undefined) data.publishedAt = extras.publishedAt;
    if (extras.submittedAt !== undefined) data.submittedAt = extras.submittedAt;

    const updated = await (this.prisma as any).course.update({
      where: { id },
      data,
      include: this.getInclude(false),
    });

    return updated as CourseEntity;
  }

  async softDelete(id: string, delistReason?: string): Promise<CourseEntity> {
    const updated = await (this.prisma as any).course.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: "ARCHIVED",
        delistReason: delistReason || null,
        delistedAt: new Date(),
      },
      include: this.getInclude(false),
    });
    return updated as CourseEntity;
  }

  async restore(id: string): Promise<CourseEntity> {
    const updated = await (this.prisma as any).course.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        status: "PUBLISHED",
        isApproved: true,
        delistReason: null,
        delistedAt: null,
        isFrozen: false,
        freezeReason: null,
        frozenAt: null,
      },
      include: this.getInclude(false),
    });
    return updated as CourseEntity;
  }

  async freeze(id: string, freezeReason: string): Promise<CourseEntity> {
    const updated = await (this.prisma as any).course.update({
      where: { id },
      data: {
        isFrozen: true,
        frozenAt: new Date(),
        freezeReason,
        status: "FROZEN",
      },
      include: this.getInclude(false),
    });
    return updated as CourseEntity;
  }

  async unfreeze(id: string): Promise<CourseEntity> {
    const updated = await (this.prisma as any).course.update({
      where: { id },
      data: {
        isFrozen: false,
        frozenAt: null,
        freezeReason: null,
        status: "PUBLISHED",
      },
      include: this.getInclude(false),
    });
    return updated as CourseEntity;
  }

  async hardDelete(id: string): Promise<boolean> {
    await (this.prisma as any).course.delete({
      where: { id },
    });
    return true;
  }

  async getMetrics(teacherProfileId?: string): Promise<CourseMetrics> {
    const baseWhere: any = { isDeleted: false };
    if (teacherProfileId) {
      baseWhere.teacherProfileId = teacherProfileId;
    }

    const [total, published, draft, archived, frozen, featured, freeCourses, paidCourses] =
      await Promise.all([
        (this.prisma as any).course.count({ where: baseWhere }),
        (this.prisma as any).course.count({ where: { ...baseWhere, status: "PUBLISHED" } }),
        (this.prisma as any).course.count({ where: { ...baseWhere, status: "DRAFT" } }),
        (this.prisma as any).course.count({ where: { isDeleted: true, ...(teacherProfileId ? { teacherProfileId } : {}) } }),
        (this.prisma as any).course.count({ where: { ...baseWhere, isFrozen: true } }),
        (this.prisma as any).course.count({ where: { ...baseWhere, isFeatured: true } }),
        (this.prisma as any).course.count({ where: { ...baseWhere, pricingType: "FREE" } }),
        (this.prisma as any).course.count({ where: { ...baseWhere, pricingType: { not: "FREE" } } }),
      ]);

    return {
      total,
      published,
      draft,
      archived,
      frozen,
      featured,
      freeCourses,
      paidCourses,
    };
  }

  async countByTeacher(teacherProfileId: string, status?: CourseEntity["status"]): Promise<number> {
    const where: any = { teacherProfileId, isDeleted: false };
    if (status) {
      where.status = status;
    }
    return (this.prisma as any).course.count({ where });
  }

  private generateSlug(title: string): string {
    const base = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `${base}-${randomSuffix}`;
  }
}
