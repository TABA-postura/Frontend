/**
 * src/features/selfcare/components/PostureGuideCard.tsx
 * 
 * 자세 가이드 카드 컴포넌트
 * imageUrl이 null이면 기본 이미지 표시
 */

import './PostureGuideCard.css';
import type { ContentItem } from '../../../types/content';

interface PostureGuideCardProps {
  item: ContentItem;
  onClick?: (item: ContentItem) => void;
}

const DEFAULT_IMAGE_URL = '/images/default-posture.png';

export default function PostureGuideCard({ item, onClick }: PostureGuideCardProps) {
  const handleClick = () => {
    onClick?.(item);
  };

  return (
    <div className="posture-guide-card" onClick={handleClick}>
      <div className="posture-guide-card-image">
        <img
          src={item.imageUrl || DEFAULT_IMAGE_URL}
          alt={item.title}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = DEFAULT_IMAGE_URL;
          }}
        />
      </div>
      <div className="posture-guide-card-content">
        <h3 className="posture-guide-card-title">{item.title}</h3>
        <p className="posture-guide-card-posture">{item.posture}</p>
        <p className="posture-guide-card-part">{item.relatedPart}</p>
      </div>
    </div>
  );
}

