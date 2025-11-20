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
      <div className="signup-top-bar">
        <Link to="/" className="logo-link">
          <span className="logo-text">Postura</span>
        </Link>
      </div>

      <div className="signup-background"></div>

      <div className="signup-content">
        <div className="system-intro">
          <div className="system-icon">
            <span style={{ fontSize: '48px' }}>🖥️</span>
          </div>
          <h1 className="system-title">자세 분석 시스템</h1>
          <p className="system-description">
            올바른 자세를 유지하고 건강한 생활을 시작하세요
          </p>
        </div>

        <div className="signup-card">
          <h2 className="signup-title">회원가입</h2>
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
              회원가입
            </button>
          </form>

          <div className="login-link">
            <span>이미 계정이 있으신가요? </span>
            <Link to="/login">로그인</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
