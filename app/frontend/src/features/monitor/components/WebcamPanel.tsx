import './WebcamPanel.css';
import type { SessionStatus, FeedbackItem } from '../types';

export type WebcamPanelProps = {
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: SessionStatus;
  feedback: string | null;
  feedbackList?: FeedbackItem[];
  isPlayingIntroVideo?: boolean;
  introVideoRef?: React.RefObject<HTMLVideoElement | null>;
  onIntroVideoEnd?: () => void;
};

function WebcamPanel({
  isActive,
  isLoading,
  error,
  videoRef,
  status,
  feedback,
  feedbackList = [],
  isPlayingIntroVideo = false,
  introVideoRef,
  onIntroVideoEnd,
}: WebcamPanelProps) {
  // 상태별 오버레이 메시지 결정
  const getOverlayMessage = () => {
    if (isLoading) return null;
    if (error) return null;
    if (!isActive) {
      if (status === 'IDLE') return <span className="webcam-panel__waiting-text">모니터링 대기 중...</span>;
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
      </div>

      {/* 실시간 자세 피드백 */}
      <div className="webcam-panel__feedback">
        <div className={`webcam-panel__feedback-content ${
          status === 'RUNNING' 
            ? (feedbackList.length > 0 && feedbackList[0]?.type === 'WARN' 
                ? 'webcam-panel__feedback-content--warn' 
                : 'webcam-panel__feedback-content--good')
            : 'webcam-panel__feedback-content--idle'
        }`}>
          {status === 'RUNNING' ? (
            feedbackList.length > 0 ? (
              <div className="webcam-panel__feedback-list">
                {feedbackList.slice(0, 3).map((item, index) => (
                  <p
                    key={index}
                    className={`webcam-panel__feedback-message webcam-panel__feedback-message--${item.type === 'WARN' ? 'warn' : 'info'}`}
                  >
                    {item.type === 'WARN' ? '⚠️' : '✅'} {item.message}
                  </p>
                ))}
              </div>
            ) : (
              <p className="webcam-panel__feedback-message webcam-panel__feedback-message--info">
                ✅ 바른 자세를 유지하고 있습니다!
              </p>
            )
          ) : feedback ? (
            <p className="webcam-panel__feedback-message">{feedback}</p>
          ) : (
            <p className="webcam-panel__feedback-empty">
              아직 피드백이 없습니다. 모니터링을 시작해주세요.
            </p>
          )}
        </div>
      </div>

      <div className="webcam-panel__video-wrapper">
        {/* 인트로 동영상 - 항상 렌더링하되 상태에 따라 보이기/숨기기 */}
        {introVideoRef && (
          <video
            ref={introVideoRef}
            src="/videos/postura_monitor1.mp4"
            autoPlay={false}
            muted
            playsInline
            className={`webcam-panel__video webcam-panel__intro-video ${isPlayingIntroVideo ? 'webcam-panel__intro-video--visible' : 'webcam-panel__intro-video--hidden'}`}
            onEnded={() => {
              if (onIntroVideoEnd) {
                onIntroVideoEnd();
              }
            }}
            onError={(e) => {
              console.error('인트로 동영상 재생 실패:', e);
              if (onIntroVideoEnd) {
                onIntroVideoEnd();
              }
            }}
          />
        )}
        
        {/* 웹캠 비디오 */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`webcam-panel__video ${isPlayingIntroVideo ? 'webcam-panel__video--hidden' : ''}`}
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

        {/* 상태별 오버레이 (에러/로딩 제외, 인트로 동영상 재생 중이 아닐 때만) */}
        {!isLoading && !error && !isPlayingIntroVideo && overlayMessage && (
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
