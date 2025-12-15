import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useContentList, useContentDetail } from '../../../hooks/useContent';
import type { ContentCategory } from '../../../types/content';
import '../../../assets/styles/Home.css';
import '../../../assets/styles/Information.css';
import './InformationPage.css';

// 카테고리 매핑: UI 카테고리 -> API 카테고리
type UICategory = 'all' | 'posture' | 'stretching' | 'exercise';
const categoryMapping: Record<UICategory, ContentCategory | 'all'> = {
  all: 'all',
  posture: '자세',
  stretching: '스트레칭',
  exercise: '교정 운동',
};

// 기본 이미지 경로 (s3ImageUrl이 null일 때 사용)
const DEFAULT_IMAGE_PATH = '/images/default-content.jpg';

function InformationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<UICategory>('all');
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  // API 카테고리 변환
  const apiCategory = useMemo(() => {
    return categoryMapping[selectedCategory] === 'all' 
      ? undefined 
      : (categoryMapping[selectedCategory] as ContentCategory);
  }, [selectedCategory]);

  // 콘텐츠 목록 조회
  const { data: contentList, isLoading, error } = useContentList(
    searchTerm || undefined,
    apiCategory
  );

  // 콘텐츠 상세 조회
  const { data: contentDetail, isLoading: isDetailLoading } = useContentDetail(selectedItemId);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  const categoryLabels: Record<UICategory, string> = {
    all: '전체',
    posture: '자세',
    stretching: '스트레칭',
    exercise: '교정 운동',
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
            <h1 className="main-title">정보 제공</h1>
            <p className="main-subtitle">자세 관련 질환과 스트레칭 방법을 확인하세요</p>
          </div>
        </div>

        {/* 메인 콘텐츠 영역 - 2컬럼 레이아웃 */}
        <div className="information-main-wrapper">
          {/* 왼쪽: 검색, 카테고리, 리스트 */}
          <main className="information-main-left">

            {/* 검색 & 카테고리 */}
            <div className="search-section">
              <div className="search-container">
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="검색어를 입력하세요"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button className="refresh-button" onClick={handleReset} title="초기화">
                      ↻
                    </button>
                  )}
                </div>
              </div>

              <div className="category-section">
                <div className="category-buttons">
                  {(['all', 'posture', 'stretching', 'exercise'] as UICategory[]).map((category) => (
                    <button
                      key={category}
                      className={`category-button category-button-${category} ${selectedCategory === category ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {categoryLabels[category]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 정보 리스트 - 세로 스크롤 */}
            <div className="information-list-container">
              {isLoading ? (
                <div className="information-empty">
                  <div className="empty-icon">⏳</div>
                  <p className="empty-text">로딩 중...</p>
                </div>
              ) : error ? (
                <div className="information-empty">
                  <div className="empty-icon">⚠️</div>
                  <p className="empty-text">콘텐츠를 불러오는 중 오류가 발생했습니다.</p>
                  <p className="empty-text" style={{ fontSize: '12px', color: '#999' }}>
                    {error.message}
                  </p>
                </div>
              ) : contentList.length === 0 ? (
                <div className="information-empty">
                  <div className="empty-icon">📭</div>
                  <p className="empty-text">검색 결과가 없습니다.</p>
                </div>
              ) : (
                contentList.map((item) => {
                  // 카테고리 기반 CSS 클래스 매핑
                  const categoryClass = item.category === '자세' ? 'posture' 
                    : item.category === '스트레칭' ? 'stretching'
                    : 'exercise';
                  
                  // 이미지 URL 처리: s3ImageUrl이 있으면 사용, 없으면 기본 이미지
                  const imageUrl = item.s3ImageUrl || DEFAULT_IMAGE_PATH;
                  
                  return (
                    <div
                      key={item.id}
                      className={`info-card info-card-${categoryClass} ${selectedItemId === item.id ? 'selected' : ''}`}
                      onClick={() => setSelectedItemId(item.id)}
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
                              // 이미지 로드 실패 시 기본 이미지로 대체
                              if (e.currentTarget.src !== DEFAULT_IMAGE_PATH) {
                                e.currentTarget.src = DEFAULT_IMAGE_PATH;
                              } else {
                                // 기본 이미지도 실패하면 숨김 처리
                                e.currentTarget.style.display = 'none';
                              }
                            }}
                          />
                        </div>

                        <p className="card-description">{item.relatedPart}</p>

                        <div className="card-tags">
                          <span className="tag">{item.category}</span>
                          {item.relatedPart && (
                            <span className="tag">{item.relatedPart}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </main>
        </div>
      </div>

      {/* 모달 팝업 */}
      {selectedItemId !== null && (
        <div className="info-modal-overlay" onClick={() => setSelectedItemId(null)}>
          <div className="info-modal-content" onClick={(e) => e.stopPropagation()}>
            {isDetailLoading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="empty-icon">⏳</div>
                <p className="empty-text">로딩 중...</p>
              </div>
            ) : contentDetail ? (
              <>
                <div className="detail-header">
                  <h4 className="detail-item-title">{contentDetail.title}</h4>
                  {contentDetail.category && (
                    <span className="detail-category-tag">{contentDetail.category}</span>
                  )}
                </div>

                {contentDetail.s3ImageUrl && (
                  <div className="detail-image-container" style={{ marginBottom: '24px' }}>
                    <img
                      src={contentDetail.s3ImageUrl}
                      alt={contentDetail.title}
                      style={{
                        width: '100%',
                        maxHeight: '400px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="detail-section">
                  <h5 className="detail-section-title">내용</h5>
                  <div className="description-box">
                    <p className="detail-description" style={{ whiteSpace: 'pre-wrap' }}>
                      {contentDetail.contentText}
                    </p>
                  </div>
                </div>

                {contentDetail.relatedPart && (
                  <div className="detail-section">
                    <h5 className="detail-section-title">관련 부위</h5>
                    <p className="detail-text">{contentDetail.relatedPart}</p>
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="empty-icon">⚠️</div>
                <p className="empty-text">콘텐츠를 불러올 수 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <button className="help-button">?</button>
    </div>
  );
}

export default InformationPage;

