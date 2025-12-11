import type { User, TokenResponse } from '../types/auth';

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
      // 사용자 정보가 없으면 토큰만으로 인증 상태 설정
      this.state.isAuthenticated = true;
      this.notify();
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
    this.notify();
    return isAuthenticated;
  }
}

export const authStore = new AuthStore();
