import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './SignupForm.css';

/**
 * SignupForm 컴포넌트 Props 타입
 */
export interface SignupFormProps {
  /** 회원가입 성공 시 호출되는 콜백 함수 */
  onSuccess?: () => void;
}

/**
 * 회원가입 폼 컴포넌트
 * 이름, 이메일, 비밀번호를 입력받아 회원가입을 수행합니다.
 */
const SignupForm = ({ onSuccess }: SignupFormProps = {}) => {
  // 폼 상태 관리
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 인증 훅 사용
  const { signup, isLoading, error: authError } = useAuth();

  /**
   * 비밀번호 변경 핸들러
   * 비밀번호 일치 여부를 실시간으로 검사합니다.
   */
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (confirmPassword && value !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setPasswordError('');
    }
  };

  /**
   * 비밀번호 확인 변경 핸들러
   * 비밀번호 일치 여부를 실시간으로 검사합니다.
   */
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (password && value !== password) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setPasswordError('');
    }
  };

  /**
   * 폼 유효성 검사
   */
  const validateForm = (): boolean => {
    if (!name.trim()) {
      setValidationError('이름을 입력해주세요.');
      return false;
    }

    if (!email.trim()) {
      setValidationError('이메일을 입력해주세요.');
      return false;
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('올바른 이메일 형식을 입력해주세요.');
      return false;
    }

    if (!password.trim()) {
      setValidationError('비밀번호를 입력해주세요.');
      return false;
    }

    if (password.length < 8) {
      setValidationError('비밀번호는 8자 이상이어야 합니다.');
      return false;
    }

    if (password !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
      setValidationError('비밀번호가 일치하지 않습니다.');
      return false;
    }

    setValidationError(null);
    setPasswordError('');
    return true;
  };

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMessage(null);

    // 유효성 검사
    if (!validateForm()) {
      return;
    }

    try {
      // 회원가입 API 호출
      const message = await signup(email, password, name);

      // 성공 메시지 표시
      setSuccessMessage(message || '회원가입이 성공적으로 완료되었습니다.');

      // 성공 시 콜백 호출 (보통 로그인 페이지로 이동)
      if (onSuccess) {
        // 약간의 지연 후 콜백 호출 (사용자가 성공 메시지를 볼 수 있도록)
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      // 에러는 useAuth에서 처리되므로 여기서는 추가 처리 불필요
      console.error('Signup error:', err);
    }
  };

  // 표시할 에러 메시지 (유효성 검사 에러 또는 인증 에러)
  const displayError = validationError || authError;

  return (
    <div className="signup-container">
      <div className="signup-background">
        {/* 로고 */}
        <div className="signup-logo-container">
          <Link to="/" className="signup-logo-link">
            <span className="signup-logo-text">Postura</span>
          </Link>
        </div>
        
        {/* 상단 전체 막대기 */}
        <div className="signup-top-bar-line"></div>
      </div>

      <div className="signup-content">
        <div className="system-intro">
          <h1 className="system-title">자세 분석 시스템</h1>
          <p className="system-description">
            올바른 자세를 유지하고 건강한 생활을 시작하세요
          </p>
        </div>

        <div className="signup-card">
          <h2 className="signup-title">Sign Up</h2>
          <p className="signup-subtitle">새로운 계정을 만들어 시작하세요</p>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">이름</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                required
                disabled={isLoading}
              />
            </div>

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
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                  minLength={8}
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

            <div className="form-group">
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {passwordError && (
                <span className="error-message">{passwordError}</span>
              )}
            </div>

            {/* 성공 메시지 표시 */}
            {successMessage && (
              <div className="success-message" style={{ 
                color: '#27ae60', 
                fontSize: '14px', 
                marginBottom: '16px',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                {successMessage}
              </div>
            )}

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
              className="signup-button"
              disabled={isLoading}
            >
              {isLoading ? '로딩 중...' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
      {/* 하단 회색 푸터 */}
      <footer className="signup-footer">
        <div className="signup-footer-content">
          <div className="signup-footer-links">
            <a href="#" className="signup-footer-link">개인정보처리방침</a>
            <span className="signup-footer-divider">|</span>
            <a href="#" className="signup-footer-link">이용약관</a>
            <span className="signup-footer-divider">|</span>
            <a href="#" className="signup-footer-link">문의하기</a>
          </div>
          <div className="signup-footer-copyright">
            <p>Copyright (C) POSTURA All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SignupForm;
