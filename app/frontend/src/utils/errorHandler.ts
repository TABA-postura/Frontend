/**
 * 전역 에러 핸들러
 * Chrome 확장 프로그램이나 기타 외부 요인으로 인한 에러를 필터링
 */

/**
 * 무시해도 되는 에러인지 확인
 */
function isIgnorableError(error: Error | string | unknown): boolean {
  // 에러 메시지 추출
  let errorMessage = '';
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message);
  } else {
    errorMessage = String(error);
  }
  
  // Chrome 확장 프로그램 관련 에러 (무시 가능)
  const ignorablePatterns = [
    /message channel closed/i,
    /asynchronous response/i,
    /Extension context invalidated/i,
    /Receiving end does not exist/i,
    /Could not establish connection/i,
    /A listener indicated an asynchronous response/i,
    /but the message channel closed/i,
    // 이미지 로딩 실패는 이미 컴포넌트에서 처리하므로 무시
    /Failed to load resource/i,
    /The resource.*could not be loaded/i,
    /img.*error/i,
  ];

  return ignorablePatterns.some(pattern => pattern.test(errorMessage));
}

/**
 * 전역 에러 핸들러 설정
 */
export function setupGlobalErrorHandler(): void {
  // Unhandled Promise Rejection 핸들러
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    
    // 무시해도 되는 에러는 조용히 무시
    if (isIgnorableError(error)) {
      event.preventDefault(); // 에러 전파 방지
      event.stopPropagation(); // 이벤트 전파 중지
      return;
    }

    // 실제 에러는 로깅
    console.error('[Unhandled Promise Rejection]', error);
  });

  // 전역 에러 핸들러
  window.addEventListener('error', (event) => {
    const error = event.error || event.message;
    
    // 무시해도 되는 에러는 조용히 무시
    if (isIgnorableError(error)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // 실제 에러는 로깅
    console.error('[Global Error]', error);
  }, true); // capture phase에서도 처리
}

