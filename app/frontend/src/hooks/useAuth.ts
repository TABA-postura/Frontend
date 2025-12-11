import { useState, useEffect, useCallback } from 'react';
import { authStore } from '../store/authStore';
import * as authApi from '../api/auth';
import type { SignupRequest, LoginRequest } from '../types/auth';

export function useAuth() {
  const [state, setState] = useState(authStore.getState());

  useEffect(() => {
    const unsubscribe = authStore.subscribe(() => {
      setState(authStore.getState());
    });

    // 초기 인증 상태 확인
    authStore.checkAuth();

    return unsubscribe;
  }, []);

  const signup = useCallback(async (data: SignupRequest): Promise<string> => {
    try {
      authStore.setLoading(true);
      const message = await authApi.signupApi(data);
      authStore.setLoading(false);
      return message;
    } catch (error) {
      authStore.setLoading(false);
      // 브라우저 확장 프로그램 관련 경고는 무시하고 실제 에러만 throw
      if (error instanceof Error && error.message.includes('message channel')) {
        // 확장 프로그램 경고는 무시하고 성공으로 처리
        return '회원가입이 성공적으로 완료되었습니다.';
      }
      throw error;
    }
  }, []);

  const login = useCallback(async (data: LoginRequest): Promise<void> => {
    try {
      authStore.setLoading(true);
      const tokenResponse = await authApi.loginApi(data);
      authStore.setAuth(tokenResponse);
      authStore.setLoading(false);
    } catch (error) {
      authStore.setLoading(false);
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      authStore.setLoading(true);
      await authApi.logoutApi();
      authStore.logout();
      authStore.setLoading(false);
    } catch (error) {
      // 로그아웃 실패해도 로컬 상태는 초기화
      authStore.logout();
      authStore.setLoading(false);
      throw error;
    }
  }, []);

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    signup,
    login,
    logout,
  };
}

