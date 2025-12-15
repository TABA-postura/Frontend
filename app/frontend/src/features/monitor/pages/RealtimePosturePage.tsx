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
import './RealtimePosturePage.css';

function RealtimePosturePage() {
  const location = useLocation();
  const webcam = useWebcam();
  const session = usePostureSession();

  // AI 추론 훅: sendFrame 함수를 받아옴
  const poseInference = usePoseInference({
    videoRef: webcam.videoRef,
    sessionId: session.sessionId || 0, // sessionId가 없으면 0 (실제로는 사용 안 됨)
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

  // 세션이 시작되면 첫 프레임 플래그 설정
  useEffect(() => {
    if (session.status === 'RUNNING' && session.sessionId !== null) {
      isFirstFrameRef.current = true;
    } else {
      isFirstFrameRef.current = false;
    }
  }, [session.status, session.sessionId]);

  // 방식 A: RealtimePosturePage에서 tick과 연동하여 프레임 전송
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

    // requestAnimationFrame 기반으로 프레임 전송 (더 부드러운 타이밍)
    let lastFrameTime = 0;

    const sendFrameLoop = async () => {
      const now = Date.now();
      
      // FRAME_INTERVAL_MS 간격으로 전송
      if (now - lastFrameTime >= FRAME_INTERVAL_MS) {
        lastFrameTime = now;
        
        const reset = isFirstFrameRef.current;
        if (reset) {
          isFirstFrameRef.current = false;
        }

        try {
          await poseInference.sendFrame(reset);
        } catch (error) {
          console.error('프레임 전송 실패:', error);
        }
      }

      // 다음 프레임 요청
      if (session.status === 'RUNNING' && session.sessionId !== null) {
        animationFrameRef.current = requestAnimationFrame(sendFrameLoop);
      }
    };

    // 첫 프레임 즉시 전송
    const sendFirstFrame = async () => {
      try {
        await poseInference.sendFrame(true);
        isFirstFrameRef.current = false;
      } catch (error) {
        console.error('첫 프레임 전송 실패:', error);
      }
    };

    sendFirstFrame();
    animationFrameRef.current = requestAnimationFrame(sendFrameLoop);

    // cleanup 함수
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [
    session.status,
    session.sessionId,
    webcam.videoRef,
    poseInference,
  ]);

  // 세션 시작 시 웹캠 시작
  const handleStart = async () => {
    try {
      await webcam.start();
      session.handleStart();
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
    <div className="monitor-container">
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
            <header className="realtime-header">
              <h1 className="realtime-header__title">실시간 자세 분석</h1>
              <p className="realtime-header__subtitle">
                웹캠을 통해 실시간으로 자세를 모니터링합니다
              </p>
            </header>

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
  );
}

export default RealtimePosturePage;

