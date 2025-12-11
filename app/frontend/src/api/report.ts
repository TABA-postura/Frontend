import apiClient from './api';

// ==================== 타입 정의 ====================

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

// ==================== API 함수 ====================

/**
 * 주간 리포트 조회
 * GET /report/weekly?weekStart=YYYY-MM-DD
 * 
 * @param weekStart 주의 시작일 (YYYY-MM-DD 형식, 일반적으로 월요일)
 */
export async function getWeeklyReport(weekStart: string): Promise<StatReportDto> {
  const response = await apiClient.get<StatReportDto>('/report/weekly', {
    params: {
      weekStart,
    },
  });
  return response.data;
}

/**
 * 이번 주 월요일 날짜를 계산하여 주간 리포트 조회
 */
export async function getCurrentWeekReport(): Promise<StatReportDto> {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (일요일) ~ 6 (토요일)
  
  // 월요일로 조정 (월요일 = 1, 일요일 = 0이므로 일요일은 -6일, 나머지는 1-dayOfWeek)
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, '0');
  const day = String(monday.getDate()).padStart(2, '0');
  const weekStart = `${year}-${month}-${day}`;
  
  return getWeeklyReport(weekStart);
}

