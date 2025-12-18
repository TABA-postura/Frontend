# 인증 API 구현 가이드

백엔드 인증 시스템과 프론트엔드 연동을 위한 명확한 스펙 문서입니다.

---

## 📋 목차

1. [로컬 로그인](#1-로컬-로그인)
2. [로컬 회원가입](#2-로컬-회원가입)
3. [OAuth 소셜 로그인](#3-oauth-소셜-로그인)
4. [토큰 관리](#4-토큰-관리)
5. [에러 처리](#5-에러-처리)
6. [중요 사항](#6-중요-사항)

---

## 1. 로컬 로그인

### 요청

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "********"
}
```

### 성공 응답 (200 OK)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer"
}
```

**프론트엔드 처리:**
- `accessToken`과 `refreshToken`을 **localStorage에 저장**
- 이후 모든 API 요청에 `Authorization: Bearer <accessToken>` 헤더 포함

### 실패 응답 (401 UNAUTHORIZED)

```json
{
  "code": "BAD_CREDENTIALS",
  "message": "이메일 또는 비밀번호가 올바르지 않습니다."
}
```

**프론트엔드 처리:**
- 에러 메시지를 사용자에게 표시
- 계정 존재 여부를 노출하지 않도록 통일된 메시지 사용 (보안상 권장)

---

## 2. 로컬 회원가입

### 요청

**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "********",
  "name": "홍길동"
}
```

### 성공 응답 (200 OK)

```json
{
  "message": "회원가입이 성공적으로 완료되었습니다."
}
```

**프론트엔드 처리:**
- 성공 메시지 표시 후 로그인 페이지로 이동

### 중복 이메일 응답 (409 CONFLICT)

```json
{
  "code": "DUPLICATE_EMAIL",
  "message": "이미 가입된 이메일입니다: user@example.com"
}
```

**프론트엔드 처리:**
- 에러 메시지를 사용자에게 표시
- 로그인 페이지로 이동하거나 로그인 유도

---

## 3. OAuth 소셜 로그인

### 시작 (브라우저 리다이렉트)

사용자가 소셜 로그인 버튼을 클릭하면, 브라우저를 다음 URL로 리다이렉트:

- **Google:** `/oauth2/authorization/google`
- **Kakao:** `/oauth2/authorization/kakao`

> ⚠️ **중요:** 이 URL은 백엔드 서버의 절대 경로입니다.
> 예: `https://api.taba-postura.com/oauth2/authorization/google`

### 성공 시 리다이렉트

백엔드가 프론트엔드 Redirect URI로 리다이렉트하며 쿼리 파라미터로 토큰 전달:

```
https://taba-postura.com/oauth/redirect?accessToken=...&refreshToken=...
```

**프론트엔드 처리 (`/oauth/redirect` 페이지):**
```typescript
const params = new URLSearchParams(window.location.search);
const accessToken = params.get("accessToken");
const refreshToken = params.get("refreshToken");

if (accessToken && refreshToken) {
  // 토큰 저장
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  
  // URL에서 토큰 제거 (보안)
  window.history.replaceState({}, '', window.location.pathname);
  
  // 메인 페이지로 이동
  navigate("/monitor", { replace: true });
}
```

### 실패 시 리다이렉트

백엔드가 프론트엔드 Redirect URI로 리다이렉트하며 쿼리 파라미터로 에러 정보 전달:

```
https://taba-postura.com/oauth/redirect?error=...&message=...&provider=...
```

#### 주요 실패 케이스: `provider_mismatch`

**쿼리 파라미터:**
- `error=provider_mismatch`
- `message=이미 가입된 이메일입니다. 기존 로그인 방식(KAKAO)으로 로그인해 주세요.`
- `provider=google` (또는 `kakao`)

**프론트엔드 처리:**
```typescript
const params = new URLSearchParams(window.location.search);
const error = params.get("error");
const message = params.get("message");
const provider = params.get("provider");

if (error === "provider_mismatch") {
  // 토큰 저장하지 않음
  // 에러 메시지를 로컬 스토리지에 임시 저장
  localStorage.setItem("oauth_error", JSON.stringify({
    type: "provider_mismatch",
    message: decodeURIComponent(message || "이미 가입된 이메일입니다. 기존 로그인 방식으로 로그인해 주세요."),
    provider: provider
  }));
  
  // URL 정리
  window.history.replaceState({}, '', window.location.pathname);
  
  // 로그인 페이지로 이동
  navigate("/login", { replace: true });
}
```

**로그인 페이지에서 에러 표시:**
```typescript
useEffect(() => {
  const oauthErrorStr = localStorage.getItem('oauth_error');
  if (oauthErrorStr) {
    const error = JSON.parse(oauthErrorStr);
    // 토스트/모달로 에러 메시지 표시
    showToast(error.message);
    localStorage.removeItem('oauth_error');
  }
}, []);
```

---

## 4. 토큰 관리

### 토큰 저장

- **저장 위치:** `localStorage`
- **키 이름:**
  - `accessToken`
  - `refreshToken`

### API 요청 시 토큰 사용

모든 인증이 필요한 API 요청에 다음 헤더 포함:

```
Authorization: Bearer <accessToken>
```

### 토큰 갱신 (Refresh)

**Endpoint:** `POST /api/auth/reissue`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**성공 응답 (200 OK):**
```json
{
  "accessToken": "새로운 accessToken",
  "refreshToken": "새로운 refreshToken",
  "tokenType": "Bearer"
}
```

**프론트엔드 처리:**
- `accessToken` 만료 시 (401 응답) 자동으로 `reissue` API 호출
- 새로 받은 토큰으로 원래 요청 재시도
- 새 토큰을 localStorage에 저장

**권장 구현 (API 인터셉터):**
```typescript
// axios 인터셉터 예시
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 401 에러이고 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // 로그인 페이지로 이동
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      try {
        // 토큰 갱신
        const response = await reissueTokenApi(refreshToken);
        
        // 새 토큰으로 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 갱신 실패 시 로그아웃 처리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

---

## 5. 에러 처리

### 에러 응답 형식

백엔드는 모든 에러를 다음 형식으로 반환합니다:

```json
{
  "code": "ERROR_CODE",
  "message": "사용자에게 표시할 메시지"
}
```

### 주요 에러 코드

| HTTP 상태 | 에러 코드 | 설명 |
|----------|----------|------|
| 401 | `BAD_CREDENTIALS` | 로그인 정보 불일치 |
| 409 | `DUPLICATE_EMAIL` | 중복 이메일 (회원가입) |
| - | `provider_mismatch` | OAuth 프로바이더 불일치 (쿼리 파라미터) |

### 에러 처리 원칙

1. **사용자 친화적 메시지 표시:** 백엔드에서 제공하는 `message` 필드를 그대로 사용
2. **보안 고려:** 계정 존재 여부를 노출하지 않도록 통일된 메시지 사용
3. **명확한 안내:** `provider_mismatch` 에러 시 기존 로그인 방식 안내

---

## 6. 중요 사항

### ✅ 필수 확인 사항

1. **OAuth Redirect URI 설정**
   - 백엔드의 `AppProperties.oauth2.authorizedRedirectUri` 값이 프론트엔드 라우팅 경로와 일치해야 합니다.
   - 예: `https://taba-postura.com/oauth/redirect`
   - 해당 경로가 React Router에 등록되어 있어야 합니다.

2. **토큰 저장 규칙**
   - 성공 시에만 토큰 저장
   - 실패 시 (`provider_mismatch` 등) 토큰 저장하지 않음
   - URL에서 토큰 제거 (보안)

3. **API 요청 헤더**
   - 모든 인증 필요한 API에 `Authorization: Bearer <accessToken>` 헤더 포함
   - 토큰 만료 시 자동 갱신 로직 구현

### 🔒 보안 고려사항

- 토큰은 `localStorage`에 저장 (XSS 공격에 취약할 수 있으나, 현재 구조에서는 적절)
- URL에 토큰이 남지 않도록 `window.history.replaceState()` 사용
- HTTPS 사용 필수 (프로덕션)

### 📝 현재 구현 상태 (2024년 기준)

프론트엔드에서 이미 구현된 부분:
- ✅ OAuth 리다이렉트 페이지 (`/oauth/redirect`) - `OAuthRedirectPage.tsx`
- ✅ 로그인 폼 및 OAuth 에러 처리 - `LoginForm.tsx`
- ✅ 회원가입 폼 및 409 에러 처리 - `SignupForm.tsx`
- ✅ 토큰 저장 로직 - `auth.ts`, `api.ts`
- ✅ API 인터셉터에서 토큰 자동 갱신 로직 - `api.ts` (완벽 구현됨)
- ✅ 에러 응답 처리 - `message` 필드 활용 중

**구현 상세:**
1. **토큰 자동 갱신**: `api.ts`의 Response Interceptor에서 401 에러 시 자동으로 `/api/auth/reissue` 호출 후 원래 요청 재시도
2. **OAuth 에러 처리**: `provider_mismatch` 케이스를 포함한 모든 OAuth 에러를 로컬 스토리지에 저장 후 로그인 페이지에서 표시
3. **회원가입 409 처리**: `SignupForm.tsx`에서 409 응답의 `message` 필드를 사용자에게 표시

**추가 개선 가능 사항 (선택):**
- 에러 응답의 `code` 필드도 활용하여 더 세밀한 에러 처리 가능 (현재는 `message`만 사용)

---

## 📞 문의

구현 중 문제가 발생하거나 명확하지 않은 부분이 있으면 백엔드 개발자에게 문의하세요.

---

**최종 업데이트:** 2024년 (백엔드 인증 정책 정리 완료 기준)

