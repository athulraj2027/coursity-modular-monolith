import { PrismaClient, BillingCycle, SubscriptionStatus } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { SubscriptionRepository } from "../../domain/repositories/subscription.repository";
import {
  TeacherSubscription,
  TeacherPlanUsage,
  QuotaEvaluationResult,
} from "../../domain/entities/subscription.entity";
import {
  CreateSubscriptionDto,
  AdminSubscriptionFilterDto,
  AdminSubscriptionListItem,
  AdminSubscriptionMetrics,
} from "../../domain/dtos/subscription.dto";

export class PrismaSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async findById(id: string): Promise<TeacherSubscription | null> {
    const record = await this.prisma.teacherSubscription.findUnique({
      where: { id },
      include: {
        plan: {
          include: {
            features: {
              include: {
                feature: true,
              },
            },
          },
        },
      },
    });

    if (!record) return null;
    return this.mapToSubscriptionEntity(record);
  }

  async findActiveByTeacherId(teacherProfileId: string): Promise<TeacherSubscription | null> {
    const record = await this.prisma.teacherSubscription.findFirst({
      where: {
        teacherProfileId,
        status: {
          in: ["ACTIVE", "PAST_DUE"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        plan: {
          include: {
            features: {
              include: {
                feature: true,
              },
            },
          },
        },
      },
    });

    if (!record) return null;
    return this.mapToSubscriptionEntity(record);
  }

  async create(data: CreateSubscriptionDto): Promise<TeacherSubscription> {
    const record = await this.prisma.teacherSubscription.create({
      data: {
        teacherProfileId: data.teacherProfileId,
        planId: data.planId,
        status: data.status || "ACTIVE",
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        trialEndsAt: data.trialEndsAt,
        externalCustomerId: data.externalCustomerId,
        externalSubscriptionId: data.externalSubscriptionId,
      },
      include: {
        plan: {
          include: {
            features: {
              include: {
                feature: true,
              },
            },
          },
        },
      },
    });

    return this.mapToSubscriptionEntity(record);
  }

  async updateStatus(
    id: string,
    status: SubscriptionStatus,
    canceledAt?: Date | null
  ): Promise<TeacherSubscription> {
    const record = await this.prisma.teacherSubscription.update({
      where: { id },
      data: {
        status,
        canceledAt: canceledAt !== undefined ? canceledAt : undefined,
      },
      include: {
        plan: {
          include: {
            features: {
              include: {
                feature: true,
              },
            },
          },
        },
      },
    });

    return this.mapToSubscriptionEntity(record);
  }

  async cancelAtPeriodEnd(id: string, cancel: boolean): Promise<TeacherSubscription> {
    const record = await this.prisma.teacherSubscription.update({
      where: { id },
      data: {
        cancelAtPeriodEnd: cancel,
        canceledAt: cancel ? new Date() : null,
      },
      include: {
        plan: {
          include: {
            features: {
              include: {
                feature: true,
              },
            },
          },
        },
      },
    });

    return this.mapToSubscriptionEntity(record);
  }

  async changePlan(
    id: string,
    newPlanId: string,
    newPeriodStart: Date,
    newPeriodEnd: Date
  ): Promise<TeacherSubscription> {
    const record = await this.prisma.teacherSubscription.update({
      where: { id },
      data: {
        planId: newPlanId,
        status: "ACTIVE",
        currentPeriodStart: newPeriodStart,
        currentPeriodEnd: newPeriodEnd,
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
      include: {
        plan: {
          include: {
            features: {
              include: {
                feature: true,
              },
            },
          },
        },
      },
    });

    return this.mapToSubscriptionEntity(record);
  }

  async adminFindAll(filter: AdminSubscriptionFilterDto): Promise<{
    items: AdminSubscriptionListItem[];
    total: number;
    metrics: AdminSubscriptionMetrics;
  }> {
    const page = filter.page && filter.page > 0 ? filter.page : 1;
    const limit = filter.limit && filter.limit > 0 ? filter.limit : 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (filter.status && filter.status !== ("ALL" as any)) {
      whereClause.status = filter.status;
    }

    if (filter.planId) {
      whereClause.planId = filter.planId;
    }

    if (filter.billingCycle) {
      whereClause.plan = {
        ...(whereClause.plan || {}),
        billingCycle: filter.billingCycle,
      };
    }

    if (filter.search && filter.search.trim()) {
      const q = filter.search.trim();
      whereClause.OR = [
        { id: { contains: q, mode: "insensitive" } },
        { externalSubscriptionId: { contains: q, mode: "insensitive" } },
        {
          teacherProfile: {
            profile: {
              user: {
                name: { contains: q, mode: "insensitive" },
              },
            },
          },
        },
        {
          teacherProfile: {
            profile: {
              user: {
                email: { contains: q, mode: "insensitive" },
              },
            },
          },
        },
      ];
    }

    const [rawSubscriptions, totalCount, allRecordsForMetrics, paidInvoices] = await Promise.all([
      this.prisma.teacherSubscription.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          teacherProfile: {
            include: {
              profile: {
                include: {
                  user: true,
                },
              },
            },
          },
          plan: true,
          invoices: true,
        },
      }),
      this.prisma.teacherSubscription.count({ where: whereClause }),
      this.prisma.teacherSubscription.findMany({
        select: {
          id: true,
          status: true,
          plan: {
            select: {
              price: true,
              billingCycle: true,
            },
          },
        },
      }),
      this.prisma.subscriptionInvoice.findMany({
        where: { status: "PAID" },
        select: { amount: true },
      }),
    ]);

    const totalSubs = allRecordsForMetrics.length;
    let activeSubs = 0;
    let churnedCount = 0;
    let pastDueCount = 0;
    let mrr = 0;

    for (const sub of allRecordsForMetrics) {
      if (sub.status === "ACTIVE") {
        activeSubs++;
        const rawPrice = Number(sub.plan.price);
        const priceInRupees = rawPrice >= 100 ? rawPrice / 100 : rawPrice;
        if (sub.plan.billingCycle === "YEARLY") {
          mrr += priceInRupees / 12;
        } else if (sub.plan.billingCycle === "QUARTERLY") {
          mrr += priceInRupees / 3;
        } else {
          mrr += priceInRupees;
        }
      } else if (sub.status === "PAST_DUE") {
        pastDueCount++;
      } else if (sub.status === "CANCELED" || sub.status === "EXPIRED") {
        churnedCount++;
      }
    }

    const totalRevenue = paidInvoices.reduce((acc, inv) => acc + Number(inv.amount), 0);

    const items = rawSubscriptions.map((sub: any) => {
      const user = sub.teacherProfile?.profile?.user;
      const rawPrice = Number(sub.plan?.price || 0);
      const priceInRupees = rawPrice >= 100 ? rawPrice / 100 : rawPrice;
      const totalInvoiced = sub.invoices.reduce((acc: number, inv: any) => {
        return inv.status === "PAID" ? acc + Number(inv.amount) : acc;
      }, 0);

      return {
        id: sub.id,
        teacherProfileId: sub.teacherProfileId,
        instructorName: user?.name || "Instructor",
        instructorEmail: user?.email || "",
        instructorAvatar: sub.teacherProfile?.profile?.avatar || null,
        instructorPhone: sub.teacherProfile?.profile?.phone || null,
        planId: sub.planId,
        planName: sub.plan?.name || "Unknown Plan",
        planSlug: sub.plan?.slug || "",
        billingCycle: sub.plan?.billingCycle as BillingCycle,
        price: priceInRupees,
        currency: sub.plan?.currency || "INR",
        status: sub.status as SubscriptionStatus,
        currentPeriodStart: sub.currentPeriodStart,
        currentPeriodEnd: sub.currentPeriodEnd,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        canceledAt: sub.canceledAt,
        trialEndsAt: sub.trialEndsAt,
        totalInvoicedAmount: totalInvoiced,
        invoiceCount: sub.invoices.length,
        createdAt: sub.createdAt,
      };
    });

    return {
      items,
      total: totalCount,
      metrics: {
        totalSubscriptions: totalSubs,
        activeSubscriptions: activeSubs,
        mrr: Math.round(mrr),
        totalRevenue: Math.round(totalRevenue),
        churnedCount,
        pastDueCount,
      },
    };
  }

  async adminFindById(id: string): Promise<any | null> {
    const raw = await this.prisma.teacherSubscription.findUnique({
      where: { id },
      include: {
        teacherProfile: {
          include: {
            profile: {
              include: {
                user: true,
              },
            },
            courses: {
              select: { id: true, title: true, status: true },
            },
          },
        },
        plan: {
          include: {
            features: {
              include: {
                feature: true,
              },
            },
          },
        },
        usages: true,
        invoices: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!raw) return null;

    const user = raw.teacherProfile?.profile?.user;
    const rawPrice = Number(raw.plan?.price || 0);
    const priceInRupees = rawPrice >= 100 ? rawPrice / 100 : rawPrice;

    return {
      id: raw.id,
      teacherProfileId: raw.teacherProfileId,
      instructor: {
        id: raw.teacherProfile?.id,
        profileId: raw.teacherProfile?.profileId,
        userId: user?.id,
        name: user?.name || "Instructor",
        email: user?.email || "",
        avatar: raw.teacherProfile?.profile?.avatar || null,
        phone: raw.teacherProfile?.profile?.phone || null,
        country: raw.teacherProfile?.profile?.country || null,
        isApproved: raw.teacherProfile?.isApproved,
        approvalStatus: raw.teacherProfile?.approvalStatus,
        courseCount: raw.teacherProfile?.courses?.length || 0,
        createdAt: raw.teacherProfile?.createdAt,
      },
      planId: raw.planId,
      plan: raw.plan
        ? {
            id: raw.plan.id,
            name: raw.plan.name,
            slug: raw.plan.slug,
            tagline: raw.plan.tagline,
            description: raw.plan.description,
            price: priceInRupees,
            currency: raw.plan.currency,
            billingCycle: raw.plan.billingCycle,
            trialDays: raw.plan.trialDays,
            isActive: raw.plan.isActive,
            isFeatured: raw.plan.isFeatured,
            features: (raw.plan.features || []).map((pf: any) => ({
              id: pf.id,
              featureId: pf.featureId,
              name: pf.feature?.name,
              code: pf.feature?.code,
              category: pf.feature?.category,
              featureType: pf.feature?.featureType,
              unit: pf.feature?.unit,
              value: pf.value,
              isUnlimited: pf.isUnlimited,
            })),
          }
        : null,
      status: raw.status as SubscriptionStatus,
      currentPeriodStart: raw.currentPeriodStart,
      currentPeriodEnd: raw.currentPeriodEnd,
      cancelAtPeriodEnd: raw.cancelAtPeriodEnd,
      canceledAt: raw.canceledAt,
      trialEndsAt: raw.trialEndsAt,
      externalCustomerId: raw.externalCustomerId,
      externalSubscriptionId: raw.externalSubscriptionId,
      usages: (raw.usages || []).map((u: any) => ({
        id: u.id,
        featureCode: u.featureCode,
        currentUsage: u.currentUsage,
        periodStart: u.periodStart,
        periodEnd: u.periodEnd,
      })),
      invoices: (raw.invoices || []).map((inv: any) => {
        const amount = Number(inv.amount);
        const baseAmount = inv.baseAmount !== null && inv.baseAmount !== undefined
          ? Number(inv.baseAmount)
          : Math.round((amount / 1.18) * 100) / 100;
        const taxAmount = inv.taxAmount !== null && inv.taxAmount !== undefined
          ? Number(inv.taxAmount)
          : Math.round((amount - baseAmount) * 100) / 100;

        return {
          id: inv.id,
          subscriptionId: inv.subscriptionId,
          invoiceNumber: inv.invoiceNumber,
          amount,
          currency: inv.currency,
          status: inv.status,
          paymentMethod: inv.paymentMethod,
          receiptUrl: inv.receiptUrl,
          paidAt: inv.paidAt,
          planName: inv.planName || raw.plan?.name || "Instructor Plan",
          billingCycle: inv.billingCycle || raw.plan?.billingCycle || "MONTHLY",
          baseAmount,
          taxAmount,
          taxPercent: inv.taxPercent !== null && inv.taxPercent !== undefined ? Number(inv.taxPercent) : 18,
          userName: inv.userName || user?.name || "Instructor",
          userEmail: inv.userEmail || user?.email || "",
          userPhone: inv.userPhone || raw.teacherProfile?.profile?.phone || null,
          userAddress: inv.userAddress || null,
          userState: inv.userState || null,
          userCountry: inv.userCountry || raw.teacherProfile?.profile?.country || "India",
          gstin: inv.gstin || null,
          gatewayOrderId: inv.gatewayOrderId || null,
          gatewayPaymentId: inv.gatewayPaymentId || null,
          createdAt: inv.createdAt,
        };
      }),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  async adminExtendPeriod(id: string, newPeriodEnd: Date): Promise<TeacherSubscription> {
    const record = await this.prisma.teacherSubscription.update({
      where: { id },
      data: {
        currentPeriodEnd: newPeriodEnd,
        status: "ACTIVE",
        cancelAtPeriodEnd: false,
      },
      include: {
        plan: {
          include: {
            features: {
              include: {
                feature: true,
              },
            },
          },
        },
      },
    });

    return this.mapToSubscriptionEntity(record);
  }

  async adminUpdateInvoiceStatus(
    invoiceId: string,
    status: "PAID" | "PENDING" | "FAILED" | "REFUNDED",
    receiptUrl?: string
  ): Promise<any> {
    const updateData: any = { status };
    if (receiptUrl) updateData.receiptUrl = receiptUrl;

    return this.prisma.subscriptionInvoice.update({
      where: { id: invoiceId },
      data: updateData,
    });
  }

  async getUsage(
    subscriptionId: string,
    featureCode: string,
    periodStart: Date
  ): Promise<TeacherPlanUsage | null> {
    const record = await this.prisma.teacherPlanUsage.findFirst({
      where: {
        subscriptionId,
        featureCode,
        periodStart,
      },
    });

    if (!record) return null;
    return this.mapToUsageEntity(record);
  }

  async recordUsage(
    subscriptionId: string,
    teacherProfileId: string,
    featureCode: string,
    periodStart: Date,
    periodEnd: Date,
    amount: number,
    isAbsolute = false
  ): Promise<TeacherPlanUsage> {
    const existing = await this.prisma.teacherPlanUsage.findFirst({
      where: {
        subscriptionId,
        featureCode,
        periodStart,
      },
    });

    if (existing) {
      const newUsage = isAbsolute ? amount : existing.currentUsage + amount;
      const updated = await this.prisma.teacherPlanUsage.update({
        where: { id: existing.id },
        data: {
          currentUsage: Math.max(0, newUsage),
        },
      });
      return this.mapToUsageEntity(updated);
    }

    const created = await this.prisma.teacherPlanUsage.create({
      data: {
        subscriptionId,
        teacherProfileId,
        featureCode,
        currentUsage: Math.max(0, amount),
        periodStart,
        periodEnd,
      },
    });

    return this.mapToUsageEntity(created);
  }

  async getAllCurrentUsages(subscriptionId: string): Promise<TeacherPlanUsage[]> {
    const records = await this.prisma.teacherPlanUsage.findMany({
      where: { subscriptionId },
    });

    return records.map((r) => this.mapToUsageEntity(r));
  }

  async evaluateQuota(
    teacherProfileId: string,
    featureCode: string,
    requestedAmount = 1
  ): Promise<QuotaEvaluationResult> {
    const activeSub = await this.findActiveByTeacherId(teacherProfileId);
    if (!activeSub || !activeSub.plan) {
      return {
        allowed: false,
        featureCode,
        limit: 0,
        isUnlimited: false,
        currentUsage: 0,
        remaining: 0,
        unit: null,
        reason: "No active subscription found for teacher profile.",
      };
    }

    const planFeature = activeSub.plan.features?.find(
      (pf) => pf.feature?.code === featureCode || pf.featureId === featureCode
    );

    if (!planFeature) {
      return {
        allowed: false,
        featureCode,
        limit: 0,
        isUnlimited: false,
        currentUsage: 0,
        remaining: 0,
        unit: null,
        reason: `Feature '${featureCode}' is not included in the '${activeSub.plan.name}' tier.`,
      };
    }

    if (planFeature.isUnlimited) {
      const usageRecord = await this.getUsage(
        activeSub.id,
        featureCode,
        activeSub.currentPeriodStart
      );
      let currentUsage = usageRecord ? usageRecord.currentUsage : 0;
      if (currentUsage === 0 && featureCode === "MAX_COURSES") {
        try {
          const courseCount = await this.prisma.course.count({
            where: { teacherProfileId, status: "PUBLISHED" },
          });
          currentUsage = courseCount;
        } catch {
          // Non-fatal
        }
      }

      return {
        allowed: true,
        featureCode,
        limit: -1,
        isUnlimited: true,
        currentUsage,
        remaining: 999999,
        unit: planFeature.feature?.unit || null,
      };
    }

    const numericLimit = parseFloat(planFeature.value);
    if (isNaN(numericLimit)) {
      const isAllowed = planFeature.value.toLowerCase() === "true";
      return {
        allowed: isAllowed,
        featureCode,
        limit: isAllowed ? 1 : 0,
        isUnlimited: false,
        currentUsage: 0,
        remaining: isAllowed ? 1 : 0,
        unit: planFeature.feature?.unit || null,
        reason: isAllowed ? undefined : `Feature '${featureCode}' is disabled in this plan.`,
      };
    }

    const usageRecord = await this.getUsage(
      activeSub.id,
      featureCode,
      activeSub.currentPeriodStart
    );
    let currentUsage = usageRecord ? usageRecord.currentUsage : 0;

    if (currentUsage === 0 && featureCode === "MAX_COURSES") {
      try {
        const courseCount = await this.prisma.course.count({
          where: { teacherProfileId, status: "PUBLISHED" },
        });
        currentUsage = courseCount;
      } catch {
        // Non-fatal
      }
    }

    const remaining = Math.max(0, numericLimit - currentUsage);
    const allowed = currentUsage + requestedAmount <= numericLimit;

    return {
      allowed,
      featureCode,
      limit: numericLimit,
      isUnlimited: false,
      currentUsage,
      remaining,
      unit: planFeature.feature?.unit || null,
      reason: allowed
        ? undefined
        : `Quota limit exceeded for '${featureCode}'. Limit is ${numericLimit}, currently used ${currentUsage}.`,
    };
  }

  private mapToSubscriptionEntity(raw: any): TeacherSubscription {
    const rawPrice = Number(raw.plan?.price || 0);
    const priceInRupees = rawPrice >= 100 ? rawPrice / 100 : rawPrice;

    return {
      id: raw.id,
      teacherProfileId: raw.teacherProfileId,
      planId: raw.planId,
      plan: raw.plan
        ? {
            id: raw.plan.id,
            name: raw.plan.name,
            slug: raw.plan.slug,
            tagline: raw.plan.tagline,
            description: raw.plan.description,
            price: priceInRupees,
            currency: raw.plan.currency,
            billingCycle: raw.plan.billingCycle,
            trialDays: raw.plan.trialDays,
            isActive: raw.plan.isActive,
            isFeatured: raw.plan.isFeatured,
            sortOrder: raw.plan.sortOrder,
            features: raw.plan.features
              ? raw.plan.features.map((pf: any) => ({
                  id: pf.id,
                  planId: pf.planId,
                  featureId: pf.featureId,
                  feature: pf.feature
                    ? {
                        id: pf.feature.id,
                        code: pf.feature.code,
                        name: pf.feature.name,
                        description: pf.feature.description,
                        featureType: pf.feature.featureType,
                        category: pf.feature.category,
                        unit: pf.feature.unit,
                        sortOrder: pf.feature.sortOrder,
                        createdAt: pf.feature.createdAt,
                        updatedAt: pf.feature.updatedAt,
                      }
                    : undefined,
                  value: pf.value,
                  isUnlimited: pf.isUnlimited,
                  createdAt: pf.createdAt,
                  updatedAt: pf.updatedAt,
                }))
              : [],
            createdAt: raw.plan.createdAt,
            updatedAt: raw.plan.updatedAt,
          }
        : undefined,
      status: raw.status as SubscriptionStatus,
      currentPeriodStart: raw.currentPeriodStart,
      currentPeriodEnd: raw.currentPeriodEnd,
      cancelAtPeriodEnd: raw.cancelAtPeriodEnd,
      canceledAt: raw.canceledAt,
      trialEndsAt: raw.trialEndsAt,
      externalCustomerId: raw.externalCustomerId,
      externalSubscriptionId: raw.externalSubscriptionId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  private mapToUsageEntity(raw: any): TeacherPlanUsage {
    return {
      id: raw.id,
      subscriptionId: raw.subscriptionId,
      teacherProfileId: raw.teacherProfileId,
      featureCode: raw.featureCode,
      currentUsage: raw.currentUsage,
      periodStart: raw.periodStart,
      periodEnd: raw.periodEnd,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
