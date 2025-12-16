/**
 * 정보 제공 API 모듈
 * 백엔드 정보/가이드 API와 통신
 */

import apiClient from '../../../api/api';
import type { InfoItem, InfoDetail } from '../types/info';

/**
 * 정보/가이드 목록 조회
 * POST /api/content/search
 * 
 * @param category 필터링할 카테고리 (optional) - '자세', '스트레칭' 등
 * @param keyword 검색 키워드 (optional)
 */
export async function getInfoList(params?: {
  category?: string;
  keyword?: string;
}): Promise<InfoItem[]> {
  try {
    // 정보 제공 API는 public이므로 accessToken이 없어도 호출 가능
    console.log('[Info API] getInfoList 호출 시작:', {
      category: params?.category,
      keyword: params?.keyword,
    });
    
    // 빈 객체인 경우도 body로 전송
    const requestBody: { category?: string; keyword?: string } = {};
    if (params?.category) {
      requestBody.category = params.category;
    }
    if (params?.keyword) {
      requestBody.keyword = params.keyword;
    }
    
    const response = await apiClient.post<InfoItem[]>('/api/content/search', requestBody);
    
    console.log('[Info API] getInfoList 성공:', {
      itemCount: response.data?.length || 0,
    });
    
    return response.data;
  } catch (error) {
    console.error('[Info API] getInfoList error', error);
    
    // 에러 메시지 추출
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      const errorMessage = 
        axiosError.response?.data?.message || 
        axiosError.message || 
        '정보 목록 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
    
    throw new Error('정보 목록 조회에 실패했습니다.');
  }
}

/**
 * 정보/가이드 상세 조회
 * GET /api/content/:id
 * 
 * @param id 정보 항목 ID
 */
export async function getInfoDetail(id: number): Promise<InfoDetail> {
  try {
    // 정보 제공 API는 public이므로 accessToken이 없어도 호출 가능
    const response = await apiClient.get<InfoDetail>(`/api/content/${id}`);
    return response.data;
  } catch (error) {
    console.error('[Info API] getInfoDetail error', error);
    
    // 에러 메시지 추출
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      const errorMessage = 
        axiosError.response?.data?.message || 
        axiosError.message || 
        '정보 상세 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
    
    throw new Error('정보 상세 조회에 실패했습니다.');
  }
}

