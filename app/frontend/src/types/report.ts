export interface Recommendation {
  problemType: string;
  recommendedGuideTitle: string;
  guideId: number;
}

export interface StatReportDto {
  dates: string[];
  correctRatios: number[];
  warningCounts: number[];
  currentAvgRatio: number;
  weeklyAvgRatio: number;
  ratioChangeVsPreviousWeek: number;
  currentTotalWarning: number;
  weeklyTotalWarning: number;
  currentConsecutiveAchievedDays: number;
  mostFrequentIssue: string;
  postureDistribution: Record<string, number>;
  recommendations: Recommendation[];
}

