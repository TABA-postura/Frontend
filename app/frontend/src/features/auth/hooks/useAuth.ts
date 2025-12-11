/**
 * useAuth 커스텀 훅
 * 인증 상태 관리 및 로그인/로그아웃/회원가입 기능을 제공합니다.
 * 
 * 기존 코드와의 호환성을 위해 새로운 useAuth를 래핑합니다.
 */

import { useAuth as useNewAuth } from '../../../hooks/useAuth';
import { useCallback } from 'react';

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
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const { user, isAuthenticated, isLoading, signup: newSignup, login: newLogin, logout: newLogout } = useNewAuth();

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    await newLogin({ email, password });
  }, [newLogin]);

  const signup = useCallback(async (email: string, password: string, name: string): Promise<string> => {
    return await newSignup({ email, password, name });
  }, [newSignup]);

  const logout = useCallback(async (): Promise<void> => {
    await newLogout();
  }, [newLogout]);

  return {
    user: user ? { email: user.email, name: user.name } : null,
    isAuthenticated,
    isLoading,
    error: null, // 새로운 구조에서는 error를 별도로 관리하지 않음
    login,
    signup,
    logout,
  };
}
