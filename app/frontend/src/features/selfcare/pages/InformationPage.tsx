import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  usePostureGuides, 
  useStretchings,
  useContentDetail 
} from '../hooks/useContent';
import type { ContentItem } from '../../../types/content';
import '../../../assets/styles/Home.css';
import '../../../assets/styles/Information.css';
import './InformationPage.css';

// 기본 이미지 경로 (imageUrl이 null일 때 사용)
const DEFAULT_IMAGE_PATH = '/images/default-content.jpg';

function InformationPage() {
  // 상태 관리: 선택된 자세
  const [selectedPosture, setSelectedPosture] = useState<ContentItem | null>(null);

  // 1. 페이지 로드 시 → 자세 카드 리스트 조회
  const { 
    data: postureGuides, 
    loading: postureLoading, 
    error: postureError 
  } = usePostureGuides();

  // 2. 카드 클릭 시 → 선택된 자세의 상세 정보 조회
  const { 
    data: contentDetail, 
    loading: detailLoading, 
    error: detailError 
  } = useContentDetail(selectedPosture?.guideId || null);

  // 3. 카드 클릭 시 → posture 코드 기반 스트레칭 목록 조회
  const { 
    data: recommendedStretchings, 
    loading: stretchingLoading, 
    error: stretchingError 
  } = useStretchings(selectedPosture?.posture || null);

  // 자세 카드 클릭 핸들러
  const handlePostureClick = (item: ContentItem) => {
    setSelectedPosture(item);
  };

  // 닫기 핸들러
  const handleClose = () => {
    setSelectedPosture(null);
  };

  return (
    <div className="information-container" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* 상단 바 배경 */}
      <div className="information-background">
        <div className="information-top-bar">
          <div className="information-logo-container">
            <Link to="/" className="information-logo-link">
              <span className="information-logo-text">Postura</span>
            </Link>
          </div>
          <div className="information-top-bar-line"></div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* 헤더 비디오 섹션 */}
        <div className="information-header-image">
          <video 
            className="header-image" 
            src="/images/info-bg0001-0040.mkv" 
            autoPlay
            loop
            muted
            playsInline
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="header-text-overlay">
            <h1 className="main-title">보보 제공</h1>
            <p className="main-subtitle">자세 관련 질환과 스트레칭 방법을 확인하세요</p>
          </div>
        </div>

        {/* 메인 콘텐츠 영역 - 2컬럼 레이아웃 */}
        <div className="information-main-wrapper">
          {/* 왼쪽: 자세 카드 리스트 */}
          <main className="information-main-left">
            <div className="search-section">
              <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 600 }}>자세 가이드</h2>
            </div>

            <div className="information-list-container">
              {postureLoading ? (
                <div className="information-empty">
                  <div className="empty-icon">⏳</div>
                  <p className="empty-text">로딩 중...</p>
                </div>
              ) : postureError ? (
                <div className="information-empty">
                  <div className="empty-icon">⚠️</div>
                  <p className="empty-text">자세 가이드를 불러오는 중 오류가 발생했습니다.</p>
                  <p className="empty-text" style={{ fontSize: '12px', color: '#999' }}>
                    {postureError}
                  </p>
                </div>
              ) : !postureGuides || postureGuides.length === 0 ? (
                <div className="information-empty">
                  <div className="empty-icon">📭</div>
                  <p className="empty-text">자세 가이드가 없습니다.</p>
                </div>
              ) : (
                postureGuides.map((item) => {
                  if (!item || !item.guideId || !item.title) {
                    return null;
                  }

                  const imageUrl = item.imageUrl || DEFAULT_IMAGE_PATH;
                  const isSelected = selectedPosture?.guideId === item.guideId;
                  
                  return (
                    <div
                      key={item.guideId}
                      className={`info-card info-card-posture ${isSelected ? 'selected' : ''}`}
                      onClick={() => handlePostureClick(item)}
                    >
                      <div className="card-content-wrapper">
                        <div className="card-header">
                          <h3 className="card-title">{item.title}</h3>
                        </div>

                        <div className="card-image-container">
                          <img
                            src={imageUrl}
                            alt={item.title}
                            className="card-image"
                            onError={(e) => {
                              if (e.currentTarget.src !== DEFAULT_IMAGE_PATH) {
                                e.currentTarget.src = DEFAULT_IMAGE_PATH;
                              } else {
                                e.currentTarget.style.display = 'none';
                              }
                            }}
                          />
                        </div>

                        <p className="card-description">{item.relatedPart || ''}</p>

                        <div className="card-tags">
                          <span className="tag">{item.posture}</span>
                          {item.relatedPart && (
                            <span className="tag">{item.relatedPart}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }).filter(Boolean)
              )}
            </div>
          </main>

          {/* 오른쪽: 상세 설명 + 스트레칭 목록 */}
          {selectedPosture && (
            <aside className="information-main-right">
              <div className="detail-panel">
                {/* 닫기 버튼 */}
                <button 
                  className="close-button" 
                  onClick={handleClose}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#666',
                  }}
                >
                  ×
                </button>

                {/* 자세 상세 설명 */}
                <div className="detail-section">
                  <h3 className="detail-section-title">자세 상세 설명</h3>
                  
                  {detailLoading ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                <div className="empty-icon">⏳</div>
                <p className="empty-text">로딩 중...</p>
              </div>
                  ) : detailError ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <div className="empty-icon">⚠️</div>
                      <p className="empty-text">상세 정보를 불러오는 중 오류가 발생했습니다.</p>
                    </div>
            ) : contentDetail ? (
              <>
                <div className="detail-header">
                  <h4 className="detail-item-title">{contentDetail.title}</h4>
                        <div style={{ marginTop: '8px' }}>
                          <span className="detail-category-tag">{contentDetail.posture}</span>
                          {contentDetail.relatedPart && (
                            <span className="detail-category-tag">{contentDetail.relatedPart}</span>
                  )}
                        </div>
                </div>

                      {contentDetail.imageUrl && (
                        <div className="detail-image-container" style={{ marginTop: '16px', marginBottom: '16px' }}>
                    <img
                            src={contentDetail.imageUrl}
                      alt={contentDetail.title}
                      style={{
                        width: '100%',
                              maxHeight: '300px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                      <div className="description-box" style={{ marginTop: '16px' }}>
                        <p className="detail-description" style={{ whiteSpace: 'pre-line' }}>
                      {contentDetail.contentText}
                    </p>
                  </div>
                    </>
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <div className="empty-icon">⚠️</div>
                      <p className="empty-text">상세 정보를 불러올 수 없습니다.</p>
                    </div>
                  )}
                </div>

                {/* 추천 스트레칭 목록 */}
                <div className="detail-section" style={{ marginTop: '32px' }}>
                  <h3 className="detail-section-title">
                    추천 스트레칭 ({selectedPosture.posture})
                  </h3>

                  {stretchingLoading ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <div className="empty-icon">⏳</div>
                      <p className="empty-text">스트레칭을 불러오는 중...</p>
                    </div>
                  ) : stretchingError ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <div className="empty-icon">⚠️</div>
                      <p className="empty-text">스트레칭 목록을 불러오는 중 오류가 발생했습니다.</p>
                      <p className="empty-text" style={{ fontSize: '12px', color: '#999' }}>
                        {stretchingError}
                      </p>
                    </div>
                  ) : !recommendedStretchings || recommendedStretchings.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <div className="empty-icon">📭</div>
                      <p className="empty-text">추천 스트레칭이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="stretching-list">
                      {recommendedStretchings.map((stretching) => {
                        if (!stretching || !stretching.guideId || !stretching.title) {
                          return null;
                        }

                        const stretchingImageUrl = stretching.imageUrl || DEFAULT_IMAGE_PATH;

                        return (
                          <div
                            key={stretching.guideId}
                            className="stretching-card"
                            style={{
                              background: 'white',
                              borderRadius: '8px',
                              padding: '16px',
                              marginBottom: '12px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            }}
                          >
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>
                              {stretching.title}
                            </h4>
                            
                            {stretching.imageUrl && (
                              <div style={{ marginBottom: '8px' }}>
                                <img
                                  src={stretchingImageUrl}
                                  alt={stretching.title}
                                  style={{
                                    width: '100%',
                                    maxHeight: '200px',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                  }}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                  </div>
                )}

                            <p style={{ margin: '8px 0', fontSize: '14px', color: '#666' }}>
                              {stretching.relatedPart && (
                                <span style={{ marginRight: '8px' }}>부위: {stretching.relatedPart}</span>
                              )}
                            </p>

                            {stretching.contentText && (
                              <p 
                                style={{ 
                                  margin: '8px 0 0 0', 
                                  fontSize: '14px', 
                                  color: '#333',
                                  whiteSpace: 'pre-line',
                                  lineHeight: '1.6',
                                }}
                              >
                                {stretching.contentText.length > 100 
                                  ? `${stretching.contentText.substring(0, 100)}...` 
                                  : stretching.contentText}
                              </p>
                            )}
                          </div>
                        );
                      }).filter(Boolean)}
              </div>
            )}
          </div>
        </div>
            </aside>
      )}
        </div>
      </div>


    </div>
  );
}

export default InformationPage;

