import { Link, useLocation } from 'react-router-dom';
import '../../../assets/styles/SelfManagement.css';

const SelfCarePage = () => {
  const location = useLocation();
  return (
    <div>
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
            <Link
              to="/information"
              className={`nav-item ${location.pathname === '/information' ? 'active' : ''}`}
            >
              <div className="nav-icon blue">📚</div>
              <div className="nav-text">
                <span className="nav-title">정보 제공</span>
              </div>
            </Link>
            <div className={`nav-item ${location.pathname === '/self-management' ? 'active' : ''}`}>
              <div className="nav-icon">👤</div>
              <div className="nav-text">
                <span className="nav-title">자기 관리</span>
              </div>
            </div>
          </nav>
          <div className="cookie-link">쿠키 관리 또는 옵트 아웃</div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="main-content">
          <div className="content-section">
            <div className="recommendations-section">
              <h3 className="section-title">맞춤 개선 추천</h3>
              <div className="recommendations-grid">
                <div className="recommendation-card">
                  <div className="rec-header">
                    <span className="rec-icon warning">⚠️</span>
                    <h4 className="rec-title">어깨 균형 개선</h4>
                  </div>
                  <p className="rec-description">
                    어깨 높이 차이가 자주 감지됩니다. 양쪽 어깨를 균등하게 사용하도록 주의하세요.
                  </p>
                  <button className="rec-button">추천 스트레칭 보기 →</button>
                </div>

                <div className="recommendation-card">
                  <div className="rec-header">
                    <span className="rec-icon info">🎯</span>
                    <h4 className="rec-title">화면 거리 유지</h4>
                  </div>
                  <p className="rec-description">
                    모니터와의 거리가 가까워지는 경향이 있습니다. 최소 50cm 이상 거리를 유지하세요.
                  </p>
                  <button className="rec-button">추천 스트레칭 보기 →</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 도움말 버튼 */}
      <button className="help-button">?</button>
    </div>
  );
};

export default SelfCarePage;
