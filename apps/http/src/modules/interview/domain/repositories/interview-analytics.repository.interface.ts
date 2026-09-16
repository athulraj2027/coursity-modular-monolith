import {
  AnalyticsOverviewDto,
  AnalyticsTimeseriesPointDto,
} from "../dtos/admin-interview.dto";

export interface IInterviewAnalyticsRepository {
  getOverviewMetrics(startDate?: Date, endDate?: Date): Promise<AnalyticsOverviewDto>;

  getTimeseriesMetrics(
    intervalDays?: number
  ): Promise<AnalyticsTimeseriesPointDto[]>;

  getTemplateMetrics(templateId: string): Promise<{
    templateId: string;
    totalSessions: number;
    completedSessions: number;
    passedSessions: number;
    failedSessions: number;
    passRate: number;
    averageScore: number;
    averageDurationSeconds: number;
  }>;
}
