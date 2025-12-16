// 타입 정의를 별도 파일로 분리 (백엔드 API와 공유)

export type Category = 'all' | '자세' | '스트레칭';

// 목록 조회 응답 타입
export interface InfoItem {
  id: number;
  title: string;
  category: string; // '자세', '스트레칭', '교정 운동' 등
  relatedPart: string; // '목', '어깨', '허리' 등
  s3ImageUrl: string | null;
}

// 상세 조회 응답 타입
export interface InfoDetail {
  id: number;
  title: string;
  category: string;
  contentText: string;
  s3ImageUrl: string | null;
  relatedPart: string;
}

