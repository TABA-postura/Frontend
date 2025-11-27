// app/frontend/src/features/selfcare/data/selfManagementStats.ts

export interface WeeklyStat {
  day: string; // "월" ~ "일"
  posture: number; // 바른 자세 유지율 (%)
  warnings: number; // 경고 횟수
}

export interface PostureDistributionItem {
  name: string; // 문제 유형 이름
  value: number; // 비율
  color: string; // 차트용 색상 코드
}

export interface CalendarStat {
  date: number; // 일 (1~31)
  rate: number; // 바른 자세 유지율 (%)
}

export const weeklyData: WeeklyStat[] = [
  { day: '월', posture: 75, warnings: 18 },
  { day: '화', posture: 82, warnings: 12 },
  { day: '수', posture: 78, warnings: 15 },
  { day: '목', posture: 85, warnings: 10 },
  { day: '금', posture: 88, warnings: 8 },
  { day: '토', posture: 92, warnings: 5 },
  { day: '일', posture: 80, warnings: 14 },
];

export const postureDistribution: PostureDistributionItem[] = [
  { name: '거북목', value: 35, color: '#ef4444' },
  { name: '어깨 기울어짐', value: 25, color: '#f59e0b' },
  { name: '화면 거리', value: 20, color: '#eab308' },
  { name: '등 굽음', value: 15, color: '#84cc16' },
  { name: '기타', value: 5, color: '#6366f1' },
];

export const calendarData: CalendarStat[] = [
  { date: 1, rate: 75 },
  { date: 2, rate: 82 },
  { date: 3, rate: 78 },
  { date: 4, rate: 85 },
  { date: 5, rate: 88 },
  { date: 6, rate: 92 },
  { date: 7, rate: 80 },
  { date: 8, rate: 76 },
  { date: 9, rate: 83 },
  { date: 10, rate: 79 },
  { date: 11, rate: 86 },
  { date: 12, rate: 90 },
  { date: 13, rate: 85 },
  { date: 14, rate: 81 },
  { date: 15, rate: 77 },
  { date: 16, rate: 84 },
  { date: 17, rate: 88 },
  { date: 18, rate: 91 },
  { date: 19, rate: 83 },
  { date: 20, rate: 79 },
  { date: 21, rate: 85 },
  { date: 22, rate: 87 },
  { date: 23, rate: 89 },
  { date: 24, rate: 86 },
  { date: 25, rate: 82 },
  { date: 26, rate: 88 },
  { date: 27, rate: 90 },
  { date: 28, rate: 84 },
  { date: 29, rate: 81 },
  { date: 30, rate: 87 },
];

