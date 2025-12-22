import type { User, TokenResponse } from '../types/auth';
import { getUserFromToken } from '../utils/jwt';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

class AuthStore {
  private state: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  };

  private listeners: Set<() => void> = new Set();

  getState(): AuthState {
    return { ...this.state };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  setLoading(loading: boolean): void {
    this.state.isLoading = loading;
    this.notify();
  }

  setUser(user: User | null): void {
    this.state.user = user;
    this.state.isAuthenticated = !!user;
    this.notify();
  }

  setAuth(_tokenResponse: TokenResponse, user?: User): void {
    // 토큰은 이미 localStorage에 저장되어 있음
    if (user) {
      this.setUser(user);
    } else {
      // 사용자 정보가 없으면 JWT 토큰에서 추출 시도
      const tokenUser = getUserFromToken();
      if (tokenUser) {
        // JWT에서 추출한 정보를 User 타입으로 변환
        const userFromToken: User = {
          id: 0, // JWT에 id가 없을 수 있으므로 기본값 사용
          email: tokenUser.email,
          name: tokenUser.name || tokenUser.email.split('@')[0], // name이 없으면 이메일에서 추출
        };
        this.setUser(userFromToken);
      } else {
        // 사용자 정보를 찾을 수 없으면 토큰만으로 인증 상태 설정
        this.state.isAuthenticated = true;
        this.notify();
      }
    }
  }

  logout(): void {
    // 토큰 삭제 (localStorage)
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // 상태 초기화
    this.state.user = null;
    this.state.isAuthenticated = false;
    this.notify();
  }

  checkAuth(): boolean {
    const token = localStorage.getItem('accessToken');
    const isAuthenticated = !!token;
    this.state.isAuthenticated = isAuthenticated;
    
    // 토큰이 있으면 사용자 정보도 복원 시도
    if (isAuthenticated && !this.state.user) {
      const tokenUser = getUserFromToken();
      if (tokenUser) {
        const userFromToken: User = {
          id: 0,
          email: tokenUser.email,
          name: tokenUser.name || tokenUser.email.split('@')[0],
        };
        this.setUser(userFromToken);
      }
    }
    
    this.notify();
    return isAuthenticated;
  }
}

export const authStore = new AuthStore();
