import { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginForm.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 기본적으로 비밀번호 숨김 (점으로 표시)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 로그인 로직 구현
    console.log('Login:', { email, password });
  };

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
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button type="submit" className="login-button">
              로그인
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
