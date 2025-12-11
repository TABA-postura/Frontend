export type MonitoringStatus = 'IDLE' | 'STARTED' | 'PAUSED' | 'RESUMED' | 'COMPLETED';

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

export interface MonitoringSession {
  sessionId: number | null;
  status: MonitoringStatus;
  startTime: string | null;
  feedback: RealtimeFeedbackResponse | null;
}
