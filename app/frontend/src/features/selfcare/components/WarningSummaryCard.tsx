import './WarningSummaryCard.css';

interface WarningSummaryCardProps {
  todayCount: number;
  weekCount: number;
}

const WarningSummaryCard = ({ todayCount, weekCount }: WarningSummaryCardProps) => {
  return (
    <div className="warning-summary-card">
      <div className="warning-summary-card-header">
        <span className="warning-icon">⚠️</span>
        <h3 className="warning-summary-card-title">경고 횟수</h3>
      </div>
      <div className="warning-summary-card-content">
        <div className="warning-today">
          <span className="warning-label">오늘</span>
          <span className="warning-value">{todayCount}회</span>
        </div>
        <div className="warning-week">
          <span className="warning-label">이번 주</span>
          <span className="warning-value">{weekCount}회</span>
        </div>
      </div>
    </div>
  );
};

export default WarningSummaryCard;
