/**
 * Monitor API 모듈
 * 백엔드 모니터링 세션 API와 통신하는 함수들을 제공합니다.
 * 
 * 주의: 이 파일은 axios를 사용합니다. axios가 설치되어 있지 않다면 다음 명령어로 설치하세요:
 * npm install axios
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// ==================== 타입 정의 ====================

/**
 * 모니터링 세션 상태 타입
 */
export type MonitorSessionStatus = 'STARTED' | 'PAUSED' | 'COMPLETED';

/**
 * 모니터링 세션 기본 정보 (히스토리 목록용)
 */
export interface MonitoringSession {
  id: number;
  userId: number;
  startAt: string; // ISO8601
  endAt?: string | null;
  status: MonitorSessionStatus;
  accumulatedDurationSeconds: number;
  totalDurationSeconds?: number | null;
}

/**
 * 세션 시작 응답 (단일 세션 생성 시)
 */
export interface StartSessionResponse {
  sessionId: number;
  startAt: string;
  status: MonitorSessionStatus;
}

/**
 * 세션 통계 응답
 */
export interface SessionStats {
  sessionId: number;
  totalDurationSeconds: number;
  goodPostureRatio: number; // 0~100 (%)
  warningCount: number;
  createdAt: string; // 리포트 생성 시각
  // 추가 필드 (백엔드 DTO 구조에 따라 확장 가능)
  issueStats?: {
    forwardHeadCount?: number;
    bentBackCount?: number;
    shoulderAsymmetryCount?: number;
  };
}

// ==================== API 클라이언트 설정 ====================

/**
 * 공통 axios 인스턴스 생성
 * - baseURL: "/api" 설정
 * - 요청마다 Authorization 헤더에 JWT 토큰 자동 추가
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 요청 인터셉터: 모든 요청에 JWT 토큰을 Authorization 헤더에 추가
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 응답 인터셉터: 에러 처리 (선택사항)
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 401 Unauthorized 에러 처리 (토큰 만료 등)
    if (error.response?.status === 401) {
      console.error('[Monitor API] 인증 실패: 토큰이 만료되었거나 유효하지 않습니다.');
      // 필요시 로그아웃 처리 또는 토큰 갱신 로직 추가 가능
    }
    return Promise.reject(error);
  }
);

// ==================== API 함수 ====================

/**
 * 모니터링 세션을 시작한다.
 * - 백엔드가 JWT에서 userId를 추출하여 MonitoringSession을 생성한다.
 * - 성공 시 sessionId, startAt, status 등을 반환한다.
 * 
 * @returns 세션 시작 응답 (sessionId, startAt, status)
 * @throws Error API 호출 실패 시
 */
export async function startSession(): Promise<StartSessionResponse> {
  try {
    const response = await apiClient.post<StartSessionResponse>('/monitor/sessions', {});
    return response.data;
  } catch (error) {
    console.error('[Monitor API] startSession error', error);
    
    // 에러 메시지 추출
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || '세션 시작에 실패했습니다.';
      throw new Error(errorMessage);
    }
    
    throw error;
  }
}

/**
 * 특정 모니터링 세션을 종료한다.
 * - 세션의 endAt, totalDurationSeconds 등을 확정하는 용도.
 * 
 * @param sessionId 종료할 세션 ID
 * @throws Error API 호출 실패 시
 */
export async function endSession(sessionId: number): Promise<void> {
  try {
    await apiClient.post(`/monitor/sessions/${sessionId}/end`, {});
    // 성공 시 별도 응답 본문이 없으므로 void 반환
  } catch (error) {
    console.error('[Monitor API] endSession error', error);
    
    // 에러 메시지 추출
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || '세션 종료에 실패했습니다.';
      throw new Error(errorMessage);
    }
    
    throw error;
  }
}

/**
 * 현재 로그인한 사용자의 모니터링 세션 히스토리를 조회한다.
 * 
 * @returns 사용자의 세션 목록
 * @throws Error API 호출 실패 시
 */
export async function getSessionHistory(): Promise<MonitoringSession[]> {
  try {
    const response = await apiClient.get<MonitoringSession[]>('/monitor/sessions');
    return response.data;
  } catch (error) {
    console.error('[Monitor API] getSessionHistory error', error);
    
    // 에러 메시지 추출
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || '세션 히스토리 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
    
    throw error;
  }
}

/**
 * 특정 세션에 대한 통계/요약 데이터를 조회한다.
 * 
 * @param sessionId 통계를 조회할 세션 ID
 * @returns 세션 통계 데이터
 * @throws Error API 호출 실패 시
 */
export async function getSessionStats(sessionId: number): Promise<SessionStats> {
  try {
    const response = await apiClient.get<SessionStats>(`/monitor/sessions/${sessionId}/stats`);
    return response.data;
  } catch (error) {
    console.error('[Monitor API] getSessionStats error', error);
    
    // 에러 메시지 추출
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || '세션 통계 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
    
    throw error;
  }
}

// ==================== 모듈 Export ====================

/**
 * Monitor API 함수들을 모아놓은 객체
 * 사용 예시:
 * ```ts
 * import { monitorApi } from '@/features/monitor/api/monitorApi';
 * const session = await monitorApi.startSession();
 * ```
 */
export const monitorApi = {
  startSession,
  endSession,
  getSessionHistory,
  getSessionStats,
};
