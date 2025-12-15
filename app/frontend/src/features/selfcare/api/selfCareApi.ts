import { weeklyData, postureDistribution, calendarData } from '../data/selfManagementStats';

export interface SelfCareStats {
  averagePostureRate: number; // 이번 주 평균 바른 자세 유지율
  lastWeekAverageRate: number; // 전주 평균 바른 자세 유지율
  todayWarningCount: number; // 오늘 경고 횟수
  weekWarningCount: number; // 이번 주 경고 횟수
  mostFrequentProblem: {
    name: string;
    count: number;
  };
  consecutiveDays: number; // 연속 목표 달성 일수
  goalRate: number; // 목표 유지율
}

// 임시 데이터 - 실제로는 API에서 가져와야 함
export const getSelfCareStats = async (): Promise<SelfCareStats> => {
  try {
    
    // 임시 데이터 반환
    const weekAverage = weeklyData.reduce((sum, d) => sum + d.posture, 0) / weeklyData.length;
    const lastWeekAverage = weekAverage - 5.2; // 전주 대비 +5.2%를 위해
    
    return {
      averagePostureRate: weekAverage,
      lastWeekAverageRate: lastWeekAverage,
      todayWarningCount: 23,
      weekWarningCount: weeklyData.reduce((sum, d) => sum + d.warnings, 0),
      mostFrequentProblem: {
        name: '거북목',
        count: 35,
      },
      consecutiveDays: 7,
      goalRate: 80,
    };
  } catch (error) {
    console.error('Failed to fetch self-care stats:', error);
    throw error;
  }
};

export const getWeeklyData = async () => {
  // TODO: 실제 API 호출
  return weeklyData;
};

export const getPostureDistribution = async () => {
  // TODO: 실제 API 호출
  return postureDistribution;
};

export const getCalendarData = async () => {
  // TODO: 실제 API 호출
  return calendarData;
};
