import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './LoginForm.css';

export interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps = {}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { login, isLoading, error: authError } = useAuth();

  /**
   * 폼 유효성 검사
   */
  const validateForm = (): boolean => {
    if (!email.trim()) {
      setValidationError('이메일을 입력해주세요.');
      return false;
    }

    if (!password.trim()) {
      setValidationError('비밀번호를 입력해주세요.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('올바른 이메일 형식을 입력해주세요.');
      return false;
    }

    // 모든 유효성 검사 통과
    setValidationError(null);
    return true;
  };

  /**
   * 제출 핸들러
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isLoading) return; // 연타 방지
    setValidationError(null);

    if (!validateForm()) return;

    try {
      await login(email, password);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // useAuth에서 이미 처리됨
      console.error('Login error:', err);
    }
  };

  // 최종 표시할 에러 메시지
  const displayError = validationError || authError;

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-logo-container">
          <Link to="/" className="login-logo-link">
            <span className="login-logo-text">Postura</span>
          </Link>
        </div>

        <div className="login-top-bar-line"></div>
      </div>

      <div className="login-content">
        <div className="system-intro">
          <h1 className="system-title">자세 분석 시스템</h1>
          <p className="system-description">
            올바른 자세를 유지하고 건강한 생활을 시작하세요
          </p>
        </div>

        <div className="login-card">
          <h2 className="login-title">Login</h2>
          <p className="login-subtitle">계정에 로그인하여 시작하세요</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setValidationError(null);
                }}
                placeholder="example@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setValidationError(null);
                  }}
                  placeholder="비밀번호를 입력하세요"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  disabled={isLoading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {displayError && (
              <div
                className="error-message"
                style={{
                  color: '#e74c3c',
                  fontSize: '14px',
                  marginBottom: '16px',
                  textAlign: 'center',
                }}
              >
                {displayError}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? '로딩 중...' : '로그인'}
            </button>
          </form>

          {/* 소셜 로그인 구분선 */}
          <div className="social-login-divider">
            <span className="divider-line"></span>
            <span className="divider-text">또는</span>
            <span className="divider-line"></span>
          </div>

          {/* 소셜 로그인 버튼 */}
          <div className="social-login-buttons">
            <button
              type="button"
              className="social-login-button google-login"
              onClick={() => {
                // Google OAuth 인증 URL로 리다이렉트 (CloudFront 프록시 사용)
                window.location.href = '/api/oauth2/authorization/google';
              }}
              disabled={isLoading}
            >
              <span className="social-icon">🔵</span>
              <span className="social-text">Google로 로그인</span>
            </button>

            <button
              type="button"
              className="social-login-button kakao-login"
              onClick={() => {
                // Kakao OAuth 인증 URL로 리다이렉트 (CloudFront 프록시 사용)
                window.location.href = '/api/oauth2/authorization/kakao';
              }}
              disabled={isLoading}
            >
              <span className="social-icon">🟡</span>
              <span className="social-text">Kakao로 로그인</span>
            </button>
          </div>

          <Link to="/signup" className="signup-button">
            회원가입
          </Link>
        </div>
      </div>

      <footer className="login-footer">
        <div className="login-footer-content">
          <div className="login-footer-links">
            <a href="#" className="login-footer-link">개인정보처리방침</a>
            <span className="login-footer-divider">|</span>
            <a href="#" className="login-footer-link">이용약관</a>
            <span className="login-footer-divider">|</span>
            <a href="#" className="login-footer-link">문의하기</a>
          </div>
          <div className="login-footer-copyright">
            <p>Copyright (C) POSTURA All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginForm;
