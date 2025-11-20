import { Link } from 'react-router-dom';
import '../../../assets/styles/Home.css';
import PostureIssueSummary from '../components/PostureIssueSummary';

const MonitorPage = () => {
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
          <div className="content-header">
            <h1 className="main-title">실시간 자세 분석</h1>
            <p className="main-subtitle">웹캠을 통해 실시간으로 자세를 분석하고 모니터링하세요</p>
          </div>

          {/* 웹캠 및 통계 영역 */}
          <div className="monitor-section">
            <div className="webcam-section">
              <div className="webcam-placeholder">
                <div className="webcam-icon">📹</div>
                <p>웹캠 영역</p>
                <p className="webcam-hint">웹캠 권한을 허용하면 실시간 분석이 시작됩니다</p>
              </div>
            </div>

            <div className="stats-section">
              <PostureIssueSummary />
            </div>
          </div>
        </main>
      </div>

      {/* 도움말 버튼 */}
      <button className="help-button">?</button>
    </div>
  );
};

export default MonitorPage;
