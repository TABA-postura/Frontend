import './LiveStatsCard.css';
import type { LiveStats } from '../types';

export type LiveStatsCardProps = {
  liveStats: LiveStats;
};

function LiveStatsCard({ liveStats }: LiveStatsCardProps) {
  // mm:ss 포맷팅
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="live-stats-card">
      <div className="live-stats-card__header">
        <h2 className="live-stats-card__title">실시간 통계</h2>
        <p className="live-stats-card__description">
          모니터링을 시작하면 통계가 실시간으로 갱신됩니다.
        </p>
      </div>

      <div className="live-stats-card__stats">
        <div className="live-stats-card__stat-item">
          <span className="live-stats-card__stat-label">분석 시간</span>
          <span className="live-stats-card__stat-value">{formatTime(liveStats.elapsedSeconds)}</span>
        </div>

        <div className="live-stats-card__stat-item">
          <span className="live-stats-card__stat-label">바른 자세 유지율</span>
          <span className="live-stats-card__stat-value">{liveStats.goodPostureRate}%</span>
        </div>

        <div className="live-stats-card__stat-item">
          <span className="live-stats-card__stat-label">경고 횟수</span>
          <span className="live-stats-card__stat-value">{liveStats.warningCount}회</span>
        </div>
      </div>
    </div>
  );
}

export default LiveStatsCard;
