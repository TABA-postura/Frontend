import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './LoginForm.css';

/**
 * LoginForm 컴포넌트 Props 타입
 */
export interface LoginFormProps {
  /** 로그인 성공 시 호출되는 콜백 함수 */
  onSuccess?: () => void;
}

/**
 * 로그인 폼 컴포넌트
 * 이메일과 비밀번호를 입력받아 로그인을 수행합니다.
 */
const LoginForm = ({ onSuccess }: LoginFormProps = {}) => {
  // 폼 상태 관리
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // 인증 훅 사용
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

    // 이메일 형식 검사 (간단한 검사)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('올바른 이메일 형식을 입력해주세요.');
      return false;
    }

    setValidationError(null);
    return true;
  };

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 유효성 검사
    if (!validateForm()) {
      return;
    }

    try {
      // 로그인 API 호출
      await login(email, password);

      // 성공 시 콜백 호출 (보통 라우팅 처리)
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // 에러는 useAuth에서 처리되므로 여기서는 추가 처리 불필요
      // 필요시 추가 에러 처리 가능
      console.error('Login error:', err);
    }
  };

  // 표시할 에러 메시지 (유효성 검사 에러 또는 인증 에러)
  const displayError = validationError || authError;

  return (
    <div className="login-container">
      <div className="login-background">
        {/* 로고 */}
        <div className="login-logo-container">
          <Link to="/" className="login-logo-link">
            <span className="login-logo-text">Postura</span>
          </Link>
        </div>
        
        {/* 상단 전체 막대기 */}
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
                onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  disabled={isLoading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* 에러 메시지 표시 */}
            {displayError && (
              <div className="error-message" style={{ 
                color: '#e74c3c', 
                fontSize: '14px', 
                marginBottom: '16px',
                textAlign: 'center'
              }}>
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

          <Link to="/signup" className="signup-button">
            회원가입
          </Link>
        </div>
      </div>

      {/* 하단 회색 푸터 */}
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
