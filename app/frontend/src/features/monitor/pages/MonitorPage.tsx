import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../../assets/styles/Home.css';
import { useWebcam } from '../hooks/useWebcam';
import usePostureSession from '../hooks/usePostureSession';
import WebcamPanel from '../components/WebcamPanel';
import MonitoringControls from '../components/MonitoringControls';
import LiveStatsCard from '../components/LiveStatsCard';
import AccumulatedPostureCard from '../components/AccumulatedPostureCard';
import PostureFeedbackPanel from '../components/PostureFeedbackPanel';
import './MonitorPage.css';

function MonitorPage() {
  const webcam = useWebcam();
  const session = usePostureSession();

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
      <div className="dashboard-content">
        {/* 왼쪽 사이드바 */}
        <aside className="sidebar left-sidebar">
          <nav className="sidebar-nav">
            <div className="nav-item active">
              <div className="nav-icon blue">📊</div>
              <div className="nav-text">
                <span className="nav-title">실시간 자세 분석</span>
              </div>
            </div>
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
