import './MonitoringControls.css';
import type { SessionStatus, PostureSessionTimes } from '../types';

export type MonitoringControlsProps = {
  status: SessionStatus;
  times: PostureSessionTimes;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
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
  // 시간 포맷팅 (HH:MM)
  const formatTime = (date: Date | null): string => {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="monitoring-controls">
      <div className="monitoring-controls__header">
        <h2 className="monitoring-controls__title">모니터링 설정</h2>
        <p className="monitoring-controls__description">
          모니터링 시작 후 자동으로 시작 시간이 기록됩니다.
        </p>
      </div>

      {times.startTime && (
        <div className="monitoring-controls__times">
          <div className="monitoring-controls__time-item">
            <span className="monitoring-controls__time-label">시작 시간:</span>
            <span className="monitoring-controls__time-value">{formatTime(times.startTime)}</span>
          </div>
          {status === 'ENDED' && times.endTime && (
            <div className="monitoring-controls__time-item">
              <span className="monitoring-controls__time-label">종료 시간:</span>
              <span className="monitoring-controls__time-value">{formatTime(times.endTime)}</span>
            </div>
          )}
        </div>
      )}

      <div className="monitoring-controls__buttons">
        {(status === 'IDLE' || status === 'ENDED') && (
          <button
            className="monitoring-controls__button monitoring-controls__button--primary"
            onClick={onStart}
            disabled={!canStart}
            type="button"
          >
            모니터링 시작
          </button>
        )}

        {status === 'RUNNING' && (
          <>
            <button
              className="monitoring-controls__button monitoring-controls__button--secondary"
              onClick={onPause}
              type="button"
            >
              일시정지
            </button>
            <button
              className="monitoring-controls__button monitoring-controls__button--danger"
              onClick={onEnd}
              type="button"
            >
              종료
            </button>
          </>
        )}

        {status === 'PAUSED' && (
          <>
            <button
              className="monitoring-controls__button monitoring-controls__button--primary"
              onClick={onResume}
              type="button"
            >
              재개
            </button>
            <button
              className="monitoring-controls__button monitoring-controls__button--danger"
              onClick={onEnd}
              type="button"
            >
              종료
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default MonitoringControls;

