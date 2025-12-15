/**
 * 콘텐츠 관련 커스텀 훅
 * API 기반 콘텐츠 목록 및 상세 조회 기능 제공
 */

import { useState, useEffect, useCallback } from 'react';
import * as contentApi from '../api/content';
import type { ContentSummary, ContentDetail, ContentCategory } from '../types/content';

/**
 * 콘텐츠 목록 조회 훅
 * 
 * @param keyword 검색 키워드 (optional)
 * @param category 카테고리 필터 (optional)
 * @returns { data, isLoading, error, refetch }
 */
export function useContentList(
  keyword?: string,
  category?: ContentCategory | 'all'
) {
  const [data, setData] = useState<ContentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params: { keyword?: string; category?: ContentCategory } = {};
      
      // keyword가 있으면 추가
      if (keyword && keyword.trim()) {
        params.keyword = keyword.trim();
      }
      
      // category가 'all'이 아니고 실제 ContentCategory 타입이면 추가
      if (category && category !== 'all') {
        params.category = category as ContentCategory;
      }
      
      // params가 비어있으면 undefined 전달 (전체 조회)
      const items = await contentApi.searchContents(Object.keys(params).length > 0 ? params : undefined);
      setData(items);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('콘텐츠 목록 조회 실패');
      setError(error);
      console.error('콘텐츠 목록 조회 실패:', err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, category]);

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

/**
 * 콘텐츠 상세 조회 훅
 * 
 * @param id 콘텐츠 ID (null이면 조회하지 않음)
 * @returns { data, isLoading, error }
 */
export function useContentDetail(id: number | null) {
  const [data, setData] = useState<ContentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id === null) {
      setData(null);
      setError(null);
      return;
    }

    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const item = await contentApi.getContentDetail(id);
        setData(item);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('콘텐츠 상세 조회 실패');
        setError(error);
        console.error('콘텐츠 상세 조회 실패:', err);
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

