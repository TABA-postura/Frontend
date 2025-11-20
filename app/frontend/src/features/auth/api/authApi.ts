// Auth API 타입 정의 및 API 함수

// Request 타입
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Response 타입
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface SignupResponse {
  message: string;
}

// API 에러 타입
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 공통 request wrapper
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  const url = `${baseUrl}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = '요청 처리 중 오류가 발생했습니다.';
      let errorData: unknown;

      try {
        const errorJson = await response.json();
        errorMessage = errorJson.message || errorJson.error || errorMessage;
        errorData = errorJson;
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
        errorMessage = response.statusText || errorMessage;
      }

      throw new ApiError(errorMessage, response.status, errorData);
    }

    // 응답이 비어있는 경우 (예: 204 No Content)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // 네트워크 오류 등 기타 에러
    throw new ApiError(
      error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.',
      0
    );
  }
}

// 회원가입 API
export async function signup(data: SignupRequest): Promise<SignupResponse> {
  return request<SignupResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 로그인 API
export async function login(data: LoginRequest): Promise<TokenResponse> {
  return request<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
