import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import './TopBar.css';

const TopBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('로그아웃 실패:', error);
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="topbar">
      <img
        src="/images/posetura_line.png"
        alt="Postura Line"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
        onError={(e) => {
          console.error('TopBar 이미지 로드 실패:', '/images/posetura_line.png');
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement!.style.backgroundColor = '#1e3a8a';
        }}
      />
      {/* Postura 로고 - 클릭시 메인 화면으로 이동 */}
      <Link to="/" className="topbar__logo">
        <span className="topbar__logo-text">Postura</span>
      </Link>
      
      {/* 네비게이션 링크 */}
      <div className="topbar__nav">
        <Link
          to="/monitor"
          className={`topbar__nav-link ${
            location.pathname === '/monitor' || location.pathname === '/realtime' ? 'topbar__nav-link--active' : ''
          }`}
        >
          Real-time Analysis
        </Link>
        <Link
          to="/information"
          className={`topbar__nav-link ${
            location.pathname === '/information' ? 'topbar__nav-link--active' : ''
          }`}
        >
          Information
        </Link>
        <Link
          to="/selfcare"
          className={`topbar__nav-link ${
            location.pathname === '/selfcare' ? 'topbar__nav-link--active' : ''
          }`}
        >
          Self Management
        </Link>
      </div>
      
      {/* 로그아웃 - 우측 상단 */}
      <div className="topbar__logout">
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="topbar__logout-button"
        >
          {isLoading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default TopBar;

