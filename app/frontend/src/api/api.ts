import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';

// 환경 변수에서 BASE_URL 가져오기
// 프로덕션 환경에서는 환경 변수가 필수입니다!
const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  // 프로덕션 환경에서는 환경 변수가 필수
  if (import.meta.env.PROD) {
    if (!envUrl) {
      const errorMsg = 
        '❌ CRITICAL ERROR: VITE_API_BASE_URL 환경 변수가 설정되지 않았습니다!\n' +
        '프로덕션 환경에서는 반드시 .env.production 파일에 VITE_API_BASE_URL을 설정해야 합니다.\n' +
        '\n' +
        '해결 방법:\n' +
        '1. 프로젝트 루트에 .env.production 파일 생성\n' +
        '2. 다음 내용 추가:\n' +
        '   VITE_API_BASE_URL=https://d28g9sy3jh6o3a.cloudfront.net\n' +
        '   (또는 백엔드 HTTPS URL)\n' +
        '3. npm run build 재실행\n' +
        '4. 재배포';
      
      console.error(errorMsg);
      throw new Error('VITE_API_BASE_URL 환경 변수가 설정되지 않았습니다. .env.production 파일을 확인하세요.');
    }
    
    // 프로덕션에서 HTTP 사용 시 경고 (에러는 발생시키지 않음)
    if (envUrl.startsWith('http://')) {
      const warningMsg = 
        '⚠️ Mixed Content Warning: 프로덕션 환경에서 HTTP API를 사용하고 있습니다.\n' +
        `현재 설정된 URL: ${envUrl}\n` +
        '\n' +
        '⚠️ 주의사항:\n' +
        '- 일부 브라우저에서 Mixed Content 정책으로 인해 차단될 수 있습니다.\n' +
        '- 보안상 HTTPS 사용을 강력히 권장합니다.\n' +
        '\n' +
        '💡 해결 방법 (권장):\n' +
        '1. 백엔드에 HTTPS 설정 (Let\'s Encrypt 무료 인증서 사용 가능)\n' +
        '2. Nginx/CloudFront/ALB를 통한 프록시 설정\n' +
        '3. .env.production 파일에 HTTPS URL 설정';
      
      console.warn(warningMsg);
      // 에러를 던지지 않고 경고만 표시하고 계속 진행
    }
    
    return envUrl;
  }
  
  // 개발 환경: fallback 사용 (개발 편의성)
  return envUrl || 'http://api.taba-postura.com:8080';
};

const BASE_URL = getBaseUrl();

// 디버깅: 런타임에 BASE_URL 확인 (프로덕션에서도 표시)
if (typeof window !== 'undefined') {
  console.log('🔍 [API Config] BASE_URL:', BASE_URL);
  console.log('🔍 [API Config] VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('🔍 [API Config] PROD:', import.meta.env.PROD);
  console.log('🔍 [API Config] MODE:', import.meta.env.MODE);
  
      // 프로덕션에서 잘못된 URL 사용 시 경고
      if (import.meta.env.PROD) {
        if (BASE_URL.includes('13.239.176.67') || (BASE_URL.includes('api.taba-postura.com') && BASE_URL.startsWith('http://'))) {
          console.error('❌ [CRITICAL] 잘못된 BASE_URL이 사용되고 있습니다!');
          console.error('   현재 BASE_URL:', BASE_URL);
          console.error('   환경 변수:', import.meta.env.VITE_API_BASE_URL);
          console.error('   이것은 빌드 시 환경 변수가 제대로 포함되지 않았음을 의미합니다.');
        }
      }
}

// 토큰 저장 키
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// API 클라이언트 인스턴스 생성
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// 토큰 관리 유틸리티
export const tokenStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// 토큰 재발급 함수 (순환 참조 방지를 위해 별도로 정의)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 요청 인터셉터: AccessToken 자동 헤더 주입
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 공개 API 엔드포인트는 Authorization 헤더를 추가하지 않음
    const publicEndpoints = ['/api/auth/signup', '/api/auth/login', '/api/auth/reissue'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    // 공개 엔드포인트가 아니고 토큰이 있는 경우에만 Authorization 헤더 추가
    if (!isPublicEndpoint) {
      const token = tokenStorage.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // 디버깅: 요청 정보 로깅 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log('[API Request]', {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        isPublic: isPublicEndpoint,
        hasAuth: !isPublicEndpoint && !!tokenStorage.getAccessToken(),
      });
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리 및 RefreshToken 재발급
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 403 Forbidden 에러 처리
    if (error.response?.status === 403) {
      const errorDetails = {
        url: originalRequest?.url,
        method: originalRequest?.method,
        baseURL: originalRequest?.baseURL,
        fullUrl: `${originalRequest?.baseURL}${originalRequest?.url}`,
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data,
        requestHeaders: originalRequest?.headers,
      };
      
      console.error('❌ 403 Forbidden Error:', errorDetails);
      console.error('💡 가능한 원인:');
      console.error('   1. CORS 설정 문제 - 백엔드에서 Origin을 허용하지 않음');
      console.error('   2. 백엔드 서버의 보안 정책 (IP/도메인 화이트리스트)');
      console.error('   3. 요청 헤더 문제 - 백엔드가 특정 헤더를 요구하거나 거부');
      console.error('   4. 백엔드 API 경로가 다를 수 있음');
      
      // 403 에러는 그대로 전달 (재시도하지 않음)
      return Promise.reject(error);
    }

    // 401 에러이고, 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 토큰 재발급 중이면 대기열에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        // RefreshToken이 없으면 로그아웃 처리
        tokenStorage.clearTokens();
        processQueue(error, null);
        isRefreshing = false;
        // 로그인 페이지로 리다이렉트 (필요시)
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        // 토큰 재발급 API 호출 (순환 참조 방지를 위해 axios 직접 사용)
        const response = await axios.post<{
          accessToken: string;
          refreshToken: string;
          tokenType: string;
        }>(`${BASE_URL}/api/auth/reissue`, {
          refreshToken,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // 새 토큰 저장
        tokenStorage.setTokens(accessToken, newRefreshToken);

        // 대기 중인 요청들 처리
        processQueue(null, accessToken);

        // 원래 요청 재시도
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 토큰 재발급 실패 시 로그아웃 처리
        tokenStorage.clearTokens();
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;
        // 로그인 페이지로 리다이렉트
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

