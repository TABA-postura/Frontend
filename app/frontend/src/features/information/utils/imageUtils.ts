/**
 * 이미지 URL 처리 유틸리티
 * 백엔드에서 받은 이미지 경로를 완전한 URL로 변환
 */

/**
 * 이미지 URL을 완전한 URL로 변환
 * 
 * @param s3ImageUrl - 백엔드에서 받은 이미지 경로 (URL 또는 상대경로)
 * @returns 완전한 이미지 URL
 * 
 * @example
 * resolveImageUrl('https://example.com/image.png') 
 * // => 'https://example.com/image.png'
 * 
 * resolveImageUrl('/images/content/test.png')
 * // => 'https://api.taba-postura.com/images/content/test.png'
 */
export function resolveImageUrl(s3ImageUrl?: string): string {
  // 값이 없으면 빈 문자열 반환
  if (!s3ImageUrl) {
    if (import.meta.env.DEV) {
      console.warn('[Image Utils] s3ImageUrl이 없습니다.');
    }
    return '';
  }

  // 이미 완전한 URL인 경우 (http:// 또는 https://로 시작)
  if (s3ImageUrl.startsWith('http://') || s3ImageUrl.startsWith('https://')) {
    if (import.meta.env.DEV) {
      console.log('[Image Utils] 완전한 URL 사용:', s3ImageUrl);
    }
    return s3ImageUrl;
  }

  // 상대 경로인 경우 (예: /images/...)
  // VITE_API_BASE_URL을 앞에 붙여 완전한 URL로 변환
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  
  // baseUrl이 있으면 붙이고, 없으면 상대 경로 그대로 사용
  // (프로덕션에서 프록시를 사용하는 경우 상대 경로가 그대로 작동)
  if (baseUrl) {
    // baseUrl 끝에 슬래시가 있으면 제거
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
    // s3ImageUrl 앞에 슬래시가 있으면 그대로, 없으면 추가
    const cleanImageUrl = s3ImageUrl.startsWith('/') ? s3ImageUrl : `/${s3ImageUrl}`;
    const resolvedUrl = `${cleanBaseUrl}${cleanImageUrl}`;
    
    if (import.meta.env.DEV) {
      console.log('[Image Utils] URL 조합:', {
        original: s3ImageUrl,
        baseUrl: cleanBaseUrl,
        resolved: resolvedUrl,
      });
    }
    
    return resolvedUrl;
  }

  // baseUrl이 없으면 상대 경로 그대로 반환 (프록시 환경)
  if (import.meta.env.DEV) {
    console.log('[Image Utils] 상대 경로 사용 (프록시 환경):', s3ImageUrl);
  }
  return s3ImageUrl;
}

