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

