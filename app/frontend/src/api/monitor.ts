/**
 * 모니터링 API 모듈
 * 백엔드 모니터링 세션 제어 및 실시간 피드백 API와 통신
 */

import apiClient from './api';

/* =======================
   타입 정의
======================= */

/**
 * 모니터링 세션 시작 응답
 */
export interface SessionStartResponse {
  /** 새로 생성된 모니터링 세션의 고유 ID */
  sessionId: number;
  /** 세션 시작 시간 (ISO 8601 형식) */
  startTime: string;
}

/**
 * 실시간 피드백 응답
 */
export interface RealtimeFeedbackResponse {
  /** 현재 AI가 판단한 자세 상태 배열 (예: ["FORWARD_HEAD", "TOO_CLOSE"]) */
  currentPostureStates: string[];
  /** 사용자에게 표시할 코칭 메시지 배열 */
  feedbackMessages: string[];
  /** 현재 시간 (ISO 8601 형식, 프론트엔드 동기화 용) */
  currentTime: string;
  /** 바른 자세 유지율 (0.0 ~ 100.0) */
  correctPostureRatio: number;
  /** 총 경고 횟수 */
  totalWarningCount: number;
  /** 세션 내 자세 유형별 누적 횟수 (예: { "FORWARD_HEAD": 6, "TOO_CLOSE": 3 }) */
  postureTypeCounts: Record<string, number>;
}

/**
 * 모니터링 세션 제어 요청 (PAUSE, RESUME, COMPLETE 공통 사용)
 */
export interface SessionControlRequest {
  /** 세션 ID */
  sessionId: number;
}

/* =======================
   API 함수
======================= */

/**
 * 모니터링 세션 시작
 * POST /api/monitor/start
 * 
 * 새로운 세션을 생성하고 sessionId를 반환합니다.
 * sessionId는 프론트엔드에서 컴포넌트 상태나 메모리에 저장하여 사용합니다.
 * 
 * @returns SessionStartResponse - sessionId와 startTime 반환
 * @throws Error API 호출 실패 시
 */
export async function startMonitoringSession(): Promise<SessionStartResponse> {
  try {
    const res = await apiClient.post<SessionStartResponse>(
      '/api/monitor/start'
    );
    return res.data;
  } catch (error) {
    console.error('[Monitor API] startMonitoringSession error', error);
    
    // 에러 메시지 추출
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      const errorMessage = 
        axiosError.response?.data?.message || 
        axiosError.message || 
        '모니터링 세션 시작에 실패했습니다.';
      throw new Error(errorMessage);
    }
    
    throw new Error('모니터링 세션 시작에 실패했습니다.');
  }
}

/**
 * 실시간 피드백 폴링 (1초 주기)
 * GET /api/monitor/feedback
 * 
 * React가 1초마다 폴링하여 최신 자세 상태 및 통계를 조회합니다.
 * 
 * @returns RealtimeFeedbackResponse - 현재 자세 상태, 피드백 메시지, 통계 데이터
 * @throws Error API 호출 실패 시
 */
export async function getRealtimeFeedback(): Promise<RealtimeFeedbackResponse> {
  try {
    const res = await apiClient.get<RealtimeFeedbackResponse>(
      '/api/monitor/feedback'
    );
    return res.data;
  } catch (error) {
    console.error('[Monitor API] getRealtimeFeedback error', error);
    
    // 에러 메시지 추출
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      const errorMessage = 
        axiosError.response?.data?.message || 
        axiosError.message || 
        '실시간 피드백 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
    
    throw new Error('실시간 피드백 조회에 실패했습니다.');
  }
}

/**
 * 모니터링 일시정지
 * POST /api/monitor/pause
 * 
 * DB 상태를 PAUSED로 변경합니다.
 * 성공 응답 후 프론트엔드에서 이미지 전송을 중단해야 합니다.
 * 
 * @param sessionId 세션 ID
 * @throws Error API 호출 실패 시
 */
export async function pauseMonitoringSession(
  sessionId: number
): Promise<void> {
  try {
    await apiClient.post('/api/monitor/pause', { sessionId });
  } catch (error) {
    console.error('[Monitor API] pauseMonitoringSession error', error);
    
    // 에러 메시지 추출
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      const errorMessage = 
        axiosError.response?.data?.message || 
        axiosError.message || 
        '모니터링 일시정지에 실패했습니다.';
      throw new Error(errorMessage);
    }
    
    throw new Error('모니터링 일시정지에 실패했습니다.');
  }
}

/**
 * 모니터링 재개
 * POST /api/monitor/resume
 * 
 * DB 상태를 STARTED로 변경합니다.
 * 성공 응답 후 프론트엔드에서 이미지 전송을 재개해야 합니다.
 * 
 * @param sessionId 세션 ID
 * @throws Error API 호출 실패 시
 */
export async function resumeMonitoringSession(
  sessionId: number
): Promise<void> {
  try {
    await apiClient.post('/api/monitor/resume', { sessionId });
  } catch (error) {
    console.error('[Monitor API] resumeMonitoringSession error', error);
    
    // 에러 메시지 추출
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      const errorMessage = 
        axiosError.response?.data?.message || 
        axiosError.message || 
        '모니터링 재개에 실패했습니다.';
      throw new Error(errorMessage);
    }
    
    throw new Error('모니터링 재개에 실패했습니다.');
  }
}

/**
 * 모니터링 종료
 * POST /api/monitor/complete
 * 
 * 세션 최종 정산 및 DB에 finalCounts를 기록합니다 (백엔드 처리).
 * 성공 응답 후 프론트엔드에서 이미지 전송을 완전히 종료해야 합니다.
 * 
 * @param sessionId 세션 ID
 * @throws Error API 호출 실패 시
 */
export async function completeMonitoringSession(
  sessionId: number
): Promise<void> {
  try {
    await apiClient.post('/api/monitor/complete', { sessionId });
  } catch (error) {
    console.error('[Monitor API] completeMonitoringSession error', error);
    
    // 에러 메시지 추출
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      const errorMessage = 
        axiosError.response?.data?.message || 
        axiosError.message || 
        '모니터링 종료에 실패했습니다.';
      throw new Error(errorMessage);
    }
    
    throw new Error('모니터링 종료에 실패했습니다.');
  }
}

/**
 * 이미지 프레임 전송 (필요시)
 * POST /api/monitor/frame
 * 
 * @param sessionId 세션 ID
 * @param image 이미지 데이터 (base64 문자열 또는 Blob)
 * @throws Error API 호출 실패 시
 */
export async function sendFrame(sessionId: number, image: string): Promise<void> {
  try {
    await apiClient.post('/api/monitor/frame', {
      sessionId,
      image,
    });
  } catch (error) {
    console.error('[Monitor API] sendFrame error', error);
    
    // 에러 메시지 추출
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      const errorMessage = 
        axiosError.response?.data?.message || 
        axiosError.message || 
        '프레임 전송에 실패했습니다.';
      throw new Error(errorMessage);
    }
    
    throw new Error('프레임 전송에 실패했습니다.');
  }
}
