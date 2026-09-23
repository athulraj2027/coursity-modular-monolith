import { PrismaClient, Prisma } from "@prisma/client";
import { IOfferRepository } from "../../domain/repositories/offer.repository";
import {
  OfferEntity,
  OfferRedemptionEntity,
} from "../../domain/entities/offer.entity";
import {
  CreateOfferDto,
  UpdateOfferDto,
  ListOffersQueryDto,
  RecordRedemptionDto,
  OfferAnalyticsDto,
} from "../../domain/dtos/offer.dto";

export class PrismaOfferRepository implements IOfferRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToEntity(raw: any): OfferEntity {
    return {
      id: raw.id,
      title: raw.title,
      description: raw.description,
      discountType: raw.discountType,
      discountValue: Number(raw.discountValue),
      maxDiscountAmount: raw.maxDiscountAmount ? Number(raw.maxDiscountAmount) : null,
      minOrderAmount: raw.minOrderAmount ? Number(raw.minOrderAmount) : null,
      eligibility: raw.eligibility,
      badgeText: raw.badgeText,
      maxRedemptions: raw.maxRedemptions,
      usedRedemptions: raw.usedRedemptions,
      maxRedemptionsPerUser: raw.maxRedemptionsPerUser,
      validFrom: raw.validFrom,
      validUntil: raw.validUntil,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      applicablePlans: raw.applicablePlans?.map((ap: any) => ({
        id: ap.id,
        offerId: ap.offerId,
        planId: ap.planId,
        plan: ap.plan
          ? {
              id: ap.plan.id,
              name: ap.plan.name,
              slug: ap.plan.slug,
              price: Number(ap.plan.price),
            }
          : undefined,
        createdAt: ap.createdAt,
      })),
      applicableCycles: raw.applicableCycles?.map((ac: any) => ({
        id: ac.id,
        offerId: ac.offerId,
        billingCycle: ac.billingCycle,
        createdAt: ac.createdAt,
      })),
      redemptions: raw.redemptions?.map((r: any) => ({
        id: r.id,
        offerId: r.offerId,
        teacherProfileId: r.teacherProfileId,
        subscriptionId: r.subscriptionId,
        invoiceId: r.invoiceId,
        discountAmount: Number(r.discountAmount),
        finalPaidAmount: Number(r.finalPaidAmount),
        redeemedAt: r.redeemedAt,
        offer: r.offer ? { id: r.offer.id, title: r.offer.title } : undefined,
        teacherProfile: r.teacherProfile
          ? {
              id: r.teacherProfile.id,
              profile: r.teacherProfile.profile
                ? {
                    user: r.teacherProfile.profile.user
                      ? {
                          name: r.teacherProfile.profile.user.name,
                          email: r.teacherProfile.profile.user.email,
                        }
                      : undefined,
                  }
                : undefined,
            }
          : undefined,
      })),
      _count: raw._count,
    };
  }

  async findById(id: string): Promise<OfferEntity | null> {
    const raw = await this.prisma.offer.findUnique({
      where: { id },
      include: {
        applicablePlans: {
          include: {
            plan: true,
          },
        },
        applicableCycles: true,
        _count: {
          select: { redemptions: true },
        },
      },
    });

    return raw ? this.mapToEntity(raw) : null;
  }

  async findActiveOffers(planId?: string, billingCycle?: string): Promise<OfferEntity[]> {
    const now = new Date();
    const rawOffers = await this.prisma.offer.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        OR: [{ validUntil: null }, { validUntil: { gte: now } }],
      },
      include: {
        applicablePlans: {
          include: { plan: true },
        },
        applicableCycles: true,
      },
      orderBy: { discountValue: "desc" },
    });

    return rawOffers
      .filter((offer) => {
        // If global redemption limit reached, skip
        if (offer.maxRedemptions !== null && offer.maxRedemptions !== undefined) {
          if (offer.usedRedemptions >= offer.maxRedemptions) return false;
        }

        // If offer has specific plan restrictions, verify match
        if (planId && offer.applicablePlans.length > 0) {
          const matchesPlan = offer.applicablePlans.some(
            (ap) => ap.planId === planId || ap.plan?.slug === planId
          );
          if (!matchesPlan) return false;
        }

        // If offer has specific billing cycle restrictions, verify match
        if (billingCycle && offer.applicableCycles.length > 0) {
          const matchesCycle = offer.applicableCycles.some(
            (ac) => ac.billingCycle === billingCycle
          );
          if (!matchesCycle) return false;
        }

        return true;
      })
      .map((r) => this.mapToEntity(r));
  }

  async findRedemptionCountByUser(offerId: string, teacherProfileId: string): Promise<number> {
    return this.prisma.offerRedemption.count({
      where: {
        offerId,
        teacherProfileId,
      },
    });
  }

  async hasUserSubscribedBefore(teacherProfileId: string): Promise<boolean> {
    const count = await this.prisma.teacherSubscription.count({
      where: {
        teacherProfileId,
        status: { in: ["ACTIVE", "CANCELED", "PAST_DUE", "EXPIRED"] },
      },
    });
    return count > 0;
  }

  async create(data: CreateOfferDto): Promise<OfferEntity> {
    const raw = await this.prisma.offer.create({
      data: {
        title: data.title,
        description: data.description || null,
        discountType: data.discountType,
        discountValue: new Prisma.Decimal(data.discountValue),
        maxDiscountAmount:
          data.maxDiscountAmount !== null && data.maxDiscountAmount !== undefined
            ? new Prisma.Decimal(data.maxDiscountAmount)
            : null,
        minOrderAmount:
          data.minOrderAmount !== null && data.minOrderAmount !== undefined
            ? new Prisma.Decimal(data.minOrderAmount)
            : null,
        eligibility: data.eligibility || "ALL_TEACHERS",
        badgeText: data.badgeText || null,
        maxRedemptions: data.maxRedemptions ?? null,
        usedRedemptions: 0,
        maxRedemptionsPerUser: data.maxRedemptionsPerUser ?? 1,
        validFrom: data.validFrom ? new Date(data.validFrom) : new Date(),
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        isActive: data.isActive ?? true,
        applicablePlans:
          data.applicablePlanIds && data.applicablePlanIds.length > 0
            ? {
                create: data.applicablePlanIds.map((planId) => ({ planId })),
              }
            : undefined,
        applicableCycles:
          data.applicableCycles && data.applicableCycles.length > 0
            ? {
                create: data.applicableCycles.map((billingCycle) => ({ billingCycle })),
              }
            : undefined,
      },
      include: {
        applicablePlans: { include: { plan: true } },
        applicableCycles: true,
      },
    });

    return this.mapToEntity(raw);
  }

  async update(id: string, data: UpdateOfferDto): Promise<OfferEntity> {
    return this.prisma.$transaction(async (tx) => {
      // Sync applicable plans if provided
      if (data.applicablePlanIds !== undefined) {
        await tx.offerPlan.deleteMany({ where: { offerId: id } });
        if (data.applicablePlanIds.length > 0) {
          await tx.offerPlan.createMany({
            data: data.applicablePlanIds.map((planId) => ({ offerId: id, planId })),
          });
        }
      }

      // Sync applicable cycles if provided
      if (data.applicableCycles !== undefined) {
        await tx.offerBillingCycle.deleteMany({ where: { offerId: id } });
        if (data.applicableCycles.length > 0) {
          await tx.offerBillingCycle.createMany({
            data: data.applicableCycles.map((billingCycle) => ({ offerId: id, billingCycle })),
          });
        }
      }

      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description || null;
      if (data.discountType !== undefined) updateData.discountType = data.discountType;
      if (data.discountValue !== undefined) updateData.discountValue = new Prisma.Decimal(data.discountValue);
      if (data.maxDiscountAmount !== undefined)
        updateData.maxDiscountAmount =
          data.maxDiscountAmount !== null ? new Prisma.Decimal(data.maxDiscountAmount) : null;
      if (data.minOrderAmount !== undefined)
        updateData.minOrderAmount =
          data.minOrderAmount !== null ? new Prisma.Decimal(data.minOrderAmount) : null;
      if (data.eligibility !== undefined) updateData.eligibility = data.eligibility;
      if (data.badgeText !== undefined) updateData.badgeText = data.badgeText || null;
      if (data.maxRedemptions !== undefined) updateData.maxRedemptions = data.maxRedemptions ?? null;
      if (data.maxRedemptionsPerUser !== undefined)
        updateData.maxRedemptionsPerUser = data.maxRedemptionsPerUser;
      if (data.validFrom !== undefined) updateData.validFrom = new Date(data.validFrom);
      if (data.validUntil !== undefined)
        updateData.validUntil = data.validUntil ? new Date(data.validUntil) : null;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      const updated = await tx.offer.update({
        where: { id },
        data: updateData,
        include: {
          applicablePlans: { include: { plan: true } },
          applicableCycles: true,
        },
      });

      return this.mapToEntity(updated);
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.offer.delete({ where: { id } });
  }

  async toggleStatus(id: string): Promise<OfferEntity> {
    const current = await this.prisma.offer.findUnique({ where: { id } });
    if (!current) throw new Error("Offer not found");

    const updated = await this.prisma.offer.update({
      where: { id },
      data: { isActive: !current.isActive },
      include: {
        applicablePlans: { include: { plan: true } },
        applicableCycles: true,
      },
    });

    return this.mapToEntity(updated);
  }

  async findAllAdmin(query: ListOffersQueryDto): Promise<{ offers: OfferEntity[]; total: number }> {
    const page = query.page && query.page > 0 ? Number(query.page) : 1;
    const limit = query.limit && query.limit > 0 ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    const now = new Date();

    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { badgeText: { contains: q, mode: "insensitive" } },
      ];
    }

    if (query.status) {
      if (query.status === "active") {
        where.isActive = true;
        where.validFrom = { lte: now };
        where.OR = [{ validUntil: null }, { validUntil: { gte: now } }];
      } else if (query.status === "disabled") {
        where.isActive = false;
      } else if (query.status === "expired") {
        where.validUntil = { lt: now };
      }
    }

    if (query.discountType && query.discountType !== "all") {
      where.discountType = query.discountType;
    }

    const [rawOffers, total] = await Promise.all([
      this.prisma.offer.findMany({
        where,
        skip,
        take: limit,
        include: {
          applicablePlans: { include: { plan: true } },
          applicableCycles: true,
          _count: { select: { redemptions: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.offer.count({ where }),
    ]);

    return {
      offers: rawOffers.map((r) => this.mapToEntity(r)),
      total,
    };
  }

  async recordRedemption(data: RecordRedemptionDto): Promise<OfferRedemptionEntity> {
    const raw = await this.prisma.offerRedemption.create({
      data: {
        offerId: data.offerId,
        teacherProfileId: data.teacherProfileId,
        subscriptionId: data.subscriptionId || null,
        invoiceId: data.invoiceId || null,
        discountAmount: new Prisma.Decimal(data.discountAmount),
        finalPaidAmount: new Prisma.Decimal(data.finalPaidAmount),
      },
    });

    // Increment used count on offer
    await this.incrementRedemptions(data.offerId);

    return {
      id: raw.id,
      offerId: raw.offerId,
      teacherProfileId: raw.teacherProfileId,
      subscriptionId: raw.subscriptionId,
      invoiceId: raw.invoiceId,
      discountAmount: Number(raw.discountAmount),
      finalPaidAmount: Number(raw.finalPaidAmount),
      redeemedAt: raw.redeemedAt,
    };
  }

  async incrementRedemptions(offerId: string): Promise<void> {
    await this.prisma.offer.update({
      where: { id: offerId },
      data: { usedRedemptions: { increment: 1 } },
    });
  }

  async getAnalytics(): Promise<OfferAnalyticsDto> {
    const now = new Date();
    const [totalOffers, activeOffers, totalRedemptions, aggregateStats, recent] =
      await Promise.all([
        this.prisma.offer.count(),
        this.prisma.offer.count({
          where: {
            isActive: true,
            validFrom: { lte: now },
            OR: [{ validUntil: null }, { validUntil: { gte: now } }],
          },
        }),
        this.prisma.offerRedemption.count(),
        this.prisma.offerRedemption.aggregate({
          _sum: {
            discountAmount: true,
            finalPaidAmount: true,
          },
        }),
        this.prisma.offerRedemption.findMany({
          take: 5,
          orderBy: { redeemedAt: "desc" },
          include: {
            offer: true,
            teacherProfile: {
              include: {
                profile: {
                  include: { user: true },
                },
              },
            },
          },
        }),
      ]);

    return {
      totalOffers,
      activeOffers,
      totalRedemptions,
      totalDiscountGiven: Number(aggregateStats._sum.discountAmount || 0),
      totalRevenueGenerated: Number(aggregateStats._sum.finalPaidAmount || 0),
      recentRedemptions: recent.map((r) => ({
        id: r.id,
        offerTitle: r.offer.title,
        teacherName: r.teacherProfile?.profile?.user?.name || "Teacher",
        teacherEmail: r.teacherProfile?.profile?.user?.email || "N/A",
        discountAmount: Number(r.discountAmount),
        finalPaidAmount: Number(r.finalPaidAmount),
        redeemedAt: r.redeemedAt,
      })),
    };
  }
}
