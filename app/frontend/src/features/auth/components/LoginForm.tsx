import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './LoginForm.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const location = useLocation();

  // 회원가입 성공 메시지 표시
  useEffect(() => {
    const state = location.state as { message?: string };
    if (state?.message) {
      // 메시지를 표시할 수 있는 방법 (예: alert 또는 toast)
      // 여기서는 간단히 console에 출력
      console.log(state.message);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
    } catch (err) {
      // 에러는 useAuth에서 처리됨
      console.error('Login error:', err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-top-bar">
        <Link to="/" className="logo-link">
          <span className="logo-text">Postura</span>
        </Link>
      </div>

      <div className="login-background"></div>

      <div className="login-content">
        <div className="system-intro">
          <div className="system-icon">
            <span style={{ fontSize: '48px' }}>🖥️</span>
          </div>
          <h1 className="system-title">자세 분석 시스템</h1>
          <p className="system-description">
            올바른 자세를 유지하고 건강한 생활을 시작하세요
          </p>
        </div>

        <div className="login-card">
          <h2 className="login-title">로그인</h2>
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
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="error-message" style={{ color: '#e74c3c', fontSize: '14px', marginTop: '-10px', marginBottom: '10px' }}>
                {error}
              </div>
            )}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <Link to="/signup" className="signup-button">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
