import './AccumulatedPostureCard.css';
import type { PostureIssueStat } from '../types';

export type AccumulatedPostureCardProps = {
  issues: PostureIssueStat[];
};

function AccumulatedPostureCard({ issues }: AccumulatedPostureCardProps) {
  // 가장 빈번한 문제 찾기
  const mostFrequentIssue = issues.reduce(
    (max, issue) => (issue.count > max.count ? issue : max),
    issues[0] || { type: 'FORWARD_HEAD', label: '', count: 0 }
  );

  const hasData = issues.some((issue) => issue.count > 0);

  return (
    <div className="accumulated-posture-card">
      <div className="accumulated-posture-card__header">
        <h2 className="accumulated-posture-card__title">누적 자세 데이터</h2>
      </div>

      <div className="accumulated-posture-card__most-frequent">
        <span className="accumulated-posture-card__most-frequent-label">가장 빈번한 문제:</span>
        <span className="accumulated-posture-card__most-frequent-value">
          {hasData ? mostFrequentIssue.label : '데이터 없음'}
        </span>
      </div>

      <div className="accumulated-posture-card__issues">
        <h3 className="accumulated-posture-card__issues-title">문제 유형별 발생 횟수</h3>
        <div className="accumulated-posture-card__issues-list">
          {issues.map((issue) => (
            <div key={issue.type} className="accumulated-posture-card__issue-item">
              <span className="accumulated-posture-card__issue-label">{issue.label}</span>
              <span className="accumulated-posture-card__issue-count">{issue.count}회</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AccumulatedPostureCard;

