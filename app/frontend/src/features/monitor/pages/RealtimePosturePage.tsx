import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../../assets/styles/Home.css';
import { useWebcam } from '../hooks/useWebcam';
import { usePoseInference } from '../../ai/hooks/usePoseInference';
import usePostureSession from '../hooks/usePostureSession';
import WebcamPanel from '../components/WebcamPanel';
import MonitoringControls from '../components/MonitoringControls';
import LiveStatsCard from '../components/LiveStatsCard';
import CumulativePostureDataCard from '../components/CumulativePostureDataCard';
import RealtimeFeedbackCard from '../components/RealtimeFeedbackCard';
import TopBar from '../../../components/TopBar';
import type { SessionStatus } from '../types';
import './RealtimePosturePage.css';

function RealtimePosturePage() {
  const location = useLocation();
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
  
  // 첫 프레임 여부 추적 (baseline 리셋용)
  const isFirstFrameRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  const currentSessionIdRef = useRef<number | null>(null);
  const prevStatusRef = useRef<SessionStatus>('IDLE');

  // 세션 시작 및 재개 시 reset 플래그 초기화
  useEffect(() => {
    if (session.status === 'RUNNING' && session.sessionId !== null) {
      // 새 세션이 시작되거나 (세션 ID 변경)
      // PAUSED에서 RUNNING으로 변경된 경우 (resume) reset 플래그 초기화
      const isNewSession = currentSessionIdRef.current !== session.sessionId;
      const isResume = prevStatusRef.current === 'PAUSED' && session.status === 'RUNNING';
      
      if (isNewSession || isResume) {
        isFirstFrameRef.current = true;
        currentSessionIdRef.current = session.sessionId;
      }
    } else {
      // 세션이 종료되면 reset 플래그 초기화
      if (session.status === 'ENDED' || session.status === 'IDLE') {
        isFirstFrameRef.current = false;
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
      // 정리
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    // 웹캠이 준비되지 않았으면 대기
    if (!webcam.videoRef.current || webcam.videoRef.current.readyState < 2) {
      return;
    }

    // AbortController는 cleanup에서만 사용 (세션 종료 시에만 취소)
    const abortControllerRef = { current: new AbortController() };
    const abortSignal = abortControllerRef.current.signal;

    // requestAnimationFrame 기반으로 프레임 전송
    let lastFrameTime = 0;
    let isRunning = true; // 루프 실행 플래그
    let inFlight = false; // 요청 진행 중 플래그 (겹쳐 보내기 방지)

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
      
      // ✅ inFlight 가드: 이전 요청이 완료될 때까지 대기
      if (inFlight) {
        // 요청이 진행 중이면 다음 프레임에서 재시도
        if (isRunning && !abortSignal.aborted && session.status === 'RUNNING') {
          animationFrameRef.current = requestAnimationFrame(sendFrameLoop);
        }
        return;
      }
      
      // FRAME_INTERVAL_MS 간격으로 전송
      if (now - lastFrameTime >= FRAME_INTERVAL_MS) {
        lastFrameTime = now;
        
        // ✅ 조건 2: 첫 프레임은 무조건 reset=true
        const reset = isFirstFrameRef.current;
        if (reset) {
          isFirstFrameRef.current = false; // 한 번만 reset=true 전송
          console.log('📸 [Frame Send] 첫 프레임 전송 | sessionId:', currentSessionId, '| reset:', reset);
        } else {
          // 첫 프레임이 아닌 경우 간헐적으로만 로그 (너무 많은 로그 방지)
          const logInterval = 5000; // 5초마다
          if (now % logInterval < 100) {
            console.log('📷 [Frame Send] 프레임 전송 | sessionId:', currentSessionId, '| reset:', reset);
          }
        }

        // inFlight 플래그 설정
        inFlight = true;
        
        try {
          // AbortSignal은 세션 종료 시에만 사용 (요청 취소용)
          // 일반적인 요청에는 전달하지 않음 (요청이 완료될 때까지 기다림)
          await poseInference.sendFrame(reset, undefined);
        } catch (error) {
          // AbortError는 정상적인 취소이므로 무시
          if (error instanceof Error && error.name === 'AbortError') {
            return;
          }
          console.error('프레임 전송 실패:', error);
        } finally {
          // 요청 완료 후 inFlight 플래그 해제
          inFlight = false;
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

  // Transform accumulatedIssues to problemStats format
  const problemStats = session.accumulatedIssues
    .filter((issue) => issue.count > 0)
    .map((issue) => ({
      problem: issue.label,
      count: issue.count,
    }));

  // Use feedbackList directly from session hook
  const feedbackList = session.feedbackList.map((feedback) => ({
    type: feedback.type,
    title: feedback.title,
    message: feedback.message,
  }));

  return (
    <div 
      className="monitor-container"
      style={{ 
        minHeight: '100vh',
        backgroundImage: 'url(/images/posetura_line.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        position: 'relative',
      }}
    >
      {/* 배경 오버레이 - 소라색 반투명 (파란색 톤) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(110, 175, 215, 0.3)',
          zIndex: 0,
        }}
      />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <TopBar />
        <div className="dashboard-content">
          {/* 왼쪽 사이드바 */}
          <aside className="sidebar left-sidebar">
            <nav className="sidebar-nav">
              <Link
                to="/monitor"
                className={`nav-item ${location.pathname === '/monitor' ? 'active' : ''}`}
              >
                <div className="nav-icon blue">📊</div>
                <div className="nav-text">
                  <span className="nav-title">실시간 자세 분석</span>
                </div>
              </Link>
              <Link to="/information" className="nav-item">
                <div className="nav-icon blue">📚</div>
                <div className="nav-text">
                  <span className="nav-title">정보 제공</span>
                </div>
              </Link>
              <Link to="/self-management" className="nav-item">
                <div className="nav-icon">👤</div>
                <div className="nav-text">
                  <span className="nav-title">자기 관리</span>
                </div>
              </Link>
            </nav>
            <div className="cookie-link">쿠키 관리 또는 옵트 아웃</div>
          </aside>

          {/* 메인 콘텐츠 */}
          <main className="main-content monitor-main">
            <div className="realtime-page">
              <section className="top-section">
                <div className="left-col">
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
                </div>

                <div className="right-col">
                  <WebcamPanel
                    isActive={webcam.isActive}
                    isLoading={webcam.isLoading}
                    error={webcam.error}
                    videoRef={webcam.videoRef}
                    status={session.status}
                    feedback={session.latestFeedback}
                  />
                </div>
              </section>

              <section className="bottom-section">
                <CumulativePostureDataCard problemStats={problemStats} />
                <RealtimeFeedbackCard feedbackList={feedbackList} />
              </section>
            </div>
          </main>
        </div>

        {/* 도움말 버튼 */}
        <button className="help-button">?</button>
      </div>
    </div>
  );
}

export default RealtimePosturePage;

