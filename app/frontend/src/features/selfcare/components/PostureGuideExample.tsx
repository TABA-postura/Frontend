/**
 * src/features/selfcare/components/PostureGuideExample.tsx
 * 
 * 자세 가이드 목록 및 스트레칭 추천 사용 예시 컴포넌트
 * 
 * 사용 예시:
 * import PostureGuideExample from './components/PostureGuideExample';
 * 
 * <PostureGuideExample />
 */

import { useState } from 'react';
import { usePostureGuides, useStretchings } from '../hooks/useContent';
import PostureGuideCard from './PostureGuideCard';
import ContentDetailModal from './ContentDetailModal';
import type { ContentItem } from '../../../types/content';
import './PostureGuideExample.css';

export default function PostureGuideExample() {
  const [selectedPosture, setSelectedPosture] = useState<string | null>(null);
  const [selectedGuideId, setSelectedGuideId] = useState<number | null>(null);

  const { data: postureGuides, loading: postureLoading, error: postureError } = usePostureGuides();
  const { data: stretchings, loading: stretchingLoading, error: stretchingError } = useStretchings(selectedPosture);

  const handlePostureClick = (item: ContentItem) => {
    setSelectedPosture(item.posture);
    setSelectedGuideId(item.guideId);
  };

  const handleStretchingClick = (item: ContentItem) => {
    setSelectedGuideId(item.guideId);
  };

  return (
    <div className="posture-guide-example">
      <section className="posture-section">
        <h2>자세 가이드 목록</h2>
        
        {postureLoading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>자세 가이드를 불러오는 중...</p>
          </div>
        )}

        {postureError && (
          <div className="error-state">
            <p>⚠️ {postureError}</p>
          </div>
        )}

        {!postureLoading && !postureError && (
          <div className="posture-guide-grid">
            {postureGuides && postureGuides.map((item) => (
              <PostureGuideCard
                key={item.guideId}
                item={item}
                onClick={handlePostureClick}
              />
            ))}
          </div>
        )}
      </section>

      {selectedPosture && (
        <section className="stretching-section">
          <h2>추천 스트레칭 ({selectedPosture})</h2>
          
          {stretchingLoading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>스트레칭을 불러오는 중...</p>
            </div>
          )}

          {stretchingError && (
            <div className="error-state">
              <p>⚠️ {stretchingError}</p>
            </div>
          )}

          {!stretchingLoading && !stretchingError && (
            <>
              {!stretchings || stretchings.length === 0 ? (
                <p className="empty-state">추천 스트레칭이 없습니다.</p>
              ) : (
                <div className="stretching-grid">
                  {stretchings && stretchings.map((item) => (
                    <PostureGuideCard
                      key={item.guideId}
                      item={item}
                      onClick={handleStretchingClick}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {selectedGuideId && (
        <ContentDetailModal
          guideId={selectedGuideId}
          onClose={() => setSelectedGuideId(null)}
        />
      )}
    </div>
  );
}

