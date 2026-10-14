export interface RevenueTimeframePoint {
  label: string;
  date: string;
  gmv: number;
  net: number;
  payouts: number;
  transactions: number;
}

export interface UserGrowthTimeframePoint {
  label: string;
  date: string;
  students: number;
  teachers: number;
}

export interface CategoryDistributionItem {
  id: string;
  name: string;
  slug: string;
  count: number;
  color: string;
  paidCount: number;
  freeCount: number;
  publishedCount: number;
  draftCount: number;
}

export interface VerificationFunnelStats {
  totalSubmitted: number;
  interviewAttempted: number;
  interviewPassed: number;
  underReview: number;
  redoRequested: number;
  verified: number;
  revoked: number;
  avgTurnaroundHours: number;
}

export interface AdminAnalyticsData {
  revenue: {
    timeframes: {
      "7D": RevenueTimeframePoint[];
      "30D": RevenueTimeframePoint[];
      "90D": RevenueTimeframePoint[];
      "1Y": RevenueTimeframePoint[];
    };
    summary: {
      totalGmv: number;
      totalNet: number;
      totalPayouts: number;
      totalTransactions: number;
      growthRate: number;
    };
  };
  userGrowth: {
    timeframes: {
      "7D": UserGrowthTimeframePoint[];
      "30D": UserGrowthTimeframePoint[];
      "90D": UserGrowthTimeframePoint[];
      "1Y": UserGrowthTimeframePoint[];
    };
    summary: {
      totalStudents: number;
      totalTeachers: number;
      verifiedTeachers: number;
    };
  };
  categoryDistribution: CategoryDistributionItem[];
  verificationFunnel: VerificationFunnelStats;
}
