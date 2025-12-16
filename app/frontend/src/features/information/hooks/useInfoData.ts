/**
 * 정보 제공 페이지용 React Hooks
 * loading, error 상태를 포함한 커스텀 훅
 */

import { useState, useEffect, useCallback } from 'react';
import * as infoApi from '../api/infoApi';
import type { InfoItem, InfoDetail, Category } from '../types/info';

interface UseInfoDataOptions {
  category?: Category | string;
  keyword?: string;
  autoFetch?: boolean;
}

export function useInfoData(options: UseInfoDataOptions = {}) {
  const { category, keyword, autoFetch = true } = options;
  const [data, setData] = useState<InfoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await infoApi.getInfoList({
        category: category === 'all' ? undefined : category,
        keyword: keyword || undefined,
      });
      setData(items);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('정보 목록 조회 실패');
      setError(error);
      console.error('정보 목록 조회 실패:', err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [category, keyword]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, category, keyword]); // fetchData 대신 category, keyword를 직접 의존성으로 사용

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

export function useInfoDetail(id: number | null) {
  const [data, setData] = useState<InfoDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id === null) {
      setData(null);
      return;
    }

    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const item = await infoApi.getInfoDetail(id);
        setData(item);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('정보 상세 조회 실패');
        setError(error);
        console.error('정보 상세 조회 실패:', err);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  return {
    data,
    isLoading,
    error,
  };
}

