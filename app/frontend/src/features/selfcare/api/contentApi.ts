/**
 * src/features/selfcare/api/contentApi.ts
 * 
 * Content API 연동 함수
 * Base URL: https://api.postura.com (프로덕션)
 *          http://localhost:8080 (로컬 개발)
 */

import apiClient from '../../../api/api';
import type { ContentItem, ContentDetail, ApiResponse, StretchingRecommendationResponse } from '../../../types/content';

/**
 * 자세 가이드 목록 조회
 * GET /api/contents/postures
 * 
 * @returns 자세 가이드 목록
 * @throws Error API 호출 실패 시
 */
export async function getPostureGuides(): Promise<ContentItem[]> {
  try {
    const response = await apiClient.get<ContentItem[] | ApiResponse<ContentItem[]>>('/api/contents/postures');
    
    // 응답이 배열인 경우 (직접 반환)
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // 응답이 래퍼 객체인 경우
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      const wrappedResponse = response.data as ApiResponse<ContentItem[]>;
      if (!wrappedResponse.success) {
        throw new Error('자세 가이드 목록 조회에 실패했습니다.');
      }
      return wrappedResponse.data;
    }
    
    throw new Error('자세 가이드 목록 조회에 실패했습니다.');
  } catch (error) {
    console.error('[Content API] getPostureGuides error', error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || '자세 가이드 목록 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
    
    throw new Error('자세 가이드 목록 조회에 실패했습니다.');
  }
}

/**
 * 자세에 따른 스트레칭 추천 조회
 * GET /api/contents/stretchings?posture={posture}
 * 
 * @param posture 자세 타입 (예: "UNEQUAL_SHOULDERS")
 * @returns 추천 스트레칭 목록
 * @throws Error API 호출 실패 시
 */
export async function getStretchingsByPosture(posture: string): Promise<ContentItem[]> {
  try {
    const response = await apiClient.get<ContentItem[] | StretchingRecommendationResponse>('/api/contents/stretchings', {
      params: { posture },
    });
    
    // 응답이 배열인 경우 (직접 반환)
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // 응답이 래퍼 객체인 경우
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      const wrappedResponse = response.data as StretchingRecommendationResponse;
      if (!wrappedResponse.success) {
        throw new Error('스트레칭 추천 조회에 실패했습니다.');
      }
      return wrappedResponse.data;
    }
    
    throw new Error('스트레칭 추천 조회에 실패했습니다.');
  } catch (error) {
    console.error('[Content API] getStretchingsByPosture error', error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || '스트레칭 추천 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
    
    throw new Error('스트레칭 추천 조회에 실패했습니다.');
  }
}

/**
 * 스트레칭 전체 목록 조회
 * GET /api/contents/stretchings/all
 * 
 * @returns 스트레칭 전체 목록
 * @throws Error API 호출 실패 시
 */
export async function getAllStretchings(): Promise<ContentItem[]> {
  try {
    const response = await apiClient.get<ApiResponse<ContentItem[]>>('/api/contents/stretchings/all');
    
    if (!response.data.success) {
      throw new Error('스트레칭 전체 목록 조회에 실패했습니다.');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('[Content API] getAllStretchings error', error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || '스트레칭 전체 목록 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
    
    throw new Error('스트레칭 전체 목록 조회에 실패했습니다.');
  }
}

/**
 * 콘텐츠 상세 조회
 * GET /api/contents/{guideId}
 * 
 * @param guideId 가이드 ID
 * @returns 콘텐츠 상세 정보
 * @throws Error API 호출 실패 시
 */
export async function getContentDetail(guideId: number): Promise<ContentItem> {
  try {
    const response = await apiClient.get<ContentItem | ApiResponse<ContentItem>>(`/api/contents/${guideId}`);
    
    // 응답이 ContentItem 객체인 경우 (직접 반환)
    if (response.data && typeof response.data === 'object' && 'guideId' in response.data && !('success' in response.data)) {
      return response.data as ContentItem;
    }
    
    // 응답이 래퍼 객체인 경우
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      const wrappedResponse = response.data as ApiResponse<ContentItem>;
      if (!wrappedResponse.success) {
        throw new Error('콘텐츠 상세 조회에 실패했습니다.');
      }
      return wrappedResponse.data;
    }
    
    throw new Error('콘텐츠 상세 조회에 실패했습니다.');
  } catch (error) {
    console.error('[Content API] getContentDetail error', error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || '콘텐츠 상세 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
    
    throw new Error('콘텐츠 상세 조회에 실패했습니다.');
  }
}

/**
 * 콘텐츠 상세 조회 (새로운 API 엔드포인트)
 * GET /api/content/{id}
 * 
 * @param id 콘텐츠 ID
 * @returns 콘텐츠 상세 정보
 * @throws Error API 호출 실패 시
 */
export async function getContentById(id: number): Promise<ContentDetail> {
  try {
    const response = await apiClient.get<ContentDetail>(`/api/content/${id}`);
    return response.data;
  } catch (error) {
    console.error('[Content API] getContentById error', error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || '콘텐츠 상세 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
    
    throw new Error('콘텐츠 상세 조회에 실패했습니다.');
  }
}

