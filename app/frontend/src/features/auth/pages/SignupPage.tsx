import { useNavigate } from 'react-router-dom';
import SignupForm from '../components/SignupForm';

/**
 * SignupPage
 * 회원가입 폼을 렌더링하고,
 * 회원가입 성공 시 로그인 페이지로 이동하는 페이지 컴포넌트
 */
const SignupPage = () => {
  const navigate = useNavigate();

  // 회원가입 성공 → 로그인 페이지로 이동
  const handleSignupSuccess = () => {
    navigate('/login', { replace: true }); 
    // replace: true → 뒤로가기 시 다시 회원가입 페이지 안 뜨게 함
  };

  return (
    <div className="signup-page-container">
      <SignupForm onSuccess={handleSignupSuccess} />
    </div>
  );
};

export default SignupPage;
