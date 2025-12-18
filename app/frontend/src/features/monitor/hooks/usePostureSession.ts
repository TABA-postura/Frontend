/**
 * 모니터링 세션 관리 훅
 * 백엔드 API를 사용하여 모니터링 세션의 시작, 일시정지, 재개, 종료를 관리하고
 * 실시간 피드백을 폴링하여 최신 상태를 유지합니다.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  startMonitoringSession,
  getRealtimeFeedback,
  pauseMonitoringSession,
  resumeMonitoringSession,
  completeMonitoringSession,
} from '../../../api/monitor';
import type { RealtimeFeedbackResponse } from '../../../api/monitor';
import type {
  SessionStatus,
  LiveStats,
  PostureIssueStat,
  PostureSessionTimes,
  FeedbackItem,
} from '../types';

/**
 * usePostureSession 훅의 반환 타입
 */
export interface UsePostureSessionResult {
  /** 세션 상태 */
  status: SessionStatus;
  /** 현재 세션 ID (시작 시 생성, 종료 시 null) */
  sessionId: number | null;
  /** 세션 시간 정보 */
  times: PostureSessionTimes;
  /** 실시간 통계 */
  liveStats: LiveStats;
  /** 누적된 자세 문제 */
  accumulatedIssues: PostureIssueStat[];
  /** 최신 피드백 메시지 */
  latestFeedback: string | null;
  /** 피드백 리스트 */
  feedbackList: FeedbackItem[];
  /** 세션 시작 함수 */
  handleStart: () => Promise<void>;
  /** 세션 일시정지 함수 */
  handlePause: () => Promise<void>;
  /** 세션 재개 함수 */
  handleResume: () => Promise<void>;
  /** 세션 종료 함수 */
  handleEnd: () => void;
  /** 상태 리셋 함수 */
  reset: () => void;
}

/**
 * 모니터링 세션을 관리하는 커스텀 훅
 * 
 * @returns UsePostureSessionResult - 세션 상태 및 제어 함수들
 * 
 * @example
 * ```tsx
 * const { sessionId, isRunning, startSession, pauseSession, resumeSession, completeSession } = usePostureSession();
 * 
 * // 세션 시작
 * await startSession();
 * 
 * // 일시정지
 * await pauseSession();
 * 
 * // 재개
 * await resumeSession();
 * 
 * // 종료
 * await completeSession();
 * ```
 */
const INITIAL_ISSUES: PostureIssueStat[] = [
  { type: 'FORWARD_HEAD', label: '거북목', count: 0 },
  { type: 'SHOULDER_ASYMMETRY', label: '한쪽 어깨 기울임', count: 0 },
  { type: 'UPPER_BODY_TILT', label: '상체 기울임', count: 0 },
  { type: 'TOO_CLOSE_TO_SCREEN', label: '화면 과도하게 가까움', count: 0 },
  { type: 'ARM_SUPPORT_CHIN_REST', label: '팔 지지 / 턱 괴기', count: 0 },
  { type: 'LEFT_RIGHT_ASYMMETRY', label: '좌우 비대칭 자세', count: 0 },
  { type: 'HEAD_TILT', label: '머리 기울임', count: 0 },
];

const MAX_FEEDBACK_LIST_SIZE = 10;

