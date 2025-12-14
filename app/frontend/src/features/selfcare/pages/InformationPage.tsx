import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Category, InfoItem } from '../data/infoData';
import { infoData } from '../data/infoData';
import '../../../assets/styles/Home.css';
import '../../../assets/styles/Information.css';
import './InformationPage.css';

function InformationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedItem, setSelectedItem] = useState<InfoItem | null>(null);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  const filteredData = infoData.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // 카테고리 필터링: 'all'이 아니면 정확히 일치하는 카테고리만 표시
    const matchesCategory = 
      selectedCategory === 'all' 
        ? true 
        : item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categoryLabels: Record<Category, string> = {
    all: '전체',
    posture: '자세',
    stretching: '스트레칭',
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
                  {(['all', 'posture', 'stretching'] as Category[]).map((category) => (
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
              {filteredData.length === 0 ? (
                <div className="information-empty">
                  <div className="empty-icon">📭</div>
                  <p className="empty-text">검색 결과가 없습니다.</p>
                </div>
              ) : (
                filteredData.map((item) => {
                  const imagePath = `/photo/${item.id}.jpg`;
                  return (
                    <div
                      key={item.id}
                      className={`info-card info-card-${item.category} ${selectedItem?.id === item.id ? 'selected' : ''}`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="card-content-wrapper">
                        <div className="card-header">
                          <h3 className="card-title">{item.title}</h3>
                        </div>

                        <div className="card-image-container">
                          <img
                            src={imagePath}
                            alt={item.title}
                            className="card-image"
                            onError={(e) => {
                              // 이미지가 없으면 숨김 처리
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>

                        <p className="card-description">{item.description}</p>

                        <div className="card-tags">
                          {item.tags.map((tag, index) => (
                            <span
                              key={index}
                              className={`tag ${index === item.tags.length - 1 && item.category === 'posture' ? 'highlight' : ''}`}
                            >
                              {tag}
                            </span>
                          ))}
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
      {selectedItem && (
        <div className="info-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="info-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="detail-header">
              <h4 className="detail-item-title">{selectedItem.title}</h4>
            </div>

            <div className="detail-section">
              <h5 className="detail-section-title">설명</h5>
              <div className="description-box">
                <p className="detail-description">{selectedItem.detail.fullDescription}</p>
              </div>
            </div>

            {selectedItem.detail.signal && (
              <div className="detail-section">
                <h5 className="detail-section-title">감지 신호</h5>
                <p className="detail-text">{selectedItem.detail.signal}</p>
              </div>
            )}

            {selectedItem.detail.causes && selectedItem.detail.causes.length > 0 && (
              <div className="detail-section">
                <h5 className="detail-section-title">원인</h5>
                <ul className="detail-list">
                  {selectedItem.detail.causes.map((cause, index) => (
                    <li key={index}>{cause}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedItem.detail.symptoms && selectedItem.detail.symptoms.length > 0 && (
              <div className="detail-section">
                <h5 className="detail-section-title">증상</h5>
                <ul className="detail-list">
                  {selectedItem.detail.symptoms.map((symptom, index) => (
                    <li key={index}>{symptom}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedItem.detail.methods && selectedItem.detail.methods.length > 0 && (
              <div className="detail-section">
                <h5 className="detail-section-title">방법</h5>
                <ul className="detail-list">
                  {selectedItem.detail.methods.map((method, index) => (
                    <li key={index}>{method}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedItem.detail.precautions && selectedItem.detail.precautions.length > 0 && (
              <div className="detail-section">
                <h5 className="detail-section-title">주의사항</h5>
                <ul className="detail-list">
                  {selectedItem.detail.precautions.map((precaution, index) => (
                    <li key={index}>{precaution}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedItem.detail.effect && (
              <div className="detail-section">
                <h5 className="detail-section-title">효과</h5>
                <p className="detail-text">{selectedItem.detail.effect}</p>
              </div>
            )}

            {selectedItem.detail.recommendedStretching &&
              selectedItem.detail.recommendedStretching.length > 0 && (
                <div className="detail-section">
                  <h5 className="detail-section-title">추천 스트레칭</h5>
                  <div className="detail-tags">
                    {selectedItem.detail.recommendedStretching.map((stretching, index) => (
                      <span key={index} className="detail-tag">
                        {stretching}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {selectedItem.detail.note && (
              <div className="detail-section">
                <h5 className="detail-section-title">참고</h5>
                <p className="detail-text">{selectedItem.detail.note}</p>
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

