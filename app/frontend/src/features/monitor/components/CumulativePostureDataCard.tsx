import './CumulativePostureDataCard.css';

export type CumulativePostureDataCardProps = {
  problemStats: { problem: string; count: number }[];
};

function CumulativePostureDataCard({ problemStats }: CumulativePostureDataCardProps) {
  // Sort by count descending
  const sortedStats = [...problemStats].sort((a, b) => b.count - a.count);

  return (
    <div className="cumulative-posture-data-card">
      <div className="cumulative-posture-data-card__header">
        <h2 className="cumulative-posture-data-card__title">누적 자세 데이터</h2>
        <p className="cumulative-posture-data-card__subtitle">스트레칭 추천에 활용됩니다</p>
      </div>

      <div className="cumulative-posture-data-card__list">
        {sortedStats.length > 0 ? (
          sortedStats.map((stat, index) => (
            <div key={index} className="cumulative-posture-data-card__item">
              <span className="cumulative-posture-data-card__problem">{stat.problem}</span>
              <span className="cumulative-posture-data-card__count">{stat.count}회</span>
            </div>
          ))
        ) : (
          <div className="cumulative-posture-data-card__empty">
            아직 데이터가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}

export default CumulativePostureDataCard;

