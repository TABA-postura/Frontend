import { useState, useEffect } from 'react';
import './GuideTour.css';

interface GuideStep {
  target: string; // CSS selector
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const GUIDE_STEPS: GuideStep[] = [
  {
    target: '.monitoring-controls',
    title: '모니터링 설정',
    description: '모니터링 시작 버튼을 눌러 자세 분석을 시작하세요. 시작 후 자동으로 시간이 기록됩니다.',
    position: 'right',
  },
  {
    target: '.live-stats-card',
    title: '실시간 통계',
    description: '분석 시간, 바른 자세 유지율, 경고 횟수를 실시간으로 확인할 수 있습니다.',
    position: 'right',
  },
  {
    target: '.webcam-panel',
    title: '실시간 웹캠 피드',
    description: '웹캠을 통해 자세를 실시간으로 분석합니다. 피드백 창의 색상으로 현재 자세 상태를 확인하세요. (초록: 정상, 빨강: 교정 필요)',
    position: 'right',
  },
  {
    target: '.accumulated-posture-card',
    title: '누적 자세 데이터',
    description: '가장 빈번하게 발생하는 자세 문제와 유형별 발생 횟수를 확인할 수 있습니다.',
    position: 'left',
  },
];

interface GuideTourProps {
  onComplete: () => void;
}

function GuideTour({ onComplete }: GuideTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const step = GUIDE_STEPS[currentStep];
    const targetElement = document.querySelector(step.target);
    
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setTargetRect(rect);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < GUIDE_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = GUIDE_STEPS[currentStep];

  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) return {};

    const padding = 16;
    const tooltipWidth = 280;
    const tooltipHeight = 200;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let style: React.CSSProperties = {};

    switch (step.position) {
      case 'right':
        style = {
          top: Math.max(10, Math.min(targetRect.top, viewportHeight - tooltipHeight - 10)),
          left: Math.min(targetRect.right + padding, viewportWidth - tooltipWidth - 10),
        };
        break;
      case 'left':
        style = {
          top: Math.max(10, Math.min(targetRect.top, viewportHeight - tooltipHeight - 10)),
          left: Math.max(10, targetRect.left - tooltipWidth - padding),
        };
        break;
      case 'bottom':
        style = {
          top: Math.min(targetRect.bottom + padding, viewportHeight - tooltipHeight - 10),
          left: Math.max(10, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, viewportWidth - tooltipWidth - 10)),
        };
        break;
      case 'top':
        style = {
          top: Math.max(10, targetRect.top - tooltipHeight - padding),
          left: Math.max(10, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, viewportWidth - tooltipWidth - 10)),
        };
        break;
    }

    return style;
  };

  return (
    <div className="guide-tour">
      {/* 배경 오버레이 */}
      <div className="guide-tour__overlay" onClick={handleSkip} />

      {/* 타겟 하이라이트 */}
      {targetRect && (
        <div
          className="guide-tour__highlight"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* 툴팁 */}
      <div className="guide-tour__tooltip" style={getTooltipStyle()}>
        <div className="guide-tour__tooltip-header">
          <span className="guide-tour__step-indicator">
            {currentStep + 1} / {GUIDE_STEPS.length}
          </span>
          <h3 className="guide-tour__tooltip-title">{step.title}</h3>
        </div>
        <p className="guide-tour__tooltip-description">{step.description}</p>
        <div className="guide-tour__tooltip-actions">
          <button className="guide-tour__skip-btn" onClick={handleSkip}>
            건너뛰기
          </button>
          <button className="guide-tour__next-btn" onClick={handleNext}>
            {currentStep < GUIDE_STEPS.length - 1 ? '다음' : '완료'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuideTour;
