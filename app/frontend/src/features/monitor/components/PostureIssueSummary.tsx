// PostureIssueSummary.tsx

interface PostureIssueSummaryProps {
  issues?: {
    turtleNeck?: number;
    shoulderTilt?: number;
    screenDistance?: number;
    backBend?: number;
  };
}

const PostureIssueSummary = ({ 
  issues = {
    turtleNeck: 23,
    shoulderTilt: 15,
    screenDistance: 12,
    backBend: 8,
  }
}: PostureIssueSummaryProps) => {
  return (
    <div>
      <h5 className="problem-list-title">문제 유형별 누적 횟수</h5>
      
      <div className="problem-item">
        <span className="problem-name">거북목</span>
        <span className="problem-count">{issues.turtleNeck}회</span>
      </div>
      
      <div className="problem-item">
        <span className="problem-name">어깨 기울어짐</span>
        <span className="problem-count">{issues.shoulderTilt}회</span>
      </div>
      
      <div className="problem-item">
        <span className="problem-name">화면 거리 부족</span>
        <span className="problem-count">{issues.screenDistance}회</span>
      </div>
      
      <div className="problem-item">
        <span className="problem-name">등 굽음</span>
        <span className="problem-count">{issues.backBend}회</span>
      </div>
    </div>
  );
};

export default PostureIssueSummary;
