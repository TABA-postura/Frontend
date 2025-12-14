/**
 * 보안 관련 유틸리티 함수
 */

/**
 * HTTPS 연결이 필요한지 확인
 * 웹캠 등 보안 컨텍스트가 필요한 기능 사용 시 필요
 */
export function isSecureContext(): boolean {
  // window.isSecureContext는 브라우저가 자동으로 설정
  // HTTPS 또는 localhost/127.0.0.1에서만 true
  return (
    window.isSecureContext ||
    location.protocol === 'https:' ||
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.hostname === '[::1]'
  );
}

/**
 * HTTPS로 리다이렉트 (프로덕션 환경에서만)
 */
export function redirectToHttps(): void {
  // 개발 환경에서는 리다이렉트하지 않음
  if (
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.hostname === '[::1]'
  ) {
    return;
  }

  // HTTP로 접속 중이면 HTTPS로 리다이렉트
  if (location.protocol === 'http:') {
    const httpsUrl = location.href.replace('http:', 'https:');
    console.warn('HTTPS 연결로 리다이렉트합니다:', httpsUrl);
    window.location.replace(httpsUrl);
  }
}

/**
 * 웹캠 사용 가능 여부 확인
 * 주의: 이 함수는 HTTPS 체크를 포함하지만, 
 * useWebcam에서는 먼저 isSecureContext()를 별도로 체크하므로
 * 이 함수는 HTTPS가 이미 확인된 상태에서만 호출되어야 함
 */
export function isWebcamSupported(): boolean {
  // MediaDevices API 지원 확인
  if (
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  ) {
    return true;
  }

  // 레거시 브라우저 지원 확인
  const nav = navigator as any;
  const hasLegacySupport =
    nav.getUserMedia ||
    nav.webkitGetUserMedia ||
    nav.mozGetUserMedia;

  return !!hasLegacySupport;
}

/**
 * 웹캠 지원 여부에 따른 에러 메시지 반환
 */
export function getWebcamErrorMessage(): string {
  if (!isSecureContext()) {
    return '웹캠을 사용하려면 HTTPS 연결이 필요합니다. HTTPS URL로 접속해주세요.';
  }

  if (!isWebcamSupported()) {
    return '이 브라우저에서는 웹캠을 지원하지 않습니다. Chrome, Firefox, Edge 등의 최신 브라우저를 사용해주세요.';
  }

  return '웹캠에 접근할 수 없습니다. 브라우저 권한을 확인해주세요.';
}