export function usePostureSession(): UsePostureSessionResult {
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

  // 폴링 관련 refs
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // sessionId를 useRef로도 관리하여 리렌더링 시 유실 방지
  const sessionIdRef = useRef<number | null>(null);
  
  // startTime을 ref로도 관리하여 폴링에서 최신 값 사용
  const startTimeRef = useRef<Date | null>(null);

  // 상태를 ref로도 관리하여 폴링 내부에서 최신 상태 확인
  const statusRef = useRef<SessionStatus>('IDLE');

  // 중복 호출 방지 refs
  const isStartingRef = useRef<boolean>(false);
  const isPausingRef = useRef<boolean>(false);
  const isResumingRef = useRef<boolean>(false);

  /* =========================
     내부 유틸
  ========================= */

  /**
   * 폴링 정리 함수
   * interval과 abort controller를 정리합니다.
   */
  const clearPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  /* =========================
     폴링 시작
  ========================= */

  /**
   * 실시간 피드백 폴링 시작
   * sessionId가 설정된 이후에만 폴링을 시작합니다.
   * 1초마다 백엔드에서 최신 피드백을 조회합니다.
   */
  const startPolling = useCallback(() => {
    // sessionId가 없으면 폴링 시작하지 않음
    if (!sessionIdRef.current) {
      console.warn('[Polling] sessionId가 없어서 폴링을 시작할 수 없습니다.');
      return;
    }

    // 중복 방지
    if (intervalRef.current) {
      console.warn('[Polling] 이미 폴링이 실행 중입니다.');
      return;
    }

    abortRef.current = new AbortController();

    intervalRef.current = setInterval(async () => {
      // sessionId가 없으면 폴링 중단
      if (!sessionIdRef.current) {
        clearPolling();
        return;
      }

      // PAUSED 상태에서는 폴링 중단 (이미 clearPolling이 호출되었지만 이중 체크)
      if (statusRef.current !== 'RUNNING') {
        clearPolling();
        return;
      }

      try {
        const feedback: RealtimeFeedbackResponse = await getRealtimeFeedback();
        
        // 백엔드 응답 핵심 값 확인 (간헐적으로만 로그)
        const logInterval = 10000; // 10초마다
        if (Date.now() % logInterval < 1000) {
          console.log('📊 [Polling] 응답 | sessionId:', sessionIdRef.current, {
            correctPostureRatio: feedback.correctPostureRatio,
            totalWarningCount: feedback.totalWarningCount,
            postureTypeCounts: feedback.postureTypeCounts,
            feedbackMessagesCount: feedback.feedbackMessages?.length || 0,
          });
        }
        
        // 피드백 데이터를 상태에 반영
        // 피드백 메시지가 있으면 경고, 없으면 좋은 자세
        if (feedback.feedbackMessages && feedback.feedbackMessages.length > 0) {
          // 최신 피드백 메시지들만 표시 (누적하지 않고 교체)
          // 메시지 내용에 따라 타입 결정: "훌륭합니다" 같은 긍정 메시지는 INFO, 나머지는 WARN
          const newFeedbackList: FeedbackItem[] = feedback.feedbackMessages.map((msg) => {
            const isPositiveMessage = msg.includes('훌륭합니다') || msg.includes('바른 자세') || msg.includes('좋은 자세');
            return {
              type: isPositiveMessage ? 'INFO' as const : 'WARN' as const,
              title: '자세 피드백',
              message: msg,
              timestamp: Date.now(),
            };
          });
          setFeedbackList(newFeedbackList.slice(0, MAX_FEEDBACK_LIST_SIZE));
          setLatestFeedback(feedback.feedbackMessages[feedback.feedbackMessages.length - 1]);
        } else {
          // 피드백 메시지가 없으면 GOOD 상태
          setFeedbackList([{
            type: 'INFO',
            title: '좋은 자세',
            message: '훌륭합니다! 현재 바른 자세를 유지하고 있습니다.',
            timestamp: Date.now(),
          }]);
          setLatestFeedback(null);
        }

        // 통계 업데이트
        setLiveStats((prev) => {
          const newStats: LiveStats = { ...prev };
          
          // correctPostureRatio 업데이트 (0도 유효한 값이므로 !== undefined로 체크)
          if (feedback.correctPostureRatio !== undefined && feedback.correctPostureRatio !== null) {
            newStats.goodPostureRate = Math.round(feedback.correctPostureRatio);
          }

          // totalWarningCount 업데이트 (0도 유효한 값이므로 !== undefined로 체크)
          if (feedback.totalWarningCount !== undefined && feedback.totalWarningCount !== null) {
            newStats.warningCount = feedback.totalWarningCount;
          }

          // elapsedSeconds는 현재 시간 - 시작 시간으로 계산
          // startTimeRef를 사용하여 최신 값 보장
          if (startTimeRef.current) {
            const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);
            newStats.elapsedSeconds = elapsed;
            
            // goodPostureSeconds 계산 (elapsedSeconds * goodPostureRate / 100)
            if (newStats.goodPostureRate > 0) {
              newStats.goodPostureSeconds = Math.floor(
                (elapsed * newStats.goodPostureRate) / 100
              );
            }
          }

          return newStats;
        });

        // 자세 타입별 카운트 업데이트
        if (feedback.postureTypeCounts) {
          setAccumulatedIssues((prev) =>
            prev.map((issue) => {
              // 백엔드 키를 프론트엔드 타입으로 매핑
              let backendKey: string = issue.type;
              
              // 백엔드와 프론트엔드 키 매핑
              const keyMapping: Record<string, string> = {
                'SHOULDER_ASYMMETRY': 'UNEQUAL_SHOULDERS',
                'TOO_CLOSE_TO_SCREEN': 'TOO_CLOSE', // 백엔드에서 사용하는 키
              };
              
              backendKey = keyMapping[issue.type] || issue.type;
              const count = feedback.postureTypeCounts[backendKey] || 0;
              return { ...issue, count };
            })
          );
        }
      } catch (error) {
        // 네트워크 에러나 401/403 등은 로깅만 하고 폴링 계속
        if (error instanceof Error) {
          // AbortError는 정상적인 취소이므로 무시
          if (error.name === 'AbortError') {
            return;
          }
          console.error('[Polling] feedback error:', error.message);
        } else {
          console.error('[Polling] feedback error:', error);
        }
        // 에러 발생 시에도 폴링은 계속 진행 (백엔드 복구 대기)
      }
    }, 1000);
  }, [clearPolling]);

  /* =========================
     세션 시작
  ========================= */

  /**
   * 모니터링 세션 시작
   * 백엔드에 세션 생성 요청을 보내고, 성공 시 폴링을 시작합니다.
   * 
   * ✅ 조건 1 보장: sessionId 확보 후에만 상태 업데이트
   * - await startMonitoringSession() 완료 후 sessionId 확보
   * - sessionId를 state와 ref에 저장한 후 상태를 RUNNING으로 변경
   * - 이 순서로 인해 프레임 전송 useEffect는 sessionId가 확보된 후에만 실행됨
   */
  const handleStart = useCallback(async () => {
    // 중복 호출 방지
    if (isStartingRef.current) {
      return;
    }

    // IDLE 또는 ENDED 상태에서만 시작 가능
    if (status !== 'IDLE' && status !== 'ENDED') {
      return;
    }

    try {
      isStartingRef.current = true;

      // ✅ 조건 1: sessionId 확보 (백엔드에서 생성)
      const res = await startMonitoringSession();
      
      // 서버에서 받은 시간 문자열을 UTC로 명시적으로 해석
      // ISO 8601 형식의 시간 문자열이 timezone 정보 없이 오면 UTC로 해석
      // 예: "2025-12-14T00:38:47.552762959" -> UTC로 해석
      let startTime: Date;
      if (res.startTime.includes('Z') || res.startTime.includes('+') || res.startTime.includes('-', 10)) {
        // 이미 timezone 정보가 있으면 그대로 사용
        startTime = new Date(res.startTime);
      } else {
        // timezone 정보가 없으면 UTC로 명시적으로 해석
        startTime = new Date(res.startTime + 'Z');
      }

      // ✅ 조건 3: sessionId는 Frontend 단일 소스
      // sessionId를 state와 ref 모두에 저장 (프론트엔드가 소유)
      const newSessionId = res.sessionId;
      console.log('🔵 [Session] sessionId 확보:', newSessionId, '| startTime:', startTime.toISOString());
      
      setSessionId(newSessionId);
      sessionIdRef.current = newSessionId;
      
      // 상태를 RUNNING으로 변경 (이 시점에 sessionId가 확보됨)
      setStatus('RUNNING');
      statusRef.current = 'RUNNING'; // ref에도 저장
      startTimeRef.current = startTime; // ref에도 저장
      setTimes({
        startTime,
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
      
      // sessionId 설정 후 폴링 시작
      // 약간의 지연을 두어 상태가 완전히 업데이트된 후 폴링 시작
      setTimeout(() => {
        startPolling();
      }, 100);
    } catch (error: any) {
      console.error('[usePostureSession] 세션 시작 실패:', error);
      
      // 401 에러인 경우 사용자에게 알림 (api.ts 인터셉터가 이미 리다이렉트 처리)
      if (error?.message?.includes('로그인') || error?.response?.status === 401) {
        // 로그인 페이지로 리다이렉트는 api.ts 인터셉터에서 처리됨
        // 여기서는 추가 로그만 남김
        console.warn('[usePostureSession] 인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }
      
      // 에러 발생 시 상태 롤백하지 않음 (사용자가 재시도할 수 있도록)
    } finally {
      isStartingRef.current = false;
    }
  }, [status, startPolling]);

  /* =========================
     일시정지
  ========================= */

  /**
   * 모니터링 세션 일시정지
   * 백엔드에 일시정지 요청을 보내고, 성공 시 폴링을 중단합니다.
   */
  const handlePause = useCallback(async () => {
    // 중복 호출 방지
    if (isPausingRef.current) {
      return;
    }

    // RUNNING 상태에서만 pause 가능
    if (status !== 'RUNNING' || sessionId === null) {
      return;
    }

    try {
      isPausingRef.current = true;

      await pauseMonitoringSession(sessionId);
      console.log('⏸️ [Session] 일시정지 | sessionId 유지:', sessionId);
      setStatus('PAUSED');
      statusRef.current = 'PAUSED'; // ref에도 저장
      setTimes((prev) => ({
        ...prev,
        lastPauseTime: new Date(),
      }));
      clearPolling();
    } catch (error) {
      console.error('[usePostureSession] 세션 일시정지 실패:', error);
    } finally {
      isPausingRef.current = false;
    }
  }, [status, sessionId, clearPolling]);

  /* =========================
     재개
  ========================= */

  /**
   * 모니터링 세션 재개
   * 백엔드에 재개 요청을 보내고, 성공 시 폴링을 다시 시작합니다.
   * 
   * ✅ 조건 4 보장: pause/resume 시 sessionId 유지
   * - 같은 sessionId를 사용하여 재개 (새로 생성하지 않음)
   * - 프레임 전송 useEffect가 재실행되며, 첫 프레임에 reset=true 전송
   */
  const handleResume = useCallback(async () => {
    // 중복 호출 방지
    if (isResumingRef.current) {
      return;
    }

    // PAUSED 상태에서만 resume 가능
    if (status !== 'PAUSED' || sessionId === null) {
      return;
    }

    try {
      isResumingRef.current = true;

      // ✅ 조건 4: 같은 sessionId로 재개 (새로 생성하지 않음)
      await resumeMonitoringSession(sessionId);
      
      console.log('▶️ [Session] 재개 | sessionId 유지:', sessionId, '| ref:', sessionIdRef.current);
      
      // sessionId가 유지되는지 확인 (ref 동기화)
      if (!sessionIdRef.current) {
        sessionIdRef.current = sessionId;
        console.log('🔄 [Session] ref 동기화 완료:', sessionIdRef.current);
      }
      
      // 상태를 RUNNING으로 변경 (프레임 전송 useEffect가 재실행됨)
      setStatus('RUNNING');
      statusRef.current = 'RUNNING'; // ref에도 저장
      setTimes((prev) => ({
        ...prev,
        lastPauseTime: null,
      }));
      
      // resume 시에도 폴링 재개
      setTimeout(() => {
        startPolling();
      }, 100);
    } catch (error) {
      console.error('[usePostureSession] 세션 재개 실패:', error);
    } finally {
      isResumingRef.current = false;
    }
  }, [status, sessionId, startPolling]);

  /* =========================
     종료
  ========================= */

  /**
   * 모니터링 세션 종료
   * 백엔드에 종료 요청을 보내고, 성공 시 모든 상태를 초기화합니다.
   */
  const handleEnd = useCallback(async () => {
    const currentSessionId = sessionIdRef.current || sessionId;
    if (!currentSessionId) {
      return;
    }

    try {
      // 비동기로 종료 처리
      await completeMonitoringSession(currentSessionId);
    } catch (error) {
      console.error('[usePostureSession] 세션 종료 실패:', error);
    } finally {
      clearPolling();
      console.log('⏹️ [Session] 종료 | sessionId:', currentSessionId, '| ref:', sessionIdRef.current);
      setStatus('ENDED');
      statusRef.current = 'ENDED'; // ref에도 저장
      setTimes((prev) => ({
        ...prev,
        endTime: new Date(),
      }));
      // sessionId는 ENDED 상태에서도 유지 (리포트 조회 등에 사용 가능)
      // reset() 호출 시 null로 설정됨
    }
  }, [sessionId, clearPolling]);

  /**
   * 상태 리셋
   */
  const reset = useCallback(() => {
    console.log('🔄 [Session] 리셋 | 이전 sessionId:', sessionIdRef.current);
    clearPolling();
    setStatus('IDLE');
    statusRef.current = 'IDLE'; // ref도 초기화
    setSessionId(null);
    sessionIdRef.current = null; // ref도 초기화
    startTimeRef.current = null; // startTime ref도 초기화
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
  }, [clearPolling]);

  /* =========================
     상태 동기화 및 언마운트 정리
  ========================= */

  /**
   * status 변경 시 ref 동기화
   */
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  /**
   * 컴포넌트 언마운트 시 폴링 정리
   */
  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, [clearPolling]);

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
