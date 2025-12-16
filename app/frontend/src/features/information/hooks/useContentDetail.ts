/**
 * 콘텐츠 상세 조회 훅
 */

import { useState, useEffect, useCallback } from 'react';
import * as infoApi from '../api/infoApi';
import type { InfoDetail } from '../types/info';

/**
 * 콘텐츠 상세 조회 훅
 * 
 * @param id 콘텐츠 ID (null이면 조회하지 않음)
 * @returns { data, isLoading, error, refetch }
 */
export function useContentDetail(id: number | null) {
  const [data, setData] = useState<InfoDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (id === null) {
      setData(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const content = await infoApi.getInfoDetail(id);
      setData(content);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('콘텐츠 상세 조회 실패');
      setError(error);
      console.error('콘텐츠 상세 조회 실패:', err);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

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

