/**
 * JWT 토큰 디코딩 유틸리티
 */

interface JWTPayload {
  sub?: string; // 사용자 ID 또는 이메일
  email?: string;
  name?: string;
  username?: string;
  userId?: number;
  [key: string]: any;
}

/**
 * JWT 토큰의 payload를 디코딩합니다.
 * @param token JWT 토큰 문자열
 * @returns 디코딩된 payload 또는 null
 */
function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT는 base64url로 인코딩된 3부분으로 구성: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('[JWT] 토큰 형식이 올바르지 않습니다.');
      return null;
    }

    // payload 부분 디코딩 (base64url -> base64 변환 필요)
    const payload = parts[1];
    // base64url의 '-'와 '_'를 '+'와 '/'로 변환하고 패딩 추가
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    
    const decoded = JSON.parse(atob(padded));
    return decoded;
  } catch (error) {
    console.error('[JWT] 토큰 디코딩 실패:', error);
    return null;
  }
}

/**
 * localStorage의 accessToken에서 사용자 정보를 추출합니다.
 * @returns 사용자 정보 또는 null
 */
export function getUserFromToken(): { email: string; name?: string } | null {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    console.log('[JWT] accessToken이 없습니다.');
    return null;
  }

  const decoded = decodeJWT(token);
  
  if (!decoded) {
    console.log('[JWT] 토큰 디코딩 실패');
    return null;
  }

  console.log('[JWT] 디코딩된 토큰 payload:', decoded);

  // 사용자 정보 추출 (다양한 필드명 지원)
  const email = decoded.email || decoded.sub || decoded.username || null;
  const name = decoded.name || decoded.username || null;

  if (!email) {
    console.warn('[JWT] 이메일 정보를 찾을 수 없습니다.');
    return null;
  }

  const user = {
    email,
    name: name || undefined,
  };

  console.log('[JWT] 추출된 사용자 정보:', user);
  return user;
}

