import apiClient from './api';

// ==================== 타입 정의 ====================

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface ReissueRequest {
  refreshToken: string;
}

// ==================== API 함수 ====================

/**
 * 회원가입 API
 * POST /api/auth/signup
 */
export async function signupApi(data: SignupRequest): Promise<string> {
  const response = await apiClient.post<string>('/api/auth/signup', data);
  return response.data;
}

/**
 * 로그인 API
 * POST /api/auth/login
 * 성공 시 accessToken과 refreshToken을 localStorage에 저장
 */
export async function loginApi(data: LoginRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/api/auth/login', data);
  const { accessToken, refreshToken } = response.data;
  
  // localStorage에 토큰 저장
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  
  return response.data;
}

/**
 * 로그아웃 API
 * POST /api/auth/logout
 */
export async function logoutApi(): Promise<void> {
  await apiClient.post('/api/auth/logout');
  
  // localStorage에서 토큰 제거
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

/**
 * 토큰 재발급 API
 * POST /api/auth/reissue
 * (일반적으로 인터셉터에서 자동 호출되지만, 필요시 직접 호출 가능)
 */
export async function reissueTokenApi(refreshToken: string): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/api/auth/reissue', {
    refreshToken,
  });
  
  const { accessToken, refreshToken: newRefreshToken } = response.data;
  
  // 새 토큰 저장
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', newRefreshToken);
  
  return response.data;
}

