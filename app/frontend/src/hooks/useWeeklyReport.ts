import { useState, useEffect, useCallback } from 'react';
import * as reportApi from '../api/report';
import type { StatReportDto } from '../types/report';

export function useWeeklyReport(weekStart?: string) {
  const [data, setData] = useState<StatReportDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchReport = useCallback(async (startDate?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      let report: StatReportDto;
      if (startDate) {
        report = await reportApi.getWeeklyReport(startDate);
      } else {
        report = await reportApi.getCurrentWeekReport();
      }
      setData(report);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('주간 리포트 조회 실패');
      setError(error);
      console.error('주간 리포트 조회 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(weekStart);
  }, [weekStart, fetchReport]);

  const refetch = useCallback(() => {
    fetchReport(weekStart);
  }, [weekStart, fetchReport]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

