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
      sampleItem: response.data?.[0], // 첫 번째 아이템 샘플 출력
    });
    
    // 백엔드 응답에서 imageUrl 필드를 s3ImageUrl로 매핑 (필드 이름이 다른 경우 대비)
    const mappedData = response.data?.map((item: any) => {
      // imageUrl 필드를 우선적으로 사용 (백엔드에서 실제로 사용하는 필드명)
      const imageUrl = item.imageUrl || item.s3ImageUrl || item.image_url || null;
      return {
        ...item,
        s3ImageUrl: imageUrl,
      };
    }) || [];
    
    console.log('[Info API] 매핑된 데이터 샘플:', {
      original: response.data?.[0],
      mapped: mappedData[0],
    });
    
    return mappedData;
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
    
    console.log('[Info API] getInfoDetail 성공:', {
      id,
      data: response.data,
    });
    
    // 백엔드 응답에서 imageUrl 필드를 s3ImageUrl로 매핑 (필드 이름이 다른 경우 대비)
    const data = response.data as any;
    // imageUrl 필드를 우선적으로 사용 (백엔드에서 실제로 사용하는 필드명)
    const imageUrl = data.imageUrl || data.s3ImageUrl || data.image_url || null;
    const mappedData: InfoDetail = {
      ...data,
      s3ImageUrl: imageUrl,
    };
    
    console.log('[Info API] 매핑된 상세 데이터:', {
      original: data,
      mapped: mappedData,
    });
    
    return mappedData;
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

