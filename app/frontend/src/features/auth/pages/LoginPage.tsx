import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

/**
 * LoginPage
 * 로그인 폼을 렌더링하고, 로그인 성공 시 모니터 페이지로 이동하는 페이지 컴포넌트
 */
const LoginPage = () => {
  const navigate = useNavigate();

  // 로그인 성공 → 모니터 페이지로 이동
  const handleLoginSuccess = () => {
    navigate('/monitor', { replace: true }); // 뒤로가기 방지 옵션
  };

  return (
    <div className="login-page-container">
      <LoginForm onSuccess={handleLoginSuccess} />
    </div>
  );
};

export default LoginPage;
