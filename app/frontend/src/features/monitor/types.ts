// Monitor feature 공용 타입 정의

export type SessionStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'ENDED';

export interface LiveStats {
  elapsedSeconds: number;     // 분석 시간(초)
  goodPostureSeconds: number; // 바른 자세 유지 시간(초)
  warningCount: number;       // 경고 횟수
  goodPostureRate: number;    // 0~100, goodPostureSeconds / elapsedSeconds * 100
}

export type PostureIssueType = 
  | 'FORWARD_HEAD' 
  | 'BENT_BACK' 
  | 'SHOULDER_ASYMMETRY'
  | 'SHOULDER_TILT'
  | 'UPPER_BODY_TILT'
  | 'TOO_CLOSE_TO_SCREEN'
  | 'ARM_SUPPORT_CHIN_REST'
  | 'LEFT_RIGHT_ASYMMETRY'
  | 'HEAD_TILT';

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

