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

// [FIX] 공통 문자열 정규화 함수
const toMessageString = (v: any): string => {
  if (typeof v === 'string') return v;
  if (v == null) return '';
  if (typeof v === 'object' && 'message' in v) return String((v as any).message ?? '');
  return String(v);
};

export function useAuth(): UseAuthReturn {
  const { user, isAuthenticated, isLoading, signup: newSignup, login: newLogin, logout: newLogout } = useNewAuth();

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      await newLogin({ email, password } as any);
    },
    [newLogin]
  );

  const signup = useCallback(
    async (email: string, password: string, name: string): Promise<string> => {
      const res = await newSignup({ email, password, name } as any);

      // [FIX] signup 결과가 객체여도 항상 string으로 반환
      return toMessageString(res);
    },
    [newSignup]
  );

  const logout = useCallback(async (): Promise<void> => {
    await newLogout();
  }, [newLogout]);

  return {
    user: user ? { email: user.email, name: user.name } : null,
    isAuthenticated,
    isLoading,
    error: null, // (현 구조 유지) 필요하면 여기서도 신규 훅의 error를 문자열로 매핑 가능
    login,
    signup,
    logout,
  };
}
