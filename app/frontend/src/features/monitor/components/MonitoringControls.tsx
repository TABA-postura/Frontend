import './MonitoringControls.css';
import type { SessionStatus, PostureSessionTimes } from '../types';

export type MonitoringControlsProps = {
  status: SessionStatus;
  times: PostureSessionTimes;
  onStart: () => void | Promise<void>;
  onPause: () => void | Promise<void>;
  onResume: () => void | Promise<void>;
  onEnd: () => void;
  canStart?: boolean; // 웹캠 에러 등으로 시작 불가능한 경우
};

function MonitoringControls({
  status,
  times,
  onStart,
  onPause,
  onResume,
  onEnd,
  canStart = true,
}: MonitoringControlsProps) {
  // 시간 포맷팅 (HH:MM AM/PM) - 한국 시간(서울, UTC+9) 기준으로 표시
  // 서버가 ap-southeast-2(호주 시드니, UTC+10)에 있어서 시간대 변환이 필요함
  // 서버에서 받은 시간을 한국 시간대로 정확히 변환
  const formatTime = (date: Date | null): string => {
    if (!date) return '';
    
    // 서버에서 받은 시간을 한국 시간대(Asia/Seoul, UTC+9)로 변환하여 표시
    // Intl.DateTimeFormat을 사용하여 정확한 시간대 변환 및 AM/PM 표시
    const formatter = new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // AM/PM 표시
    });
    
    return formatter.format(date);
  };

  // ✅ 조건식 정답 코드 (이걸로 통일)
  const showStart = status === 'IDLE' || status === 'ENDED';
  const showPause = status === 'RUNNING';
  const showResume = status === 'PAUSED';
  const showEnd = status === 'RUNNING' || status === 'PAUSED';

  return (
    <div className="monitoring-controls">
      <div className="monitoring-controls__header">
        <h2 className="monitoring-controls__title">모니터링 설정</h2>
        <p className="monitoring-controls__description">
          모니터링 시작 후 자동으로 시작 시간이 기록됩니다.
        </p>
      </div>

      {/* 시작 시간: 세션이 시작된 후 (RUNNING, PAUSED, ENDED 상태)에만 표시 */}
      {(status === 'RUNNING' || status === 'PAUSED' || status === 'ENDED') && times.startTime && (
        <div className="monitoring-controls__times">
          <div className="monitoring-controls__time-item">
            <span className="monitoring-controls__time-label">시작 시간:</span>
            <span className="monitoring-controls__time-value">{formatTime(times.startTime)}</span>
          </div>
          {/* 종료 시간: 세션이 종료된 경우에만 표시 */}
          {status === 'ENDED' && times.endTime && (
            <div className="monitoring-controls__time-item">
              <span className="monitoring-controls__time-label">종료 시간:</span>
              <span className="monitoring-controls__time-value">{formatTime(times.endTime)}</span>
            </div>
          )}
        </div>
      )}

      <div className="monitoring-controls__buttons">
        {showStart && (
          <button
            className="monitoring-controls__button monitoring-controls__button--primary"
            onClick={() => {
              const result = onStart();
              if (result instanceof Promise) {
                result.catch((error) => {
                  console.error('모니터링 시작 실패:', error);
                });
              }
            }}
            disabled={!canStart}
            type="button"
          >
            모니터링 시작
          </button>
        )}

        {showPause && (
          <button
            className="monitoring-controls__button monitoring-controls__button--secondary"
            onClick={() => {
              const result = onPause();
              if (result instanceof Promise) {
                result.catch((error) => {
                  console.error('일시정지 실패:', error);
                });
              }
            }}
            type="button"
          >
            일시정지
          </button>
        )}

        {showResume && (
          <button
            className="monitoring-controls__button monitoring-controls__button--primary"
            onClick={() => {
              const result = onResume();
              if (result instanceof Promise) {
                result.catch((error) => {
                  console.error('재개 실패:', error);
                });
              }
            }}
            type="button"
          >
            재개
          </button>
        )}

        {showEnd && (
          <button
            className="monitoring-controls__button monitoring-controls__button--danger"
            onClick={onEnd}
            type="button"
          >
            종료
          </button>
        )}
      </div>
    </div>
  );
}

export default MonitoringControls;
