import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { UsageRepository } from "../../domain/repositories/plan.repository";
import { TeacherPlanUsage } from "../../domain/entities/plan.entity";

export class PrismaUsageRepository implements UsageRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async getCurrentUsage(
    subscriptionId: string,
    featureCode: string,
    periodStart: Date
  ): Promise<TeacherPlanUsage | null> {
    const record = await this.prisma.teacherPlanUsage.findUnique({
      where: {
        subscriptionId_featureCode_periodStart: {
          subscriptionId,
          featureCode,
          periodStart,
        },
      },
    });

    if (!record) return null;
    return this.mapToUsageEntity(record);
  }

  async getAllUsagesForPeriod(
    subscriptionId: string,
    periodStart: Date
  ): Promise<TeacherPlanUsage[]> {
    const records = await this.prisma.teacherPlanUsage.findMany({
      where: {
        subscriptionId,
        periodStart,
      },
    });

    return records.map((r) => this.mapToUsageEntity(r));
  }

  async recordUsage(data: {
    subscriptionId: string;
    teacherProfileId: string;
    featureCode: string;
    amount: number;
    periodStart: Date;
    periodEnd: Date;
    isIncrement?: boolean;
  }): Promise<TeacherPlanUsage> {
    const isIncrement = data.isIncrement !== false;

    const record = await this.prisma.teacherPlanUsage.upsert({
      where: {
        subscriptionId_featureCode_periodStart: {
          subscriptionId: data.subscriptionId,
          featureCode: data.featureCode,
          periodStart: data.periodStart,
        },
      },
      update: isIncrement
        ? {
            currentUsage: {
              increment: data.amount,
            },
            periodEnd: data.periodEnd,
          }
        : {
            currentUsage: data.amount,
            periodEnd: data.periodEnd,
          },
      create: {
        subscriptionId: data.subscriptionId,
        teacherProfileId: data.teacherProfileId,
        featureCode: data.featureCode,
        currentUsage: data.amount,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
      },
    });

    return this.mapToUsageEntity(record);
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
