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

  const poseInference = usePoseInference({
    videoRef: webcam.videoRef,
    sessionId: session.sessionId || 0,
    debugLogRaw: true,
    onResult: (result) => {
      console.log('[AI RESULT]', result);
      // TODO: 나중에 여기서 session 쪽 상태 업데이트 (예: session.updateFromAi(result))
    },
  });

  const FRAME_INTERVAL_MS = 1000;

  const isFirstFrameRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  const currentSessionIdRef = useRef<number | null>(null);
  const prevStatusRef = useRef<SessionStatus>('IDLE');

  useEffect(() => {
    if (session.status === 'RUNNING' && session.sessionId !== null) {
      const isNewSession = currentSessionIdRef.current !== session.sessionId;
      const isResume = prevStatusRef.current === 'PAUSED' && session.status === 'RUNNING';

      if (isNewSession || isResume) {
        isFirstFrameRef.current = true;
        currentSessionIdRef.current = session.sessionId;
      }
    } else {
      if (session.status === 'ENDED' || session.status === 'IDLE') {
        isFirstFrameRef.current = false;
        currentSessionIdRef.current = null;
      }
    }

    prevStatusRef.current = session.status;
  }, [session.status, session.sessionId]);

  useEffect(() => {
    if (session.status !== 'RUNNING' || session.sessionId === null) {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    if (!webcam.videoRef.current || webcam.videoRef.current.readyState < 2) {
      return;
    }

    const abortControllerRef = { current: new AbortController() };
    const abortSignal = abortControllerRef.current.signal;

    let lastFrameTime = 0;
    let isRunning = true;
    let inFlight = false;

    const sendFrameLoop = async () => {
      if (!isRunning || abortSignal.aborted || session.status !== 'RUNNING') {
        return;
      }

      const currentSessionId = session.sessionId;
      if (currentSessionId === null || currentSessionId === 0) {
        console.warn('⚠️ [Frame Send] sessionId 없음, 대기 중... | current:', currentSessionId);
        if (isRunning && !abortSignal.aborted && session.status === 'RUNNING') {
          animationFrameRef.current = requestAnimationFrame(sendFrameLoop);
        }
        return;
      }

      const now = Date.now();

      if (inFlight) {
        if (isRunning && !abortSignal.aborted && session.status === 'RUNNING') {
          animationFrameRef.current = requestAnimationFrame(sendFrameLoop);
        }
        return;
      }

      if (now - lastFrameTime >= FRAME_INTERVAL_MS) {
        lastFrameTime = now;

        const reset = isFirstFrameRef.current;
        if (reset) {
          isFirstFrameRef.current = false;
          console.log('📸 [Frame Send] 첫 프레임 전송 | sessionId:', currentSessionId, '| reset:', reset);
        } else {
          const logInterval = 5000;
          if (now % logInterval < 100) {
            console.log('📷 [Frame Send] 프레임 전송 | sessionId:', currentSessionId, '| reset:', reset);
          }
        }

        inFlight = true;

        try {
          await poseInference.sendFrame(reset, undefined);
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            return;
          }
          console.error('프레임 전송 실패:', error);
        } finally {
          inFlight = false;
        }
      }

      if (isRunning && !abortSignal.aborted && session.status === 'RUNNING') {
        animationFrameRef.current = requestAnimationFrame(sendFrameLoop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(sendFrameLoop);

    return () => {
      isRunning = false;

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [session.status, session.sessionId, webcam.videoRef, poseInference]);

  const handleStart = async () => {
    try {
      await webcam.start();
      await session.handleStart();
    } catch (err) {
      console.error('웹캠 시작 실패:', err);
    }
  };

  const handleEnd = () => {
    session.handleEnd();
    webcam.stop();
  };

  const canStart = !webcam.error;

  useEffect(() => {
    if (session.status === 'RUNNING' && webcam.isActive) {
      webcam.unfreeze();
    }

    if (session.status === 'PAUSED') {
      webcam.freeze();
    }
  }, [session.status, webcam.isActive, webcam]);

  const problemStats = session.accumulatedIssues
    .filter((issue) => issue.count > 0)
    .map((issue) => ({
      problem: issue.label,
      count: issue.count,
    }));

  // =========================================================
  // [FIX] 피드백 type 보정: "정상자세만 초록", 감지된 자세(팔지지 포함)는 빨강
  // - 현재는 session.feedbackList의 type을 그대로 쓰고 있어 팔지지가 초록으로 뜰 수 있음
  // - title/message에 키워드가 있으면 강제로 warning/error 계열로 변경
  // =========================================================
  const normalizeFeedbackType = (type: any, title?: string, message?: string) => {
    const t = String(type ?? '').toLowerCase();
    const combined = `${title ?? ''} ${message ?? ''}`.trim();

    // 팔지지 자세는 반드시 "문제"로 처리
    const isArmSupport = /팔\s*지지|팔지지/i.test(combined);

    // 정상(좋음)으로 보일 수 있는 키워드(필요하면 너희 문구에 맞춰 추가)
    const isExplicitNormal = /정상\s*자세|좋은\s*자세|바른\s*자세/i.test(combined);

    // type이 success/good로 와도, 팔지지면 강제 down-grade
    if (isArmSupport) {
      // 프로젝트에서 쓰는 타입이 success/warning 또는 good/bad일 수 있으니 둘 다 커버
      if (t === 'success' || t === 'good') return 'warning';
      return 'warning';
    }

    // 정상 키워드는 초록 유지
    if (isExplicitNormal) {
      if (t === 'warning' || t === 'error' || t === 'bad') return 'success';
      return type ?? 'success';
    }

    // 정상 키워드가 없고, 감지 자세라면 빨강 계열로 보내는 게 안전
    // (이미 warning/error면 유지)
    if (t === 'warning' || t === 'error' || t === 'bad') return type;
    // success/good로 온 “비정상” 케이스를 빨강으로 보정
    if (t === 'success' || t === 'good') return 'warning';

    return type;
  };

  const feedbackList = session.feedbackList.map((feedback) => ({
    // [FIX] type 보정 적용
    type: normalizeFeedbackType(feedback.type, feedback.title, feedback.message),
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
          <aside className="sidebar left-sidebar">
            <nav className="sidebar-nav">
              <Link to="/monitor" className={`nav-item ${location.pathname === '/monitor' ? 'active' : ''}`}>
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
      </div>
    </div>
  );
}

export default RealtimePosturePage;
