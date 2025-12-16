/**
 * 주간 리포트 조회 React Query 훅
 * 
 * ⚠️ React Query 설치 필요: npm install @tanstack/react-query
 * 
 * React Query가 설치되어 있지 않은 경우, 기존 패턴(useState/useEffect)을 사용하세요.
 */

import { useState, useEffect, useCallback } from 'react';
import { getWeeklyReport } from '../api/reportApi';
import type { StatReportDto } from '../types/report';

/**
 * 주간 리포트 조회 훅
 * 
 * @param weekStart - 주 시작일 (YYYY-MM-DD 형식, optional)
 * @returns { data, isLoading, error, refetch }
 * 
 * TODO: React Query 설치 후 아래 코드로 교체
 * import { useQuery } from '@tanstack/react-query';
 * export function useWeeklyReport(weekStart?: string) {
 *   return useQuery<StatReportDto, Error>({
 *     queryKey: ['weeklyReport', weekStart ?? 'current'],
 *     queryFn: () => getWeeklyReport(weekStart),
 *     staleTime: 5 * 60 * 1000, // 5분
 *     retry: 1,
 *   });
 * }
 */
export function useWeeklyReport(weekStart?: string) {
  const [data, setData] = useState<StatReportDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const report = await getWeeklyReport(weekStart);
      console.log('[useWeeklyReport] 백엔드로부터 받은 데이터:', {
        report,
        reportStringified: JSON.stringify(report, null, 2),
      });
      setData(report);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('주간 리포트 조회 실패');
      setError(error);
      console.error('[useWeeklyReport] 주간 리포트 조회 실패:', err);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

