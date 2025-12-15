/**
 * 콘텐츠 API 모듈
 * 백엔드 콘텐츠 검색 및 상세 조회 API와 통신
 */

import apiClient from './api';
import type { ContentSummary, ContentDetail, ContentSearchParams } from '../types/content';

/**
 * 콘텐츠 목록 검색
 * POST /api/content/search
 * 
 * @param params 검색 파라미터 (keyword, category)
 * @returns 콘텐츠 목록 (Summary)
 * @throws Error API 호출 실패 시
 */
export async function searchContents(
  params?: ContentSearchParams
): Promise<ContentSummary[]> {
  try {
    const response = await apiClient.post<ContentSummary[]>('/api/content/search', params || {});
    return response.data;
  } catch (error) {
    console.error('[Content API] searchContents error', error);
    
    // 에러 메시지 추출
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || '콘텐츠 목록 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
    
    throw new Error('콘텐츠 목록 조회에 실패했습니다.');
  }
}

/**
 * 콘텐츠 상세 조회
 * GET /api/content/{id}
 * 
 * @param id 콘텐츠 ID
 * @returns 콘텐츠 상세 정보
 * @throws Error API 호출 실패 시
 */
export async function getContentDetail(id: number): Promise<ContentDetail> {
  try {
    const response = await apiClient.get<ContentDetail>(`/api/content/${id}`);
    return response.data;
  } catch (error) {
    console.error('[Content API] getContentDetail error', error);
    
    // 에러 메시지 추출
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || '콘텐츠 상세 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
    
    throw new Error('콘텐츠 상세 조회에 실패했습니다.');
  }
}

