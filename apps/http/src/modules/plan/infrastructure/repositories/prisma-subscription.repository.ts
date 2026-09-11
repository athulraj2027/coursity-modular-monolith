import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { SubscriptionRepository } from "../../domain/repositories/plan.repository";
import { TeacherSubscription, SubscriptionStatus, BillingCycle } from "../../domain/entities/plan.entity";

export class PrismaSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async findActiveByTeacherId(teacherProfileId: string): Promise<TeacherSubscription | null> {
    const record = await this.prisma.teacherSubscription.findFirst({
      where: {
        teacherProfileId,
        status: { in: ["ACTIVE", "TRIALING", "PENDING"] },
      },
      orderBy: { createdAt: "desc" },
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
        usages: true,
      },
    });

    if (!record) return null;
    return this.mapToSubscriptionEntity(record);
  }

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
        usages: true,
        invoices: true,
      },
    });

    if (!record) return null;
    return this.mapToSubscriptionEntity(record);
  }

  async findAllByTeacherId(teacherProfileId: string): Promise<TeacherSubscription[]> {
    const records = await this.prisma.teacherSubscription.findMany({
      where: { teacherProfileId },
      orderBy: { createdAt: "desc" },
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

    return records.map((r) => this.mapToSubscriptionEntity(r));
  }

  async create(data: {
    teacherProfileId: string;
    planId: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    trialEndsAt?: Date | null;
    externalCustomerId?: string | null;
    externalSubscriptionId?: string | null;
  }): Promise<TeacherSubscription> {
    const record = await this.prisma.teacherSubscription.create({
      data: {
        teacherProfileId: data.teacherProfileId,
        planId: data.planId,
        status: data.status as any,
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
    options: { canceledAt?: Date; cancelAtPeriodEnd?: boolean } = {}
  ): Promise<TeacherSubscription> {
    const record = await this.prisma.teacherSubscription.update({
      where: { id },
      data: {
        status: status as any,
        ...(options.canceledAt !== undefined ? { canceledAt: options.canceledAt } : {}),
        ...(options.cancelAtPeriodEnd !== undefined ? { cancelAtPeriodEnd: options.cancelAtPeriodEnd } : {}),
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
    subscriptionId: string,
    newPlanId: string,
    newPeriodStart: Date,
    newPeriodEnd: Date
  ): Promise<TeacherSubscription> {
    const record = await this.prisma.teacherSubscription.update({
      where: { id: subscriptionId },
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

  private mapToSubscriptionEntity(raw: any): TeacherSubscription {
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
            price: Number(raw.plan.price),
            currency: raw.plan.currency,
            billingCycle: raw.plan.billingCycle as BillingCycle,
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
      usages: raw.usages
        ? raw.usages.map((u: any) => ({
            id: u.id,
            subscriptionId: u.subscriptionId,
            teacherProfileId: u.teacherProfileId,
            featureCode: u.featureCode,
            currentUsage: u.currentUsage,
            periodStart: u.periodStart,
            periodEnd: u.periodEnd,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
          }))
        : [],
      invoices: raw.invoices
        ? raw.invoices.map((inv: any) => ({
            id: inv.id,
            subscriptionId: inv.subscriptionId,
            invoiceNumber: inv.invoiceNumber,
            amount: Number(inv.amount),
            currency: inv.currency,
            status: inv.status,
            paymentMethod: inv.paymentMethod,
            receiptUrl: inv.receiptUrl,
            paidAt: inv.paidAt,
            createdAt: inv.createdAt,
            updatedAt: inv.updatedAt,
          }))
        : [],
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
