import { useNavigate } from 'react-router-dom';
import SignupForm from '../components/SignupForm';

/**
 * 회원가입 페이지 컴포넌트
 * 회원가입 폼을 표시하고, 회원가입 성공 시 로그인 페이지로 이동합니다.
 */
const SignupPage = () => {
  const navigate = useNavigate();

  /**
   * 회원가입 성공 시 호출되는 핸들러
   * 로그인 페이지(/login)로 이동합니다.
   */
  const handleSignupSuccess = () => {
    navigate('/login');
  };

  return (
    <div>
      <SignupForm onSuccess={handleSignupSuccess} />
    </div>
  );
};

export default SignupPage;
