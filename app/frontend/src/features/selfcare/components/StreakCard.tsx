import './StreakCard.css';

interface StreakCardProps {
  days: number;
  goalRate: number;
}

const StreakCard = ({ days, goalRate }: StreakCardProps) => {
  return (
    <div className="streak-card">
      <div className="streak-card-header">
        <span className="streak-icon">🏆</span>
        <h3 className="streak-card-title">연속 목표 달성 일수</h3>
      </div>
      <div className="streak-card-content">
        <div className="streak-days">{days}일</div>
        <div className="streak-goal">목표: {goalRate}% 이상 유지</div>
      </div>
    </div>
  );
};

export default StreakCard;
