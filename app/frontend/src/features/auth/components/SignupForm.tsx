import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './SignupForm.css';

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signup, loading, error } = useAuth();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      await signup({ email, password, name });
    } catch (err) {
      // 에러는 useAuth에서 처리됨
      console.error('Signup error:', err);
    }
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
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">이름</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                required
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
              {passwordError && (
                <span className="error-message">{passwordError}</span>
              )}
            </div>

            {error && (
              <div className="error-message" style={{ color: '#e74c3c', fontSize: '14px', marginTop: '-10px', marginBottom: '10px' }}>
                {error}
              </div>
            )}

            <button type="submit" className="signup-button" disabled={loading}>
              {loading ? '회원가입 중...' : '회원가입'}
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
