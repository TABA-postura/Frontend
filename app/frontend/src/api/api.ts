import axios, {
  type AxiosInstance,
  AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

// ==================== 토큰 저장 키 ====================
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// ==================== Axios 인스턴스 ====================
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // ⭐ 핵심: 반드시 https
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// ==================== 토큰 관리 유틸 ====================
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

// ==================== Refresh 제어 ====================
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

// ==================== Request Interceptor ====================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const publicEndpoints = [
      '/api/auth/signup',
      '/api/auth/login',
      '/api/auth/reissue',
      '/api/contents', // Content API는 public (정보 제공 페이지)
      '/api/content', // Content API는 public (정보 제공 페이지)
      '/api/content/search', // Content 검색 API는 public
    ];

    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (!isPublicEndpoint) {
      const token = tokenStorage.getAccessToken();
      if (token) {
        // headers가 없으면 생성
        if (!config.headers) {
          config.headers = {} as any;
        }
        // Authorization 헤더 명시적으로 설정
        config.headers.Authorization = `Bearer ${token}`;
        
        // 디버깅: Authorization 헤더가 제대로 설정되었는지 확인
        // 프로덕션에서도 401 에러 디버깅을 위해 로그 출력
        const authHeader = config.headers.Authorization;
        const authHeaderStr = typeof authHeader === 'string' ? authHeader : String(authHeader || '');
        console.log('[API Request Interceptor] Authorization 헤더 추가됨:', {
          url: config.url,
          hasToken: !!token,
          tokenLength: token.length,
          authHeader: authHeaderStr.substring(0, 30) + '...',
          fullAuthHeader: authHeaderStr, // 전체 헤더 확인용 (디버깅)
        });
      } else {
        // 토큰이 없는데 인증이 필요한 엔드포인트인 경우 경고
        console.error('[API Request] 인증 토큰이 없습니다:', {
          url: config.url,
          isPublic: isPublicEndpoint,
          localStorage: {
            accessToken: localStorage.getItem('accessToken') ? 'exists' : 'missing',
            refreshToken: localStorage.getItem('refreshToken') ? 'exists' : 'missing',
          },
        });
      }
    }

    // 프로덕션에서도 401 에러 디버깅을 위해 로그 출력
    const authHeader = config.headers?.Authorization;
    const authHeaderStr = authHeader ? (typeof authHeader === 'string' ? authHeader : String(authHeader)) : null;
    console.log('[API Request]', {
      method: config.method,
      baseURL: config.baseURL,
      url: config.url,
      isPublic: isPublicEndpoint,
      hasAuth: !isPublicEndpoint && !!tokenStorage.getAccessToken(),
      hasAuthHeader: !!authHeader,
      authHeaderValue: authHeaderStr ? authHeaderStr.substring(0, 30) + '...' : null,
      // Network 탭에서 확인할 수 있도록 전체 헤더 정보 포함
      requestHeaders: {
        Authorization: authHeaderStr || '없음',
        'Content-Type': config.headers?.['Content-Type'] || '없음',
      },
    });

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ==================== Response Interceptor ====================
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest =
      error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Public endpoint 목록 (request interceptor와 동일)
    const publicEndpoints = [
      '/api/auth/signup',
      '/api/auth/login',
      '/api/auth/reissue',
      '/api/contents',
      '/api/content',
      '/api/content/search',
    ];

    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      originalRequest?.url?.includes(endpoint)
    );

    // ---------- 403 ----------
    if (error.response?.status === 403) {
      console.error('❌ 403 Forbidden', {
        baseURL: originalRequest?.baseURL,
        url: originalRequest?.url,
        method: originalRequest?.method,
        data: error.response.data,
      });
      return Promise.reject(error);
    }

    // ---------- 401 + Refresh ----------
    // Public endpoint는 401 에러가 발생해도 리다이렉트하지 않고 에러를 그대로 반환
    if (error.response?.status === 401 && isPublicEndpoint) {
      console.warn('[API Response Interceptor] Public endpoint에서 401 에러 발생 (리다이렉트하지 않음):', {
        url: originalRequest?.url,
        isPublic: true,
      });
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      console.warn('[API Response Interceptor] 401 에러 발생, 토큰 갱신 시도:', {
        url: originalRequest.url,
        method: originalRequest.method,
        hasRefreshToken: !!tokenStorage.getRefreshToken(),
        requestHeaders: {
          Authorization: originalRequest.headers?.Authorization ? '있음' : '없음',
          'Content-Type': originalRequest.headers?.['Content-Type'] || '없음',
        },
        responseStatus: error.response?.status,
        responseHeaders: error.response?.headers,
        responseData: error.response?.data,
        // 실제 요청 URL 확인
        fullUrl: `${originalRequest.baseURL}${originalRequest.url}`,
      });

      if (isRefreshing) {
        console.log('[API Response Interceptor] 이미 토큰 갱신 중, 대기열에 추가');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers && token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        console.error('[API Response Interceptor] Refresh Token이 없습니다. 로그인 페이지로 이동');
        tokenStorage.clearTokens();
        isRefreshing = false;
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        console.log('[API Response Interceptor] 토큰 갱신 요청 시작');
        // ⭐ 반드시 apiClient 사용 (axios 직접 호출 금지)
        const response = await apiClient.post<{
          accessToken: string;
          refreshToken: string;
        }>('/api/auth/reissue', { refreshToken });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        console.log('[API Response Interceptor] 토큰 갱신 성공, 원래 요청 재시도:', {
          originalUrl: originalRequest.url,
          newTokenLength: accessToken.length,
        });
        tokenStorage.setTokens(accessToken, newRefreshToken);
        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          console.log('[API Response Interceptor] 재시도 요청 헤더 설정:', {
            Authorization: `Bearer ${accessToken.substring(0, 30)}...`,
          });
        }

        isRefreshing = false;
        try {
          const retryResponse = await apiClient(originalRequest);
          console.log('[API Response Interceptor] 재시도 성공:', {
            url: originalRequest.url,
            status: retryResponse.status,
          });
          return retryResponse;
        } catch (retryError: any) {
          // 재시도 후에도 401이 발생하면 토큰 갱신이 실패한 것으로 간주
          if (retryError?.response?.status === 401) {
            console.error('[API Response Interceptor] 토큰 갱신 후에도 401 발생. 로그인 페이지로 이동:', {
              url: originalRequest.url,
              error: retryError.response?.data,
            });
            tokenStorage.clearTokens();
            window.location.href = '/login';
            return Promise.reject(retryError);
          }
          // 다른 에러는 그대로 전달
          return Promise.reject(retryError);
        }
      } catch (refreshError) {
        console.error('[API Response Interceptor] 토큰 갱신 실패:', refreshError);
        tokenStorage.clearTokens();
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
