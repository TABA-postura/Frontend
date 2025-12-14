import './ProblemCard.css';

interface ProblemCardProps {
  problemName: string;
  count: number;
}

const ProblemCard = ({ problemName, count }: ProblemCardProps) => {
  return (
    <div className="problem-card">
      <div className="problem-card-header">
        <span className="problem-icon">🎯</span>
        <h3 className="problem-card-title">가장 많이 발생한 문제</h3>
      </div>
      <div className="problem-card-content">
        <div className="problem-name">{problemName}</div>
        <div className="problem-count">{count}회 발생</div>
      </div>
    </div>
  );
};

export default ProblemCard;
