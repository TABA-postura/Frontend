import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../../assets/styles/Home.css';
import { useWebcam } from '../hooks/useWebcam';
import { usePoseInference } from '../../ai/hooks/usePoseInference';
import usePostureSession from '../hooks/usePostureSession';
import WebcamPanel from '../components/WebcamPanel';
import MonitoringControls from '../components/MonitoringControls';
import LiveStatsCard from '../components/LiveStatsCard';
import AccumulatedPostureCard from '../components/AccumulatedPostureCard';
import PostureFeedbackPanel from '../components/PostureFeedbackPanel';
import LogoutButton from '../../../components/LogoutButton';
import './MonitorPage.css';

function MonitorPage() {
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
  
  // reset 플래그 관리: 세션당 한 번만 reset=true 전송
  // useRef를 사용하여 렌더링 사이에 상태 유지 (effect 재실행 시에도 유지)
  const resetSentRef = useRef<boolean>(false);
  
  // animationFrame ID 관리: 중복 루프 방지
  const animationFrameRef = useRef<number | null>(null);
  
  // 진행 중인 요청 취소를 위한 AbortController
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // 현재 세션 ID 추적: 세션이 변경되면 reset 플래그 초기화
  const currentSessionIdRef = useRef<number | null>(null);

  // 세션 시작 시 reset 플래그 초기화
  useEffect(() => {
    // 새 세션이 시작되면 reset 플래그를 false로 초기화
    if (session.status === 'RUNNING' && session.sessionId !== null) {
      // 세션 ID가 변경되었을 때만 reset 플래그 초기화
      if (currentSessionIdRef.current !== session.sessionId) {
        resetSentRef.current = false;
        currentSessionIdRef.current = session.sessionId;
      }
    } else {
      // 세션이 종료되면 reset 플래그 초기화
      resetSentRef.current = false;
      currentSessionIdRef.current = null;
    }
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
      if (!isRunning || abortSignal.aborted || session.status !== 'RUNNING' || session.sessionId === null) {
        return;
      }

      const now = Date.now();
      
      // FRAME_INTERVAL_MS 간격으로 전송
      if (now - lastFrameTime >= FRAME_INTERVAL_MS) {
        lastFrameTime = now;
        
        // reset 플래그 결정: 아직 reset을 보내지 않았으면 true, 이후는 false
        const shouldReset = !resetSentRef.current;
        if (shouldReset) {
          resetSentRef.current = true; // 한 번만 reset=true 전송
        }

        try {
          // AbortController를 통해 요청 취소 가능하도록 전달
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
      if (isRunning && !abortSignal.aborted && session.status === 'RUNNING' && session.sessionId !== null) {
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

  return (
    <div className="monitor-container">
      {/* 로그아웃 버튼 - 좌측 상단 고정 */}
      <LogoutButton />
      
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
          <div className="monitor-page">
            <div className="monitor-page__header">
              <h1 className="monitor-page__title">실시간 자세 분석</h1>
              <p className="monitor-page__subtitle">웹캠을 통해 실시간으로 자세를 모니터링합니다</p>
            </div>

            <div className="monitor-page__content">
              {/* 좌측: 설정 및 통계 */}
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

                <AccumulatedPostureCard issues={session.accumulatedIssues} />
              </section>

              {/* 우측: 웹캠 패널 */}
              <section className="monitor-page__right">
                <WebcamPanel
                  isActive={webcam.isActive}
                  isLoading={webcam.isLoading}
                  error={webcam.error}
                  videoRef={webcam.videoRef}
                  status={session.status}
                />
              </section>
            </div>

            {/* 하단: 피드백 패널 */}
            <PostureFeedbackPanel feedback={session.latestFeedback} />
          </div>
        </main>
      </div>

      {/* 도움말 버튼 */}
      <button className="help-button">?</button>
    </div>
  );
}

export default MonitorPage;
