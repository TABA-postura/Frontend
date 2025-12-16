/**
 * 주간 리포트 관련 타입 정의
 */

/**
 * 추천 가이드 DTO
 */
export interface RecommendationDto {
  problemType: string;
  recommendedGuideTitle: string;
  guideId: number;
}

/**
 * 주간 리포트 통계 DTO
 */
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

  recommendations: RecommendationDto[];
}

