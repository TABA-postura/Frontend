import './SocialLoginButtons.css';

export interface SocialLoginButtonsProps {
  disabled?: boolean;
}

const SocialLoginButtons = ({ disabled = false }: SocialLoginButtonsProps) => {
  const handleGoogleLogin = () => {
    window.location.href = 'https://api.taba-postura.com/oauth2/authorization/google';
  };

  const handleKakaoLogin = () => {
    window.location.href = 'https://api.taba-postura.com/oauth2/authorization/kakao';
  };

  return (
    <div className="social-login-buttons">
      <button
        type="button"
        className="social-login-button google-login"
        onClick={handleGoogleLogin}
        disabled={disabled}
      >
        <span className="social-icon">🔵</span>
        <span className="social-text">Google로 로그인</span>
      </button>

      <button
        type="button"
        className="social-login-button kakao-login"
        onClick={handleKakaoLogin}
        disabled={disabled}
      >
        <span className="social-icon">🟡</span>
        <span className="social-text">Kakao로 로그인</span>
      </button>
    </div>
  );
};

export default SocialLoginButtons;

