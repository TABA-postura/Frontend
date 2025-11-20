import './PostureFeedbackPanel.css';

export type PostureFeedbackPanelProps = {
  feedback: string | null;
};

function PostureFeedbackPanel({ feedback }: PostureFeedbackPanelProps) {
  return (
    <div className="posture-feedback-panel">
      <h2 className="posture-feedback-panel__title">실시간 자세 피드백</h2>
      <div className="posture-feedback-panel__content">
        {feedback ? (
          <p className="posture-feedback-panel__message">{feedback}</p>
        ) : (
          <p className="posture-feedback-panel__empty">
            아직 피드백이 없습니다. 모니터링을 시작해주세요.
          </p>
        )}
      </div>
    </div>
  );
}

export default PostureFeedbackPanel;

