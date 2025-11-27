import './WebcamPanel.css';
import type { SessionStatus } from '../types';

export type WebcamPanelProps = {
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: SessionStatus;
};

function WebcamPanel({
  isActive,
  isLoading,
  error,
  videoRef,
  status,
}: WebcamPanelProps) {
  // 상태별 오버레이 메시지 결정
  const getOverlayMessage = () => {
    if (isLoading) return null;
    if (error) return null;
    if (!isActive) {
      if (status === 'IDLE') return '모니터링 대기 중';
      if (status === 'RUNNING') return '웹캠 비활성화 상태입니다';
      if (status === 'PAUSED') return '일시정지됨 – 재개 버튼을 눌러주세요';
      if (status === 'ENDED') return '모니터링이 종료되었습니다';
    }
    return null;
  };

  const overlayMessage = getOverlayMessage();
  
  // PAUSED 상태일 때는 isActive가 true여도 오버레이 표시
  const showPausedOverlay = status === 'PAUSED' && isActive && !isLoading && !error;

  return (
    <div className="webcam-panel">
      <div className="webcam-panel__header">
        <h2 className="webcam-panel__title">실시간 웹캠 피드</h2>
        <p className="webcam-panel__description">설정을 완료하고 모니터링을 시작하세요</p>
      </div>

      <div className="webcam-panel__video-wrapper">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="webcam-panel__video"
        />

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="webcam-panel__overlay webcam-panel__overlay--loading">
            <div className="webcam-panel__loading-spinner"></div>
            <p className="webcam-panel__loading-text">웹캠 연결 중…</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="webcam-panel__overlay webcam-panel__overlay--error">
            <div className="webcam-panel__error-content">
              <div className="webcam-panel__error-icon">⚠️</div>
              <p className="webcam-panel__error-message">{error}</p>
            </div>
          </div>
        )}

        {/* 상태별 오버레이 (에러/로딩 제외) */}
        {!isLoading && !error && overlayMessage && (
          <div className="webcam-panel__overlay webcam-panel__overlay--status">
            <p className="webcam-panel__status-text">{overlayMessage}</p>
          </div>
        )}

        {/* PAUSED 상태 오버레이 (웹캠이 활성화되어 있을 때) */}
        {showPausedOverlay && (
          <div className="webcam-panel__overlay webcam-panel__overlay--paused">
            <p className="webcam-panel__paused-title">일시정지됨</p>
            <span className="webcam-panel__paused-hint">재개 버튼을 눌러주세요</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default WebcamPanel;
