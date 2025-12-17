import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

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
    <div
      style={{
        width: '100%',
        height: '150px',
        position: 'relative',
        zIndex: 10,
        overflow: 'hidden',
      }}
    >
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
      <Link
        to="/"
        style={{
          position: 'absolute',
          top: '40px',
          left: '80px',
          zIndex: 100,
          textDecoration: 'none',
        }}
      >
        <span
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'white',
            letterSpacing: '1px',
            margin: 0,
            fontFamily: "'Pretendard', sans-serif",
            cursor: 'pointer',
          }}
        >
          Postura
        </span>
      </Link>
      
      {/* 네비게이션 링크 */}
      <div
        style={{
          position: 'absolute',
          top: '80%',
          left: '50%',
          transform: 'translateX(-50%) translateY(-50%)',
          zIndex: 100,
          display: 'flex',
          gap: '80px',
          alignItems: 'center',
        }}
      >
        <Link
          to="/monitor"
          style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '18px',
            fontWeight: location.pathname === '/monitor' || location.pathname === '/realtime' ? 700 : 400,
            fontFamily: "'Pretendard', sans-serif",
            transition: 'opacity 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Real-time Analysis
        </Link>
        <Link
          to="/information"
          style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '18px',
            fontWeight: location.pathname === '/information' ? 700 : 400,
            fontFamily: "'Pretendard', sans-serif",
            transition: 'opacity 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Information
        </Link>
        <Link
          to="/selfcare"
          style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '18px',
            fontWeight: location.pathname === '/selfcare' ? 700 : 400,
            fontFamily: "'Pretendard', sans-serif",
            transition: 'opacity 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Self Management
        </Link>
      </div>
      
      {/* 로그아웃 - 우측 상단 */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '40px',
          zIndex: 100,
        }}
      >
        <button
          onClick={handleLogout}
          disabled={isLoading}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '14px',
            fontWeight: 400,
            fontFamily: "'Pretendard', sans-serif",
            cursor: isLoading ? 'not-allowed' : 'pointer',
            padding: 0,
            transition: 'opacity 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.opacity = '0.8';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          {isLoading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default TopBar;

