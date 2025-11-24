import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

/**
 * 로그인 페이지 컴포넌트
 * 로그인 폼을 표시하고, 로그인 성공 시 메인 페이지로 이동합니다.
 */
const LoginPage = () => {
  const navigate = useNavigate();

  /**
   * 로그인 성공 시 호출되는 핸들러
   * 메인 페이지(/)로 이동합니다.
   */
  const handleLoginSuccess = () => {
    navigate('/');
  };

  return (
    <div>
      <LoginForm onSuccess={handleLoginSuccess} />
    </div>
  );
};

export default LoginPage;
