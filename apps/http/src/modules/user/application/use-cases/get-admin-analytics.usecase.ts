import { IAdminAnalyticsRepository } from "../../domain/repositories/admin-analytics.repository";
import { AdminAnalyticsData } from "../../domain/dtos/admin-analytics.dto";

export class GetAdminAnalytics {
  constructor(private readonly analyticsRepository: IAdminAnalyticsRepository) {}

  async execute(): Promise<AdminAnalyticsData> {
    return this.analyticsRepository.getAnalyticsData();
  }
}
