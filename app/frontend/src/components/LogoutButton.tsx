import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import './LogoutButton.css';

/**
 * LogoutButton
 * 좌측 상단에 고정된 로그아웃 버튼 컴포넌트
 */
const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // 로그아웃 성공 시 로그인 페이지로 이동
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // 에러가 발생해도 로그인 페이지로 이동 (토큰은 이미 삭제됨)
      navigate('/login', { replace: true });
    }
  };

  return (
    <button
      className="logout-button"
      onClick={handleLogout}
      disabled={isLoading}
      aria-label="로그아웃"
    >
      {isLoading ? '로그아웃 중...' : '로그아웃'}
    </button>
  );
};

export default LogoutButton;

