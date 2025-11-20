import './RealtimeFeedbackCard.css';

export type FeedbackItem = {
  type: 'WARN' | 'INFO';
  title: string;
  message: string;
};

export type RealtimeFeedbackCardProps = {
  feedbackList: FeedbackItem[];
};

function RealtimeFeedbackCard({ feedbackList }: RealtimeFeedbackCardProps) {
  return (
    <div className="realtime-feedback-card">
      <div className="realtime-feedback-card__header">
        <h2 className="realtime-feedback-card__title">실시간 자세 피드백</h2>
      </div>

      <div className="realtime-feedback-card__list">
        {feedbackList.length > 0 ? (
          feedbackList.map((feedback, index) => (
            <div
              key={index}
              className={`realtime-feedback-card__item realtime-feedback-card__item--${feedback.type.toLowerCase()}`}
            >
              <div className="realtime-feedback-card__icon">
                {feedback.type === 'WARN' ? '⚠️' : 'ℹ️'}
              </div>
              <div className="realtime-feedback-card__content">
                <h3 className="realtime-feedback-card__item-title">{feedback.title}</h3>
                <p className="realtime-feedback-card__item-message">{feedback.message}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="realtime-feedback-card__empty">
            아직 피드백이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}

export default RealtimeFeedbackCard;

