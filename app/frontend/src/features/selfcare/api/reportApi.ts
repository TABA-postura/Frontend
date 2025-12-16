/**
 * 주간 리포트 API 모듈
 * GET /api/report/weekly
 */

import apiClient from '../../../api/api';
import type { StatReportDto } from '../types/report';

/**
 * 주간 리포트 조회
 * GET /api/report/weekly
 * 
 * @param weekStart - 주 시작일 (YYYY-MM-DD 형식, optional)
 * @returns 주간 리포트 통계 데이터
 * @throws Error API 호출 실패 시
 */
export const getWeeklyReport = async (
  weekStart?: string
): Promise<StatReportDto> => {
  try {
    const params = weekStart ? { weekStart } : undefined;
    
    console.log('[Report API] getWeeklyReport 호출 시작:', { weekStart, params });
    
    const response = await apiClient.get<StatReportDto>('/api/report/weekly', {
      params,
    });
    
    console.log('[Report API] getWeeklyReport 응답 데이터:', {
      status: response.status,
      data: response.data,
      fullResponse: JSON.stringify(response.data, null, 2),
    });
    
    return response.data;
  } catch (error) {
    console.error('[Report API] getWeeklyReport error', error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        '주간 리포트 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
    
    throw new Error('주간 리포트 조회에 실패했습니다.');
  }
};

