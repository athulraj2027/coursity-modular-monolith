import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { IInterviewAnalyticsRepository } from "../../domain/repositories/interview-analytics.repository.interface";
import {
  AnalyticsOverviewDto,
  AnalyticsTimeseriesPointDto,
} from "../../domain/dtos/admin-interview.dto";

export class PrismaInterviewAnalyticsRepository
  implements IInterviewAnalyticsRepository
{
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async getOverviewMetrics(
    startDate?: Date,
    endDate?: Date
  ): Promise<AnalyticsOverviewDto> {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const sessions = await (this.prisma as any).interviewSession.findMany({
      where,
      select: {
        status: true,
        outcome: true,
        overallScore: true,
        durationSeconds: true,
      },
    });

    const totalInterviews = sessions.length;
    let completedCount = 0;
    let passedCount = 0;
    let failedCount = 0;
    let totalScore = 0;
    let scoreCount = 0;
    let totalDuration = 0;
    let durationCount = 0;

    const statusDistribution: Record<string, number> = {};
    const outcomeDistribution: Record<string, number> = {};

    for (const s of sessions) {
      statusDistribution[s.status] = (statusDistribution[s.status] || 0) + 1;
      outcomeDistribution[s.outcome] = (outcomeDistribution[s.outcome] || 0) + 1;

      if (s.status === "COMPLETED" || s.status === "EVALUATED") {
        completedCount++;
      }
      if (s.outcome === "PASSED") {
        passedCount++;
      }
      if (s.outcome === "FAILED") {
        failedCount++;
      }
      if (s.overallScore !== null && s.overallScore !== undefined) {
        totalScore += Number(s.overallScore);
        scoreCount++;
      }
      if (s.durationSeconds && s.durationSeconds > 0) {
        totalDuration += Number(s.durationSeconds);
        durationCount++;
      }
    }

    const passRatePercentage =
      completedCount > 0 ? (passedCount / completedCount) * 100 : 0;
    const averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;
    const averageDurationSeconds =
      durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;

    return {
      totalInterviews,
      completedInterviews: completedCount,
      passedCount,
      failedCount,
      passRatePercentage: Number(passRatePercentage.toFixed(2)),
      averageScore: Number(averageScore.toFixed(2)),
      averageDurationSeconds,
      statusDistribution,
      outcomeDistribution,
    };
  }

  async getTimeseriesMetrics(
    intervalDays: number = 30
  ): Promise<AnalyticsTimeseriesPointDto[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - intervalDays);

    const sessions = await (this.prisma as any).interviewSession.findMany({
      where: {
        createdAt: {
          gte: cutoffDate,
        },
      },
      select: {
        createdAt: true,
        outcome: true,
        overallScore: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const dayMap = new Map<
      string,
      { total: number; passed: number; failed: number; totalScore: number; scoreCount: number }
    >();

    for (const s of sessions) {
      const dateKey = s.createdAt.toISOString().slice(0, 10);
      let point = dayMap.get(dateKey);
      if (!point) {
        point = { total: 0, passed: 0, failed: 0, totalScore: 0, scoreCount: 0 };
        dayMap.set(dateKey, point);
      }

      point.total++;
      if (s.outcome === "PASSED") point.passed++;
      if (s.outcome === "FAILED") point.failed++;
      if (s.overallScore !== null && s.overallScore !== undefined) {
        point.totalScore += Number(s.overallScore);
        point.scoreCount++;
      }
    }

    const result: AnalyticsTimeseriesPointDto[] = [];
    for (const [date, val] of dayMap.entries()) {
      result.push({
        date,
        total: val.total,
        passed: val.passed,
        failed: val.failed,
        averageScore:
          val.scoreCount > 0
            ? Number((val.totalScore / val.scoreCount).toFixed(2))
            : 0,
      });
    }

    return result;
  }

  async getTemplateMetrics(templateId: string): Promise<{
    templateId: string;
    totalSessions: number;
    completedSessions: number;
    passedSessions: number;
    failedSessions: number;
    passRate: number;
    averageScore: number;
    averageDurationSeconds: number;
  }> {
    const sessions = await (this.prisma as any).interviewSession.findMany({
      where: { templateId },
      select: {
        status: true,
        outcome: true,
        overallScore: true,
        durationSeconds: true,
      },
    });

    const totalSessions = sessions.length;
    let completedSessions = 0;
    let passedSessions = 0;
    let failedSessions = 0;
    let totalScore = 0;
    let scoreCount = 0;
    let totalDuration = 0;
    let durationCount = 0;

    for (const s of sessions) {
      if (s.status === "COMPLETED" || s.status === "EVALUATED") {
        completedSessions++;
      }
      if (s.outcome === "PASSED") passedSessions++;
      if (s.outcome === "FAILED") failedSessions++;
      if (s.overallScore !== null && s.overallScore !== undefined) {
        totalScore += Number(s.overallScore);
        scoreCount++;
      }
      if (s.durationSeconds && s.durationSeconds > 0) {
        totalDuration += Number(s.durationSeconds);
        durationCount++;
      }
    }

    const passRate =
      completedSessions > 0
        ? Number(((passedSessions / completedSessions) * 100).toFixed(2))
        : 0;
    const averageScore =
      scoreCount > 0 ? Number((totalScore / scoreCount).toFixed(2)) : 0;
    const averageDurationSeconds =
      durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;

    return {
      templateId,
      totalSessions,
      completedSessions,
      passedSessions,
      failedSessions,
      passRate,
      averageScore,
      averageDurationSeconds,
    };
  }
}
