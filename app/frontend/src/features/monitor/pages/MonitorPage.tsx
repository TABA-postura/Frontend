import { useEffect, useRef } from 'react';
import '../../../assets/styles/Home.css';
import { useWebcam } from '../hooks/useWebcam';
import { usePoseInference } from '../../ai/hooks/usePoseInference';
import usePostureSession from '../hooks/usePostureSession';
import WebcamPanel from '../components/WebcamPanel';
import MonitoringControls from '../components/MonitoringControls';
import LiveStatsCard from '../components/LiveStatsCard';
import AccumulatedPostureCard from '../components/AccumulatedPostureCard';
import TopBar from '../../../components/TopBar';
import type { SessionStatus } from '../types';
import './MonitorPage.css';

function MonitorPage() {
  const webcam = useWebcam();
  const session = usePostureSession();

  // AI 추론 훅: sendFrame 함수를 받아옴
  // sessionId는 프레임 전송 시점에 동적으로 전달되므로, 초기화 시점의 값은 중요하지 않음
  // 하지만 usePoseInference는 sessionId를 의존성으로 사용하므로, 최신 값을 전달
  const poseInference = usePoseInference({
    videoRef: webcam.videoRef,
    sessionId: session.sessionId || 0, // 초기화 시점에는 0일 수 있음 (RUNNING 상태가 되면 업데이트됨)
    debugLogRaw: true,
    onResult: (result) => {
      console.log("[AI RESULT]", result);
      // TODO: 나중에 여기서 session 쪽 상태 업데이트 (예: session.updateFromAi(result))
    },
  });

  // 프레임 전송 간격 (ms) - 1초마다 전송
  const FRAME_INTERVAL_MS = 1000;
  
  // reset 플래그 관리: 세션당 한 번만 reset=true 전송
  // useRef를 사용하여 렌더링 사이에 상태 유지 (effect 재실행 시에도 유지)
  const resetSentRef = useRef<boolean>(false);
  
  // animationFrame ID 관리: 중복 루프 방지
  const animationFrameRef = useRef<number | null>(null);
  
  // 진행 중인 요청 취소를 위한 AbortController
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // 현재 세션 ID 추적: 세션이 변경되면 reset 플래그 초기화
  const currentSessionIdRef = useRef<number | null>(null);

  // 이전 상태 추적 (resume 감지용)
  const prevStatusRef = useRef<SessionStatus>('IDLE');

  // 세션 시작 및 재개 시 reset 플래그 초기화
  useEffect(() => {
    // 새 세션이 시작되거나 재개되면 reset 플래그를 false로 초기화
    if (session.status === 'RUNNING' && session.sessionId !== null) {
      // 세션 ID가 변경되었거나 (새 세션 시작)
      // PAUSED에서 RUNNING으로 변경된 경우 (resume) reset 플래그 초기화
      const isNewSession = currentSessionIdRef.current !== session.sessionId;
      const isResume = prevStatusRef.current === 'PAUSED' && session.status === 'RUNNING';
      
      if (isNewSession || isResume) {
        resetSentRef.current = false;
        currentSessionIdRef.current = session.sessionId;
      }
    } else {
      // 세션이 종료되면 reset 플래그 초기화
      if (session.status === 'ENDED' || session.status === 'IDLE') {
        resetSentRef.current = false;
        currentSessionIdRef.current = null;
      }
    }
    
    // 이전 상태 업데이트
    prevStatusRef.current = session.status;
  }, [session.status, session.sessionId]);

  // 프레임 전송 루프 관리
  useEffect(() => {
    // RUNNING 상태이고 sessionId가 있을 때만 프레임 전송 시작
    if (session.status !== 'RUNNING' || session.sessionId === null) {
      // 정리: 기존 루프와 요청 모두 취소
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      return;
    }

    // 웹캠이 준비되지 않았으면 대기
    if (!webcam.videoRef.current || webcam.videoRef.current.readyState < 2) {
      return;
    }

    // 기존 루프가 있으면 먼저 정리 (중복 방지)
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // 기존 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 새로운 AbortController 생성
    abortControllerRef.current = new AbortController();
    const abortSignal = abortControllerRef.current.signal;

    // requestAnimationFrame 기반으로 프레임 전송
    let lastFrameTime = 0;
    let isRunning = true; // 루프 실행 플래그

    const sendFrameLoop = async () => {
      // 세션이 종료되었거나 취소되었으면 중단
      if (!isRunning || abortSignal.aborted || session.status !== 'RUNNING') {
        return;
      }

      // ✅ 조건 1: sessionId가 확보된 후에만 전송
      // sessionId가 없거나 유효하지 않으면 전송하지 않음
      const currentSessionId = session.sessionId;
      if (currentSessionId === null || currentSessionId === 0) {
        // sessionId가 아직 없으면 다음 프레임에서 재시도
        console.warn('⚠️ [Frame Send] sessionId 없음, 대기 중... | current:', currentSessionId);
        if (isRunning && !abortSignal.aborted && session.status === 'RUNNING') {
          animationFrameRef.current = requestAnimationFrame(sendFrameLoop);
        }
        return;
      }

      const now = Date.now();
      
      // FRAME_INTERVAL_MS 간격으로 전송
      if (now - lastFrameTime >= FRAME_INTERVAL_MS) {
        lastFrameTime = now;
        
        // ✅ 조건 2: 첫 프레임은 무조건 reset=true
        // reset 플래그 결정: 아직 reset을 보내지 않았으면 true, 이후는 false
        const shouldReset = !resetSentRef.current;
        if (shouldReset) {
          resetSentRef.current = true; // 한 번만 reset=true 전송
          console.log('📸 [Frame Send] 첫 프레임 전송 | sessionId:', currentSessionId, '| reset:', shouldReset);
        } else {
          // 첫 프레임이 아닌 경우 간헐적으로만 로그 (너무 많은 로그 방지)
          const logInterval = 5000; // 5초마다
          if (now % logInterval < 100) {
            console.log('📷 [Frame Send] 프레임 전송 | sessionId:', currentSessionId, '| reset:', shouldReset);
          }
        }

        try {
          // AbortController를 통해 요청 취소 가능하도록 전달
          // sendFrame 호출 시점에 sessionId가 유효함을 보장 (위에서 체크)
          await poseInference.sendFrame(shouldReset, abortSignal);
        } catch (error) {
          // AbortError는 정상적인 취소이므로 무시
          if (error instanceof Error && error.name === 'AbortError') {
            return;
          }
          console.error('프레임 전송 실패:', error);
        }
      }

      // 다음 프레임 요청 (세션 상태 재확인)
      if (isRunning && !abortSignal.aborted && session.status === 'RUNNING') {
        animationFrameRef.current = requestAnimationFrame(sendFrameLoop);
      }
    };

    // 루프 시작
    animationFrameRef.current = requestAnimationFrame(sendFrameLoop);

    // cleanup 함수: 세션이 종료되거나 effect가 재실행될 때 호출
    return () => {
      isRunning = false; // 루프 중단 플래그 설정
      
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [
    session.status,
    session.sessionId, // sessionId 변경 시 effect 재실행하여 최신 sessionId 사용
    webcam.videoRef,
    poseInference, // poseInference의 sendFrame이 sessionId 변경 시 재생성되므로 의존성에 포함
  ]);

  // 세션 시작 시 웹캠 시작
  const handleStart = async () => {
    try {
      await webcam.start();
      await session.handleStart();
    } catch (err) {
      // 에러는 useWebcam에서 처리됨
      console.error('웹캠 시작 실패:', err);
    }
  };

  // 세션 종료 시 웹캠 중지
  const handleEnd = () => {
    session.handleEnd();
    webcam.stop();
  };

  // 웹캠 에러가 있으면 시작 불가
  const canStart = !webcam.error;

  // 세션 상태에 따라 웹캠 freeze/unfreeze 처리
  useEffect(() => {
    // RUNNING → 웹캠 활성 + 재생
    if (session.status === 'RUNNING' && webcam.isActive) {
      webcam.unfreeze();
    }

    // PAUSED → 웹캠 freeze()
    if (session.status === 'PAUSED') {
      webcam.freeze();
    }

    // ENDED → 웹캠 완전 종료 (handleEnd에서 이미 처리됨)
    // 여기서는 추가 처리 불필요
  }, [session.status, webcam.isActive, webcam]);

  return (
    <div 
      className="monitor-container"
      style={{ 
        minHeight: '100vh',
        height: '100vh', /* 화면 높이에 맞춤 */
        position: 'relative',
        overflow: 'hidden', /* 스크롤 방지 */
      }}
    >
      {/* 배경 이미지 - 상단 바 제외한 영역에 맞춤 */}
      <div
        style={{
          position: 'absolute',
          top: '150px', /* TopBar 높이 */
          left: 0,
          right: 0,
          height: 'calc(100vh - 150px)', /* 화면 높이에서 TopBar 높이 제외 */
          backgroundImage: 'url(/images/sincerely-media-gddRiwCKJbA-unsplash.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <TopBar />
      
        <div className="dashboard-content">
          {/* 메인 콘텐츠 */}
          <main className="main-content monitor-main">
            <div className="monitor-page">
              <div className="monitor-page__content">
                {/* 좌측: 모니터링 설정 및 실시간 통계 */}
                <section className="monitor-page__left">
                  <MonitoringControls
                    status={session.status}
                    times={session.times}
                    onStart={handleStart}
                    onPause={session.handlePause}
                    onResume={session.handleResume}
                    onEnd={handleEnd}
                    canStart={canStart}
                  />
                  <LiveStatsCard liveStats={session.liveStats} />
                </section>

                {/* 중앙: 웹캠 패널 */}
                <section className="monitor-page__center">
                  <WebcamPanel
                    isActive={webcam.isActive}
                    isLoading={webcam.isLoading}
                    error={webcam.error}
                    videoRef={webcam.videoRef}
                    status={session.status}
                    feedback={session.latestFeedback}
                  />
                </section>

                {/* 우측: 누적 자세 데이터 */}
                <section className="monitor-page__right">
                  <AccumulatedPostureCard issues={session.accumulatedIssues} />
                </section>
              </div>
            </div>
          </main>
        </div>

        {/* 도움말 버튼 */}
        <button className="help-button">?</button>
      </div>
    </div>
  );
}

export default MonitorPage;
