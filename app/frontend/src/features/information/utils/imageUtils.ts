/**
 * 이미지 URL 처리 유틸리티
 * 백엔드 정적 리소스에서 제공하는 이미지 경로를 완전한 URL로 변환
 * 
 * 참고: 정보 제공 이미지는 S3가 아닌 백엔드 서버의 정적 리소스로 제공됨
 */

/**
 * 이미지 URL을 완전한 URL로 변환
 * 
 * @param imageUrl - 백엔드에서 받은 이미지 경로 (URL 또는 상대경로)
 * @returns 완전한 이미지 URL
 * 
 * @example
 * resolveImageUrl('https://example.com/image.png') 
 * // => 'https://example.com/image.png'
 * 
 * resolveImageUrl('/images/content/test.png')
 * // => 'https://api.taba-postura.com/images/content/test.png' (백엔드 정적 리소스)
 */
export function resolveImageUrl(imageUrl?: string): string {
  // 값이 없으면 빈 문자열 반환
  if (!imageUrl) {
    if (import.meta.env.DEV) {
      console.warn('[Image Utils] imageUrl이 없습니다.');
    }
    return '';
  }

  // 이미 완전한 URL인 경우 (http:// 또는 https://로 시작)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    if (import.meta.env.DEV) {
      console.log('[Image Utils] 완전한 URL 사용:', imageUrl);
    }
    return imageUrl;
  }

  // 백엔드 정적 리소스에서 이미지를 제공하므로, /images/로 시작하는 경로 처리
  // 백엔드 SecurityConfig에서 /images/** 경로가 permitAll로 설정되어 있음
  // 백엔드 서버의 resources/static/images/content/ 폴더에 이미지 파일이 저장되어 있음
  
  // 개발 환경: Vite 프록시를 통해 상대 경로 사용 (CORS 문제 해결)
  // 프로덕션 환경: API base URL을 붙여서 사용
  const isDevelopment = import.meta.env.DEV;
  
  if (isDevelopment) {
    // 개발 환경에서는 Vite 프록시를 통해 상대 경로 사용
    // vite.config.ts에서 /images 경로를 백엔드로 프록시하도록 설정됨
    if (import.meta.env.DEV) {
      console.log('[Image Utils] 개발 환경: 상대 경로 사용 (Vite 프록시):', imageUrl);
    }
    return imageUrl;
  }
  
  // 프로덕션 환경: API base URL을 붙여서 사용
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  
  if (baseUrl) {
    // baseUrl 끝에 슬래시가 있으면 제거
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
    // imageUrl 앞에 슬래시가 있으면 그대로, 없으면 추가
    const cleanImageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    const resolvedUrl = `${cleanBaseUrl}${cleanImageUrl}`;
    
    console.log('[Image Utils] 프로덕션: 백엔드 정적 리소스 이미지 URL 조합:', {
      original: imageUrl,
      baseUrl: cleanBaseUrl,
      resolved: resolvedUrl,
    });
    
    return resolvedUrl;
  }

  // baseUrl이 없으면 상대 경로 그대로 반환 (프록시 환경)
  // CloudFront 프록시를 통해 /images/... 경로로 직접 접근 가능
  console.log('[Image Utils] 상대 경로 사용 (프록시 환경):', imageUrl);
  return imageUrl;
}

