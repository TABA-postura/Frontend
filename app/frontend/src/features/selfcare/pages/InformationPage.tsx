import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Category, InfoItem } from '../data/infoData';
import { infoData } from '../data/infoData';
import '../../../assets/styles/Home.css';
import '../../../assets/styles/Information.css';
import './InformationPage.css';

function InformationPage() {
  const location = useLocation();
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
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryLabels: Record<Category, string> = {
    all: '전체',
    posture: '자세',
    stretching: '스트레칭',
  };

  return (
    <div className="information-container" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <div className="dashboard-content">
        {/* 왼쪽 사이드바 */}
        <aside className="sidebar left-sidebar">
          <nav className="sidebar-nav">
            <Link to="/monitor" className={`nav-item ${location.pathname === '/monitor' ? 'active' : ''}`}>
              <div className="nav-icon blue">📊</div>
              <div className="nav-text">
                <span className="nav-title">실시간 자세 분석</span>
              </div>
            </Link>
            <div className={`nav-item ${location.pathname === '/information' ? 'active' : ''}`}>
              <div className="nav-icon blue">📚</div>
              <div className="nav-text">
                <span className="nav-title">정보 제공</span>
              </div>
            </div>
            <Link to="/selfcare" className={`nav-item ${location.pathname === '/selfcare' ? 'active' : ''}`}>
              <div className="nav-icon">👤</div>
              <div className="nav-text">
                <span className="nav-title">자기 관리</span>
              </div>
            </Link>
          </nav>
          <div className="cookie-link">쿠키 관리 또는 옵트 아웃</div>
        </aside>

        {/* 메인 콘텐츠 영역 - 2컬럼 레이아웃 */}
        <div className="information-main-wrapper">
          {/* 왼쪽: 검색, 카테고리, 리스트 */}
          <main className="information-main-left">
            <div className="content-header">
              <h1 className="main-title">정보 제공</h1>
              <p className="main-subtitle">
                자세 관련 질환과 스트레칭 방법을 확인하세요
              </p>
            </div>

            {/* 검색 & 카테고리 */}
            <div className="search-section">
              <div className="search-container">
                <label className="search-label">검색</label>
                <div className="search-input-wrapper">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="검색어 입력..."
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
                <label className="category-label">카테고리</label>
                <div className="category-buttons">
                  {(['all', 'posture', 'stretching'] as Category[]).map((category) => (
                    <button
                      key={category}
                      className={`category-button ${selectedCategory === category ? 'active' : ''}`}
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
                filteredData.map((item) => (
                  <div
                    key={item.id}
                    className={`info-card ${selectedItem?.id === item.id ? 'selected' : ''}`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="card-header">
                      <div className="card-warning-icon">⚠️</div>
                      <h3 className="card-title">{item.title}</h3>
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
                ))
              )}
            </div>
          </main>

        {/* 오른쪽 상세 정보 패널 */}
        <aside className="detail-panel">
          <h3 className="detail-title">상세 정보</h3>

          {selectedItem ? (
            <div className="detail-content">
              <div className="detail-header">
                <span className="detail-icon">📘</span>
                <h4 className="detail-item-title">{selectedItem.title}</h4>
              </div>

              <div className="detail-section">
                <h5 className="detail-section-title">설명</h5>
                <p className="detail-description">{selectedItem.detail.fullDescription}</p>
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
          ) : (
            <div className="detail-empty">
              <div className="empty-icon">⚠️</div>
              <p className="empty-text">왼쪽에서 항목을 선택하세요</p>
            </div>
          )}
        </aside>
        </div>
      </div>

      <button className="help-button">?</button>
    </div>
  );
}

export default InformationPage;

