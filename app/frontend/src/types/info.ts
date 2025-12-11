// 타입 정의를 별도 파일로 분리 (백엔드 API와 공유)

export type Category = 'all' | 'posture' | 'stretching';

export interface InfoDetail {
  fullDescription: string;
  signal?: string;
  note?: string;
  causes?: string[];
  symptoms?: string[];
  precautions: string[];
  methods: string[];
  effect?: string;
  recommendedStretching?: string[];
}

export interface InfoItem {
  id: number;
  title: string;
  description: string;
  category: 'posture' | 'stretching';
  tags: string[];
  detail: InfoDetail;
}

