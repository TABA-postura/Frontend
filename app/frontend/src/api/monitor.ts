import apiClient from './api';

// ==================== 타입 정의 ====================

export interface SessionStartResponse {
  sessionId: number;
  startTime: string;
}

export interface RealtimeFeedbackResponse {
  currentPostureStates: string[];
  feedbackMessages: string[];
  currentTime: string;
  correctPostureRatio: number;
  totalWarningCount: number;
  postureTypeCounts: Record<string, number>;
}

export interface PauseRequest {
  sessionId: number;
}

export interface ResumeRequest {
  sessionId: number;
}

export interface CompleteRequest {
  sessionId: number;
}

// ==================== API 함수 ====================

/**
 * 모니터링 세션 시작
 * POST /monitor/start
 */
export async function startMonitoringSession(): Promise<SessionStartResponse> {
  const response = await apiClient.post<SessionStartResponse>('/monitor/start', {});
  return response.data;
}

/**
 * 실시간 피드백 폴링
 * GET /monitor/feedback
 */
export async function getRealtimeFeedback(): Promise<RealtimeFeedbackResponse> {
  const response = await apiClient.get<RealtimeFeedbackResponse>('/monitor/feedback');
  return response.data;
}

/**
 * 모니터링 일시정지
 * POST /monitor/pause
 */
export async function pauseMonitoringSession(sessionId: number): Promise<void> {
  await apiClient.post('/monitor/pause', { sessionId });
}

/**
 * 모니터링 재개
 * POST /monitor/resume
 */
export async function resumeMonitoringSession(sessionId: number): Promise<void> {
  await apiClient.post('/monitor/resume', { sessionId });
}

/**
 * 모니터링 종료
 * POST /monitor/complete
 */
export async function completeMonitoringSession(sessionId: number): Promise<void> {
  await apiClient.post('/monitor/complete', { sessionId });
}

/**
 * 이미지 프레임 전송 (필요시)
 * POST /monitor/frame
 */
export async function sendFrame(sessionId: number, image: string): Promise<void> {
  await apiClient.post('/monitor/frame', {
    sessionId,
    image,
  });
}

