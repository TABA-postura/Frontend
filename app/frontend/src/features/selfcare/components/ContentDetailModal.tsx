/**
 * src/features/selfcare/components/ContentDetailModal.tsx
 * 
 * 콘텐츠 상세 모달 컴포넌트
 * contentText는 줄바꿈 유지 (white-space: pre-line)
 */

import { useEffect } from 'react';
import { useContentDetail } from '../hooks/useContent';
import './ContentDetailModal.css';

interface ContentDetailModalProps {
  guideId: number | null;
  onClose: () => void;
}

const DEFAULT_IMAGE_URL = '/images/default-posture.png';

export default function ContentDetailModal({ guideId, onClose }: ContentDetailModalProps) {
  const { data, loading, error } = useContentDetail(guideId);

  useEffect(() => {
    if (guideId) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [guideId]);

  if (!guideId) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="content-detail-modal-backdrop" onClick={handleBackdropClick}>
      <div className="content-detail-modal">
        <button className="content-detail-modal-close" onClick={onClose}>
          ✕
        </button>

        {loading && (
          <div className="content-detail-modal-loading">
            <div className="spinner"></div>
            <p>로딩 중...</p>
          </div>
        )}

        {error && (
          <div className="content-detail-modal-error">
            <p>⚠️ {error}</p>
            <button onClick={onClose}>닫기</button>
          </div>
        )}

        {data && (
          <>
            <div className="content-detail-modal-image">
              <img
                src={data.imageUrl || DEFAULT_IMAGE_URL}
                alt={data.title}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = DEFAULT_IMAGE_URL;
                }}
              />
            </div>

            <div className="content-detail-modal-content">
              <div className="content-detail-modal-header">
                <h2>{data.title}</h2>
                <div className="content-detail-modal-meta">
                  {data.category && <span className="category-badge">{data.category}</span>}
                  <span className="posture-badge">{data.posture}</span>
                  <span className="part-badge">{data.relatedPart}</span>
                </div>
              </div>

              <div className="content-detail-modal-text">
                {data.contentText}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

