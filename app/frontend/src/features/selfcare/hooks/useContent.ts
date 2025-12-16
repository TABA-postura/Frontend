/**
 * src/features/selfcare/hooks/useContent.ts
 * 
 * Content API를 사용하는 React Hooks
 * loading, error 상태를 포함한 커스텀 훅
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getPostureGuides,
  getStretchingsByPosture,
  getAllStretchings,
  getContentDetail,
} from '../api/contentApi';
import type { ContentItem } from '../../../types/content';

/**
 * 자세 가이드 목록 조회 Hook
 */
export function usePostureGuides() {
  const [data, setData] = useState<ContentItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getPostureGuides();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '자세 가이드 목록을 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('[usePostureGuides] API 호출 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * 자세에 따른 스트레칭 추천 Hook
 */
export function useStretchings(posture: string | null) {
  const [data, setData] = useState<ContentItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!posture) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await getStretchingsByPosture(posture);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '스트레칭 추천을 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('[useStretchings]', err);
    } finally {
      setLoading(false);
    }
  }, [posture]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * 스트레칭 전체 목록 조회 Hook
 */
export function useAllStretchings() {
  const [data, setData] = useState<ContentItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllStretchings();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '스트레칭 전체 목록을 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('[useAllStretchings] API 호출 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * 콘텐츠 상세 조회 Hook
 */
export function useContentDetail(guideId: number | null) {
  const [data, setData] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!guideId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await getContentDetail(guideId);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '콘텐츠 상세 정보를 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('[useContentDetail]', err);
    } finally {
      setLoading(false);
    }
  }, [guideId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

