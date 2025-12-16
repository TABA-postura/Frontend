/**
 * 콘텐츠 API 타입 정의
 * 백엔드 API 응답 구조에 맞춰 정의
 */

/**
 * 콘텐츠 카테고리 타입
 * 백엔드에서 한글 값으로 전달됨
 */
export type ContentCategory = "자세" | "스트레칭" | "교정 운동";

/**
 * 콘텐츠 목록 조회 응답 (Summary)
 * POST /api/content/search 응답
 */
export interface ContentSummary {
  id: number;
  title: string;
  category: ContentCategory;
  relatedPart: string;
  s3ImageUrl: string | null;
}

/**
 * 콘텐츠 상세 조회 응답 (Detail)
 * GET /api/content/{id} 응답
 */
export interface ContentDetail {
  id: number;
  title: string;
  category: string;
  contentText: string;
  relatedPart: string;
  s3ImageUrl: string | null;
}

/**
 * 콘텐츠 검색 요청 파라미터
 */
export interface ContentSearchParams {
  keyword?: string;
  category?: ContentCategory;
}

/**
 * Content API 명세에 따른 콘텐츠 아이템 타입
 * GET /api/contents/* 응답 구조
 */
export interface ContentItem {
  guideId: number;
  title: string;
  category?: '자세' | '스트레칭';
  posture: string;
  relatedPart: string;
  contentText: string;
  imageUrl: string | null;
}

/**
 * API 응답 래퍼 타입
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * 스트레칭 추천 응답 타입
 */
export interface StretchingRecommendationResponse {
  success: boolean;
  posture: string;
  data: ContentItem[];
}

