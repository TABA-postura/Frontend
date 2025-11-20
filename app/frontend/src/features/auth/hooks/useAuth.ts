import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { signup as signupApi, login as loginApi, SignupRequest, LoginRequest } from '../api/authApi';

export function useAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accessToken = useAuthStore((state) => state.accessToken);
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const hydrateFromStorage = useAuthStore((state) => state.hydrateFromStorage);
  const isAuthenticated = useAuthStore((state) => !!state.accessToken);

  // 초기 마운트 시 localStorage에서 상태 복원
  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  // 회원가입
  const signup = async (data: SignupRequest) => {
    setLoading(true);
    setError(null);

    try {
      await signupApi(data);
      // 회원가입 성공 시 로그인 페이지로 이동
      navigate('/login', { state: { message: '회원가입이 완료되었습니다. 로그인해주세요.' } });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : '회원가입 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 로그인
  const login = async (data: LoginRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loginApi(data);
      setTokens(response.accessToken, response.refreshToken, response.tokenType);

      // 로그인 성공 시 리다이렉트 처리
      const from = (location.state as { from?: string })?.from || '/';
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : '로그인 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const logout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  return {
    signup,
    login,
    logout,
    loading,
    error,
    isAuthenticated: !!accessToken,
    accessToken,
  };
}
