/**
 * Auth API 모듈
 * 백엔드 인증 API와 통신하는 함수들을 제공합니다.
 */

// ==================== 타입 정의 ====================

/**
 * 회원가입 요청 타입
 */
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * 로그인 요청 타입
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 토큰 응답 타입
 * 백엔드에서 반환하는 인증 토큰 정보
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // 초 단위 만료 시간
}

// ==================== API 함수 ====================

/**
 * 회원가입 API 호출
 * @param request 회원가입 요청 데이터 (email, password, name)
 * @returns 서버에서 반환하는 성공 메시지 문자열
 * @throws Error HTTP 에러 또는 네트워크 에러 발생 시
 */
export async function signup(request: SignupRequest): Promise<string> {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    // HTTP 상태 코드가 200대가 아니면 에러 처리
    if (!response.ok) {
      let errorMessage = '회원가입에 실패했습니다.';
      
      // 서버에서 에러 메시지를 반환한 경우 파싱 시도
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
        errorMessage = `회원가입 실패: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    // 성공 응답 파싱 (서버에서 문자열 JSON 반환)
    const result = await response.json();
    
    // 응답이 문자열인 경우 그대로 반환, 객체인 경우 message 필드 확인
    if (typeof result === 'string') {
      return result;
    } else if (result.message) {
      return result.message;
    } else {
      return '회원가입이 성공적으로 완료되었습니다.';
    }
  } catch (error) {
    // 네트워크 에러 또는 기타 에러 처리
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('회원가입 중 오류가 발생했습니다.');
  }
}

/**
 * 로그인 API 호출
 * @param request 로그인 요청 데이터 (email, password)
 * @returns 토큰 응답 (accessToken, refreshToken, expiresIn)
 * @throws Error HTTP 에러 또는 네트워크 에러 발생 시
 */
export async function login(request: LoginRequest): Promise<TokenResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    // HTTP 상태 코드가 200대가 아니면 에러 처리
    if (!response.ok) {
      let errorMessage = '로그인에 실패했습니다.';
      
      // 서버에서 에러 메시지를 반환한 경우 파싱 시도
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
        errorMessage = `로그인 실패: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    // 성공 응답 파싱 (TokenResponse 타입)
    const tokenResponse: TokenResponse = await response.json();
    
    // 필수 필드 검증
    if (!tokenResponse.accessToken || !tokenResponse.refreshToken) {
      throw new Error('서버 응답 형식이 올바르지 않습니다.');
    }

    return tokenResponse;
  } catch (error) {
    // 네트워크 에러 또는 기타 에러 처리
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('로그인 중 오류가 발생했습니다.');
  }
}
