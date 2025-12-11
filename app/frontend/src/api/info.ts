import apiClient from './api';
import type { InfoItem } from '../types/info';

/**
 * 정보/가이드 목록 조회
 * GET /api/info 또는 GET /api/guides
 * 
 * @param category 필터링할 카테고리 (optional)
 * @param keyword 검색 키워드 (optional)
 */
export async function getInfoList(params?: {
  category?: 'posture' | 'stretching';
  keyword?: string;
}): Promise<InfoItem[]> {
  const response = await apiClient.get<InfoItem[]>('/api/info', {
    params: {
      category: params?.category,
      keyword: params?.keyword,
    },
  });
  return response.data;
}

/**
 * 정보/가이드 상세 조회
 * GET /api/info/:id 또는 GET /api/guides/:id
 * 
 * @param id 정보 항목 ID
 */
export async function getInfoDetail(id: number): Promise<InfoItem> {
  const response = await apiClient.get<InfoItem>(`/api/info/${id}`);
  return response.data;
}

