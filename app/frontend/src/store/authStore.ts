import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// User 타입 정의
export interface User {
  id?: string;
  email?: string;
  name?: string;
}

// Auth Store 상태 타입
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  user: User | null;
}

// Auth Store Actions 타입
interface AuthActions {
  setTokens: (accessToken: string, refreshToken: string, tokenType: string) => void;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
  hydrateFromStorage: () => void;
}

// isAuthenticated는 computed 값으로 처리
export const selectIsAuthenticated = (state: AuthState): boolean => {
  return !!state.accessToken;
};

// Auth Store 전체 타입
type AuthStore = AuthState & AuthActions;

// 초기 상태
const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  tokenType: null,
  user: null,
};

// Auth Store 생성
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      // 토큰 설정
      setTokens: (accessToken, refreshToken, tokenType) => {
        set({
          accessToken,
          refreshToken,
          tokenType,
        });
      },

      // 사용자 정보 설정
      setUser: (user) => {
        set({ user });
      },

      // 인증 정보 초기화
      clearAuth: () => {
        set(initialState);
      },

      // localStorage에서 상태 복원
      hydrateFromStorage: () => {
        // persist 미들웨어가 자동으로 처리하므로 여기서는 별도 작업 불필요
        // persist가 자동으로 상태를 복원하므로 이 함수는 빈 함수로 유지
        // 필요시 추가 로직을 여기에 구현할 수 있습니다
      },
    }),
    {
      name: 'auth-storage', // localStorage 키 이름
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tokenType: state.tokenType,
        user: state.user,
      }),
    }
  )
);
