/**
 * useAuth 커스텀 훅
 * 인증 상태 관리 및 로그인/로그아웃/회원가입 기능을 제공합니다.
 */

import { useState, useEffect, useCallback } from 'react';
import { signup as signupApi, login as loginApi } from '../api/authApi';
import type { TokenResponse } from '../api/authApi';

// ==================== 타입 정의 ====================

/**
 * 사용자 정보 타입
 */
export interface User {
  email: string;
  name?: string;
}

/**
 * useAuth 훅의 반환 타입
 */
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

/**
 * 인증 관련 상태와 함수를 제공하는 커스텀 훅
 * @returns 인증 상태 및 로그인/로그아웃/회원가입 함수
 */
export function useAuth(): UseAuthReturn {
  // 상태 관리
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * localStorage에서 accessToken을 읽어서 인증 상태 초기화
   */
  useEffect(() => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (accessToken) {
      // 토큰이 있으면 인증된 상태로 간주
      // 실제로는 토큰에서 사용자 정보를 디코딩하거나 API로 사용자 정보를 가져와야 함
      // 여기서는 간단히 email만 저장 (실제 구현 시 JWT 디코딩 또는 API 호출 필요)
      setUser({ email: '' }); // 초기값, 실제로는 토큰에서 추출하거나 API 호출 필요
    }
  }, []);

  /**
   * 인증 상태 계산 (accessToken 존재 여부)
   */
  const isAuthenticated = Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));

  /**
   * 로그인 함수
   * @param email 사용자 이메일
   * @param password 사용자 비밀번호
   */
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // API 호출
      const tokenResponse: TokenResponse = await loginApi({ email, password });

      // 토큰을 localStorage에 저장
      localStorage.setItem(ACCESS_TOKEN_KEY, tokenResponse.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokenResponse.refreshToken);

      // 사용자 상태 업데이트
      setUser({ email });

      // 성공 시 에러 초기화
      setError(null);
    } catch (err) {
      // 에러 처리
      const errorMessage = err instanceof Error ? err.message : '로그인에 실패했습니다.';
      setError(errorMessage);
      throw err; // 호출한 쪽에서도 에러를 처리할 수 있도록 rethrow
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 회원가입 함수
   * @param email 사용자 이메일
   * @param password 사용자 비밀번호
   * @param name 사용자 이름
   * @returns 성공 메시지 문자열
   */
  const signup = useCallback(async (email: string, password: string, name: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      // API 호출
      const successMessage = await signupApi({ email, password, name });

      // 회원가입 성공 시 토큰은 저장하지 않음 (로그인 필요)
      // 성공 메시지 반환
      setError(null);
      return successMessage;
    } catch (err) {
      // 에러 처리
      const errorMessage = err instanceof Error ? err.message : '회원가입에 실패했습니다.';
      setError(errorMessage);
      throw err; // 호출한 쪽에서도 에러를 처리할 수 있도록 rethrow
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 로그아웃 함수
   * localStorage에서 토큰 제거 및 사용자 상태 초기화
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
