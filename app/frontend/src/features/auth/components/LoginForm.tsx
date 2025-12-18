import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './LoginForm.css';

export interface LoginFormProps {
  onSuccess?: () => void;
}

interface OAuthError {
  type: string;
  message: string;
  provider?: string;
}

const LoginForm = ({ onSuccess }: LoginFormProps = {}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [oauthError, setOAuthError] = useState<OAuthError | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const { login, isLoading } = useAuth();

  // OAuth 에러 체크 (페이지 로드 시)
  useEffect(() => {
    const oauthErrorStr = localStorage.getItem('oauth_error');
    if (oauthErrorStr) {
      try {
        const error: OAuthError = JSON.parse(oauthErrorStr);
        setOAuthError(error);
        // 표시 후 localStorage에서 제거
        localStorage.removeItem('oauth_error');
      } catch (e) {
        console.error('OAuth error parsing failed:', e);
        localStorage.removeItem('oauth_error');
      }
    }
  }, []);

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

      // 성공 시 에러 초기화
      setLoginError(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      // 백엔드 응답 형식: { "code": "BAD_CREDENTIALS", "message": "..." }
      if (err?.response?.status === 401) {
        const errorMessage = err?.response?.data?.message || '이메일 또는 비밀번호가 올바르지 않습니다.';
        setLoginError(errorMessage);
      } else {
        // 기타 에러
        setLoginError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        console.error('Login error:', err);
      }
    }
  };

  // 최종 표시할 에러 메시지 (OAuth 에러 우선, 그 다음 로그인 에러, 마지막 유효성 검사 에러)
  const displayError = oauthError?.message || loginError || validationError;

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
                  {showPassword ? (
                    // 숨김 아이콘 (대각선이 그어진 눈)
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    // 보기 아이콘 (일반 눈)
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
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
                  padding: '12px',
                  backgroundColor: oauthError?.type === 'provider_mismatch' ? '#fff3cd' : '#f8d7da',
                  border: `1px solid ${oauthError?.type === 'provider_mismatch' ? '#ffc107' : '#f5c6cb'}`,
                  borderRadius: '4px',
                }}
              >
                {displayError}
                {oauthError?.type === 'provider_mismatch' && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#856404' }}>
                    {oauthError.provider 
                      ? `${oauthError.provider === 'google' ? 'Kakao' : oauthError.provider === 'kakao' ? 'Google' : '다른 소셜 로그인'}로 로그인해 주세요.`
                      : '아래 소셜 로그인 버튼을 사용해 주세요.'}
                  </div>
                )}
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
                window.location.href = 'https://api.taba-postura.com/oauth2/authorization/google';
              }}
              disabled={isLoading}
            >
              <svg className="social-icon-img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="social-text">Google로 로그인</span>
            </button>

            <button
              type="button"
              className="social-login-button kakao-login"
              onClick={() => {
                window.location.href = 'https://api.taba-postura.com/oauth2/authorization/kakao';
              }}
              disabled={isLoading}
            >
              <svg className="social-icon-img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#000000" d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
              </svg>
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
