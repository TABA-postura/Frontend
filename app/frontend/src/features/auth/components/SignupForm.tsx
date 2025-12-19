import { useState, useRef, useEffect } from 'react';
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

  // timeout 정리를 위한 ref
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 컴포넌트 언마운트 시 timeout 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // [FIX] 어떤 값이 와도 JSX에 안전하게 뿌릴 수 있도록 문자열로 정규화
  const safeText = (v: any): string => {
    if (typeof v === 'string') return v;
    if (v == null) return '';
    if (typeof v === 'object' && 'message' in v) return String((v as any).message ?? '');
    return String(v);
  };

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
      const result = await signup(email, password, name);

      // [FIX] signup()이 객체를 반환해도 화면에는 문자열만 렌더링되게 처리
      const msg = safeText(result) || '회원가입이 성공적으로 완료되었습니다.';
      setSuccessMessage(msg);

      // 성공 시 콜백 호출 (보통 로그인 페이지로 이동)
      if (onSuccess) {
        // 기존 timeout 정리
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // 약간의 지연 후 콜백 호출 (사용자가 성공 메시지를 볼 수 있도록)
        timeoutRef.current = setTimeout(() => {
          onSuccess();
          timeoutRef.current = null;
        }, 1500);
      }
    } catch (err: any) {
      // 브라우저 확장 프로그램 관련 경고는 무시
      if (err instanceof Error && err.message.includes('message channel')) {
        return;
      }

      // 409 CONFLICT: 이미 가입된 이메일
      if (err?.response?.status === 409) {
        const errorData = err?.response?.data;
        // 백엔드 응답 형식: { "code": "DUPLICATE_EMAIL", "message": "이미 가입된 이메일입니다: user@example.com" }
        const errorCode = errorData?.code;
        const errorMessage = safeText(errorData?.message) || '';

        // code가 DUPLICATE_EMAIL이거나 message에 관련 키워드가 있으면 그대로 사용
        if (
          errorCode === 'DUPLICATE_EMAIL' ||
          errorMessage.includes('이메일') ||
          errorMessage.includes('이미') ||
          errorMessage.includes('존재')
        ) {
          setValidationError(errorMessage || '이미 가입된 이메일입니다.');
        } else {
          setValidationError('이미 가입된 이메일입니다. 다른 이메일을 사용하거나 로그인해주세요.');
        }
      }
      // 400 에러: 입력값 검증 오류
      else if (err?.response?.status === 400) {
        const errorMessage = safeText(err?.response?.data?.message) || '';
        // 이메일 관련 에러인지 확인
        if (errorMessage.toLowerCase().includes('email') || errorMessage.includes('이메일')) {
          setValidationError('이미 가입된 이메일입니다. 다른 이메일을 사용하거나 로그인해주세요.');
        } else {
          setValidationError(errorMessage || '입력한 정보를 확인해주세요.');
        }
      }
      // 500번대 서버 오류
      else if (err?.response?.status >= 500) {
        setValidationError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
      // 네트워크 오류
      else if (err?.code === 'ERR_NETWORK') {
        setValidationError('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
      }
      // 기타 오류
      else {
        // 에러 메시지에 이메일 관련 내용이 있는지 확인
        const errorMessage = safeText(err?.message) || '';
        if (errorMessage.toLowerCase().includes('email') || errorMessage.includes('이메일') || errorMessage.includes('이미')) {
          setValidationError('이미 가입된 이메일입니다. 다른 이메일을 사용하거나 로그인해주세요.');
        } else {
          setValidationError('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
        console.error('Signup error:', err);
      }
    }
  };

  // 표시할 에러 메시지 (유효성 검사 에러 또는 인증 에러)
  // [FIX] authError가 혹시 객체로 들어와도 안전하게 문자열 처리
  const displayError = safeText(validationError) || safeText(authError) || null;

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
          <p className="system-description">올바른 자세를 유지하고 건강한 생활을 시작하세요</p>
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
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
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
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && <span className="error-message">{passwordError}</span>}
            </div>

            {/* 성공 메시지 표시 */}
            {successMessage && (
              <div
                className="success-message"
                style={{
                  color: '#27ae60',
                  fontSize: '14px',
                  marginBottom: '16px',
                  textAlign: 'center',
                  fontWeight: '500',
                }}
              >
                {successMessage}
              </div>
            )}

            {/* 에러 메시지 표시 */}
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

            <button type="submit" className="signup-button" disabled={isLoading}>
              {isLoading ? '로딩 중...' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
      {/* 하단 회색 푸터 */}
      <footer className="signup-footer">
        <div className="signup-footer-content">
          <div className="signup-footer-links">
            <a href="#" className="signup-footer-link">
              개인정보처리방침
            </a>
            <span className="signup-footer-divider">|</span>
            <a href="#" className="signup-footer-link">
              이용약관
            </a>
            <span className="signup-footer-divider">|</span>
            <a href="#" className="signup-footer-link">
              문의하기
            </a>
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
