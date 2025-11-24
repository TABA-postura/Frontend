import { api } from './axios';

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
}

/**
 * 회원가입 API
 * POST /api/auth/signup
 */
export async function signupApi(data: SignupRequest): Promise<string> {
  const response = await api.post('/api/auth/signup', data);
  return response.data; // "회원가입 완료" 문자열
}

/**
 * 로그인 API
 * POST /api/auth/login
 */
export async function loginApi(data: LoginRequest): Promise<TokenResponse> {
  const response = await api.post('/api/auth/login', data);
  return response.data; // TokenResponse
}
