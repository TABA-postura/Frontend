import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  SessionStatus,
  LiveStats,
  PostureIssueStat,
  PostureSessionTimes,
  FeedbackItem,
} from '../types';

export interface UsePostureSessionResult {
  status: SessionStatus;
  sessionId: number | null; // 세션 ID (시작 시 생성)
  times: PostureSessionTimes;
  liveStats: LiveStats;
  accumulatedIssues: PostureIssueStat[];
  latestFeedback: string | null;
  feedbackList: FeedbackItem[];
  handleStart: () => void;
  handlePause: () => void;
  handleResume: () => void;
  handleEnd: () => void;
  reset: () => void;
  // TODO: 추후 AI/백엔드 호출 실패 시 사용할 에러 처리 함수
  // setError: (message: string) => void;
}

const INITIAL_ISSUES: PostureIssueStat[] = [
  { type: 'FORWARD_HEAD', label: '거북목', count: 0 },
  { type: 'BENT_BACK', label: '허리 굽힘', count: 0 },
  { type: 'SHOULDER_ASYMMETRY', label: '어깨 비대칭', count: 0 },
];

const FEEDBACK_MESSAGES = {
  FORWARD_HEAD: {
    title: '거북목 주의',
    message: '거북목이 감지되었습니다. 모니터를 눈높이에 맞추고 턱을 살짝 당겨주세요.',
  },
  BENT_BACK: {
    title: '허리 굽힘 주의',
    message: '허리가 앞으로 굽어 있습니다. 허리를 펴고 의자 깊숙이 앉아주세요.',
  },
  SHOULDER_ASYMMETRY: {
    title: '어깨 높이 불균형',
    message: '어깨 높이가 비대칭입니다. 양 어깨를 천천히 올렸다 내리며 정렬해보세요.',
  },
};

const MAX_FEEDBACK_LIST_SIZE = 10; // 최대 피드백 개수

