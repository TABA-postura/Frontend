import { useState } from 'react';
import { Link } from 'react-router-dom';
import './SignupForm.css';

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (confirmPassword && value !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (password && value !== password) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
      return;
    }
    // TODO: 회원가입 로직 구현
    console.log('Signup:', { email, password });
  };

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
              <label htmlFor="email">이메일</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
              {passwordError && (
                <span className="error-message">{passwordError}</span>
              )}
            </div>

            <button type="submit" className="signup-button">
              Sign Up
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
