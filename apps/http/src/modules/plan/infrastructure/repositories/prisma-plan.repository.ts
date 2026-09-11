import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { PlanRepository } from "../../domain/repositories/plan.repository";
import { Plan, Feature, BillingCycle } from "../../domain/entities/plan.entity";
import { CreatePlanDto, UpdatePlanDto } from "../../domain/dtos/plan.dto";

export class PrismaPlanRepository implements PlanRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async findAll(includeInactive = false): Promise<Plan[]> {
    const records = await this.prisma.plan.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        features: {
          include: {
            feature: true,
          },
          orderBy: {
            feature: {
              sortOrder: "asc",
            },
          },
        },
      },
    });

    return records.map((r) => this.mapToPlanEntity(r));
  }

  async findById(id: string): Promise<Plan | null> {
    const record = await this.prisma.plan.findUnique({
      where: { id },
      include: {
        features: {
          include: {
            feature: true,
          },
          orderBy: {
            feature: {
              sortOrder: "asc",
            },
          },
        },
      },
    });

    if (!record) return null;
    return this.mapToPlanEntity(record);
  }

  async findBySlug(slug: string): Promise<Plan | null> {
    const record = await this.prisma.plan.findUnique({
      where: { slug },
      include: {
        features: {
          include: {
            feature: true,
          },
          orderBy: {
            feature: {
              sortOrder: "asc",
            },
          },
        },
      },
    });

    if (!record) return null;
    return this.mapToPlanEntity(record);
  }

  async create(data: CreatePlanDto): Promise<Plan> {
    const record = await this.prisma.plan.create({
      data: {
        name: data.name,
        slug: data.slug,
        tagline: data.tagline,
        description: data.description,
        price: data.price,
        currency: data.currency || "USD",
        billingCycle: (data.billingCycle as any) || "MONTHLY",
        trialDays: data.trialDays || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        isFeatured: data.isFeatured || false,
        sortOrder: data.sortOrder || 0,
        features: data.features && data.features.length > 0
          ? {
              create: data.features.map((f) => ({
                featureId: f.featureId,
                value: f.value,
                isUnlimited: f.isUnlimited || false,
              })),
            }
          : undefined,
      },
      include: {
        features: {
          include: {
            feature: true,
          },
        },
      },
    });

    return this.mapToPlanEntity(record);
  }

  async update(id: string, data: UpdatePlanDto): Promise<Plan> {
    const updateData: any = {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.tagline !== undefined ? { tagline: data.tagline } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.currency !== undefined ? { currency: data.currency } : {}),
      ...(data.billingCycle !== undefined ? { billingCycle: data.billingCycle as any } : {}),
      ...(data.trialDays !== undefined ? { trialDays: data.trialDays } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
    };

    if (data.features && Array.isArray(data.features)) {
      // Replace or upsert features
      await this.prisma.$transaction(async (tx) => {
        await tx.planFeature.deleteMany({
          where: { planId: id },
        });

        if (data.features && data.features.length > 0) {
          await tx.planFeature.createMany({
            data: data.features.map((f) => ({
              planId: id,
              featureId: f.featureId,
              value: f.value,
              isUnlimited: f.isUnlimited || false,
            })),
          });
        }
      });
    }

    const record = await this.prisma.plan.update({
      where: { id },
      data: updateData,
      include: {
        features: {
          include: {
            feature: true,
          },
        },
      },
    });

    return this.mapToPlanEntity(record);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.plan.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async findAllFeatures(): Promise<Feature[]> {
    const records = await this.prisma.feature.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return records.map((f) => ({
      id: f.id,
      code: f.code,
      name: f.name,
      description: f.description,
      featureType: f.featureType as any,
      category: f.category as any,
      unit: f.unit,
      sortOrder: f.sortOrder,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    }));
  }

  async findFeatureByCode(code: string): Promise<Feature | null> {
    const f = await this.prisma.feature.findUnique({
      where: { code },
    });
    if (!f) return null;

    return {
      id: f.id,
      code: f.code,
      name: f.name,
      description: f.description,
      featureType: f.featureType as any,
      category: f.category as any,
      unit: f.unit,
      sortOrder: f.sortOrder,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    };
  }

  private mapToPlanEntity(raw: any): Plan {
    return {
      id: raw.id,
      name: raw.name,
      slug: raw.slug,
      tagline: raw.tagline,
      description: raw.description,
      price: Number(raw.price),
      currency: raw.currency,
      billingCycle: raw.billingCycle as BillingCycle,
      trialDays: raw.trialDays,
      isActive: raw.isActive,
      isFeatured: raw.isFeatured,
      sortOrder: raw.sortOrder,
      features: raw.features
        ? raw.features.map((pf: any) => ({
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
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
