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
    ];

    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (!isPublicEndpoint) {
      const token = tokenStorage.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (import.meta.env.DEV) {
      console.log('[API Request]', {
        method: config.method,
        baseURL: config.baseURL,
        url: config.url,
        isPublic: isPublicEndpoint,
        hasAuth: !isPublicEndpoint && !!tokenStorage.getAccessToken(),
      });
    }

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
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
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
        tokenStorage.clearTokens();
        isRefreshing = false;
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // ⭐ 반드시 apiClient 사용 (axios 직접 호출 금지)
        const response = await apiClient.post<{
          accessToken: string;
          refreshToken: string;
          tokenType: string;
        }>('/api/auth/reissue', { refreshToken });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        tokenStorage.setTokens(accessToken, newRefreshToken);
        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        isRefreshing = false;
        return apiClient(originalRequest);
      } catch (refreshError) {
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