function usePostureSession(): UsePostureSessionResult {
  const [status, setStatus] = useState<SessionStatus>('IDLE');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [times, setTimes] = useState<PostureSessionTimes>({
    startTime: null,
    lastPauseTime: null,
    endTime: null,
  });
  const [liveStats, setLiveStats] = useState<LiveStats>({
    elapsedSeconds: 0,
    goodPostureSeconds: 0,
    warningCount: 0,
    goodPostureRate: 0,
  });
  const [accumulatedIssues, setAccumulatedIssues] = useState<PostureIssueStat[]>(INITIAL_ISSUES);
  const [latestFeedback, setLatestFeedback] = useState<string | null>(null);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);

  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastWarningTimeRef = useRef<number>(0);
  const lastFeedbackTimeRef = useRef<number>(0);
  const statusRef = useRef<SessionStatus>(status);

  // statusRef 업데이트
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // 타이머 정리 함수
  const clearTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // 통계 업데이트 로직 (임시 mock)
  const updateStats = useCallback(() => {
    // RUNNING 상태일 때만 업데이트
    if (statusRef.current !== 'RUNNING') {
      return;
    }

    setLiveStats((prev) => {
      const newElapsed = prev.elapsedSeconds + 1;
      const now = Date.now();

      // 10초마다 10~20% 확률로 경고 발생
      const shouldWarn = newElapsed % 10 === 0 && Math.random() < 0.15;
      let newWarningCount = prev.warningCount;
      let newGoodPostureSeconds = prev.goodPostureSeconds;

      if (shouldWarn && now - lastWarningTimeRef.current > 10000) {
        // 경고 발생
        newWarningCount = prev.warningCount + 1;
        lastWarningTimeRef.current = now;

        // 랜덤하게 이슈 타입 선택
        const issueTypes: Array<'FORWARD_HEAD' | 'BENT_BACK' | 'SHOULDER_ASYMMETRY'> = [
          'FORWARD_HEAD',
          'BENT_BACK',
          'SHOULDER_ASYMMETRY',
        ];
        const randomType = issueTypes[Math.floor(Math.random() * issueTypes.length)];

        // 누적 이슈 업데이트
        setAccumulatedIssues((issues) =>
          issues.map((issue) =>
            issue.type === randomType ? { ...issue, count: issue.count + 1 } : issue
          )
        );

        // 피드백 메시지 설정
        const feedbackData = FEEDBACK_MESSAGES[randomType];
        setLatestFeedback(feedbackData.message);

        // 피드백 리스트에 추가 (최대 개수 제한)
        setFeedbackList((prev) => {
          const newFeedback: FeedbackItem = {
            type: 'WARN',
            title: feedbackData.title,
            message: feedbackData.message,
            timestamp: now,
          };
          const updated = [newFeedback, ...prev].slice(0, MAX_FEEDBACK_LIST_SIZE);
          return updated;
        });

        lastFeedbackTimeRef.current = now;
      } else {
        // 경고가 없으면 바른 자세로 간주
        newGoodPostureSeconds = prev.goodPostureSeconds + 1;

        // 최근 1~2분(60~120초) 내 피드백이 없으면 기본 메시지
        if (now - lastFeedbackTimeRef.current > 60000 && newElapsed > 5) {
          setLatestFeedback('현재 자세는 양호합니다.');

          // INFO 타입 피드백 추가 (양호한 자세)
          setFeedbackList((prev) => {
            const newFeedback: FeedbackItem = {
              type: 'INFO',
              title: '자세 양호',
              message: '현재 자세는 양호합니다.',
              timestamp: now,
            };
            // 최근 피드백이 WARN이 아니면 추가
            if (prev.length === 0 || prev[0].type !== 'INFO') {
              return [newFeedback, ...prev].slice(0, MAX_FEEDBACK_LIST_SIZE);
            }
            return prev;
          });
        }
      }

      const newGoodPostureRate =
        newElapsed === 0 ? 0 : Math.round((newGoodPostureSeconds / newElapsed) * 100);

      return {
        elapsedSeconds: newElapsed,
        goodPostureSeconds: newGoodPostureSeconds,
        warningCount: newWarningCount,
        goodPostureRate: newGoodPostureRate,
      };
    });
  }, []);

  // 타이머 시작
  const startTimer = useCallback(() => {
    clearTimer();
    timerIntervalRef.current = setInterval(() => {
      if (statusRef.current === 'RUNNING') {
        updateStats();
      }
    }, 1000);
  }, [clearTimer, updateStats]);

  const handleStart = useCallback(() => {
    if (status !== 'IDLE' && status !== 'ENDED') {
      return;
    }

    // 새 세션 ID 생성 (실제로는 백엔드 API에서 받아와야 함)
    const newSessionId = Date.now();
    setSessionId(newSessionId);
    setStatus('RUNNING');
    setTimes({
      startTime: new Date(),
      lastPauseTime: null,
      endTime: null,
    });
    setLiveStats({
      elapsedSeconds: 0,
      goodPostureSeconds: 0,
      warningCount: 0,
      goodPostureRate: 0,
    });
    setAccumulatedIssues(INITIAL_ISSUES);
    setLatestFeedback(null);
    setFeedbackList([]);
    lastWarningTimeRef.current = 0;
    lastFeedbackTimeRef.current = 0;
  }, [status]);

  const handlePause = useCallback(() => {
    if (status !== 'RUNNING') {
      return;
    }

    setStatus('PAUSED');
    setTimes((prev) => ({
      ...prev,
      lastPauseTime: new Date(),
    }));
    clearTimer();
  }, [status, clearTimer]);

  const handleResume = useCallback(() => {
    if (status !== 'PAUSED') {
      return;
    }

    setStatus('RUNNING');
    setTimes((prev) => ({
      ...prev,
      lastPauseTime: null,
    }));
  }, [status]);

  const handleEnd = useCallback(() => {
    // 세션 종료 처리: 상태를 ENDED로 변경하고 종료 시간을 반드시 기록
    setStatus('ENDED');
    setTimes((prev) => ({
      ...prev,
      endTime: new Date(), // 종료 시각을 항상 설정
    }));
    clearTimer();
  }, [clearTimer]);

  const reset = useCallback(() => {
    setStatus('IDLE');
    setSessionId(null);
    setTimes({
      startTime: null,
      lastPauseTime: null,
      endTime: null,
    });
    setLiveStats({
      elapsedSeconds: 0,
      goodPostureSeconds: 0,
      warningCount: 0,
      goodPostureRate: 0,
    });
    setAccumulatedIssues(INITIAL_ISSUES);
    setLatestFeedback(null);
    setFeedbackList([]);
    clearTimer();
    lastWarningTimeRef.current = 0;
    lastFeedbackTimeRef.current = 0;
  }, [clearTimer]);

  // 상태가 RUNNING일 때 타이머 시작
  useEffect(() => {
    if (status === 'RUNNING') {
      startTimer();
    } else {
      clearTimer();
    }

    return () => {
      clearTimer();
    };
  }, [status, startTimer, clearTimer]);

  return {
    status,
    sessionId,
    times,
    liveStats,
    accumulatedIssues,
    latestFeedback,
    feedbackList,
    handleStart,
    handlePause,
    handleResume,
    handleEnd,
    reset,
  };
}

export default usePostureSession;

