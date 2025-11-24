/**
 * useAuth 커스텀 훅
 * 인증 상태 관리 및 로그인/로그아웃/회원가입 기능을 제공합니다.
 */

import { useState, useEffect, useCallback } from 'react';
import { signupApi, loginApi } from '../api/authApi';
import type { TokenResponse } from '../api/authApi';

// ==================== 타입 정의 ====================

export interface User {
  email: string;
  name?: string;
}

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<string>;
  logout: () => void;
}

// ==================== 상수 ====================

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// ==================== 훅 구현 ====================

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 초기에 localStorage에서 토큰 확인 → 로그인 유지 처리
   */
  useEffect(() => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (accessToken) {
      // 간단히 로그인 상태로만 처리
      // 실제로는 JWT decode 후 email 꺼내기 또는 /api/user/me 호출 추천
      setUser({ email: 'unknown' });
    }
  }, []);

  const isAuthenticated = Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));

  /**
   * 로그인
   */
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const tokenResponse: TokenResponse = await loginApi({ email, password });

      localStorage.setItem(ACCESS_TOKEN_KEY, tokenResponse.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokenResponse.refreshToken);

      setUser({ email });
      setError(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        '로그인 중 오류가 발생했습니다.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 회원가입
   */
  const signup = useCallback(async (email: string, password: string, name: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const message = await signupApi({ email, password, name });

      setError(null);
      return message;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        '회원가입 중 오류가 발생했습니다.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 로그아웃
   */
  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setUser(null);
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
  };
}
