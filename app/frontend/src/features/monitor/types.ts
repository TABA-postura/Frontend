// Monitor feature 공용 타입 정의

/**
 * 모니터링 세션 상태
 * - IDLE: 초기 상태, 세션 시작 전
 * - RUNNING: 모니터링 실행 중 (START 또는 RESUME 후)
 * - PAUSED: 일시정지 상태
 * - ENDED: 종료 상태 (COMPLETE 후)
 */
export type SessionStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'ENDED';

export interface LiveStats {
  elapsedSeconds: number;     // 분석 시간(초)
  goodPostureSeconds: number; // 바른 자세 유지 시간(초)
  warningCount: number;       // 경고 횟수
  goodPostureRate: number;    // 0~100, goodPostureSeconds / elapsedSeconds * 100
}

export type PostureIssueType = 'FORWARD_HEAD' | 'BENT_BACK' | 'SHOULDER_ASYMMETRY';

export interface PostureIssueStat {
  type: PostureIssueType;
  label: string;  // 예: "거북목", "허리 굽힘"
  count: number;
}

export interface PostureSessionTimes {
  startTime: Date | null;
  lastPauseTime: Date | null;
  endTime: Date | null;
}

export type FeedbackType = 'WARN' | 'INFO';

export interface FeedbackItem {
  type: FeedbackType;
  title: string;
  message: string;
  timestamp: number; // Date.now() 값
}

