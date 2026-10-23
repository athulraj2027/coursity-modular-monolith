import { AdminAnalyticsData } from "../dtos/admin-analytics.dto";

export interface IAdminAnalyticsRepository {
  getAnalyticsData(): Promise<AdminAnalyticsData>;
}
