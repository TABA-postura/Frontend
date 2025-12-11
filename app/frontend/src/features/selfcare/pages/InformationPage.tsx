import { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import type { Category, InfoItem } from '../../../types/info';
import { useInfoData, useInfoDetail } from '../../../hooks/useInfoData';
import '../../../assets/styles/Home.css';
import '../../../assets/styles/Information.css';
import './InformationPage.css';

function InformationPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  // URL 쿼리 파라미터에서 guideId 읽기 (SelfManagementPage에서 링크로 넘어온 경우)
  useEffect(() => {
    const guideIdParam = searchParams.get('guideId');
    if (guideIdParam) {
      const guideId = parseInt(guideIdParam, 10);
      if (!isNaN(guideId)) {
        setSelectedItemId(guideId);
        // guideId를 사용한 후 쿼리 파라미터 제거 (선택사항)
        // setSearchParams({});
      }
    }
  }, [searchParams, setSearchParams]);

  // 백엔드 API에서 데이터 조회 (백엔드에서 필터링 처리)
  // category나 keyword가 변경되면 자동으로 다시 조회됨
  const { data: filteredData, isLoading, error } = useInfoData({
    category: selectedCategory,
    keyword: searchTerm || undefined,
  });

  // 선택된 항목의 상세 정보 조회
  const { data: selectedItemDetail, isLoading: isDetailLoading } = useInfoDetail(selectedItemId);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedItemId(null);
  };

  const handleItemClick = (item: InfoItem) => {
    setSelectedItemId(item.id);
  };

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
              {isLoading ? (
                <div className="information-empty">
                  <div className="empty-icon">⏳</div>
                  <p className="empty-text">로딩 중...</p>
                </div>
              ) : error ? (
                <div className="information-empty">
                  <div className="empty-icon">❌</div>
                  <p className="empty-text">데이터를 불러오는 중 오류가 발생했습니다.</p>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="information-empty">
                  <div className="empty-icon">📭</div>
                  <p className="empty-text">검색 결과가 없습니다.</p>
                </div>
              ) : (
                filteredData.map((item) => (
                  <div
                    key={item.id}
                    className={`info-card ${selectedItemId === item.id ? 'selected' : ''}`}
                    onClick={() => handleItemClick(item)}
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

          {isDetailLoading ? (
            <div className="detail-empty">
              <div className="empty-icon">⏳</div>
              <p className="empty-text">로딩 중...</p>
            </div>
          ) : selectedItemDetail ? (
            <div className="detail-content">
              <div className="detail-header">
                <span className="detail-icon">📘</span>
                <h4 className="detail-item-title">{selectedItemDetail.title}</h4>
              </div>

              <div className="detail-section">
                <h5 className="detail-section-title">설명</h5>
                <p className="detail-description">{selectedItemDetail.detail.fullDescription}</p>
              </div>

              {selectedItemDetail.detail.signal && (
                <div className="detail-section">
                  <h5 className="detail-section-title">감지 신호</h5>
                  <p className="detail-text">{selectedItemDetail.detail.signal}</p>
                </div>
              )}

              {selectedItemDetail.detail.causes && selectedItemDetail.detail.causes.length > 0 && (
                <div className="detail-section">
                  <h5 className="detail-section-title">원인</h5>
                  <ul className="detail-list">
                    {selectedItemDetail.detail.causes.map((cause, index) => (
                      <li key={index}>{cause}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedItemDetail.detail.symptoms && selectedItemDetail.detail.symptoms.length > 0 && (
                <div className="detail-section">
                  <h5 className="detail-section-title">증상</h5>
                  <ul className="detail-list">
                    {selectedItemDetail.detail.symptoms.map((symptom, index) => (
                      <li key={index}>{symptom}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedItemDetail.detail.methods && selectedItemDetail.detail.methods.length > 0 && (
                <div className="detail-section">
                  <h5 className="detail-section-title">방법</h5>
                  <ul className="detail-list">
                    {selectedItemDetail.detail.methods.map((method, index) => (
                      <li key={index}>{method}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedItemDetail.detail.precautions && selectedItemDetail.detail.precautions.length > 0 && (
                <div className="detail-section">
                  <h5 className="detail-section-title">주의사항</h5>
                  <ul className="detail-list">
                    {selectedItemDetail.detail.precautions.map((precaution, index) => (
                      <li key={index}>{precaution}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedItemDetail.detail.effect && (
                <div className="detail-section">
                  <h5 className="detail-section-title">효과</h5>
                  <p className="detail-text">{selectedItemDetail.detail.effect}</p>
                </div>
              )}

              {selectedItemDetail.detail.recommendedStretching &&
                selectedItemDetail.detail.recommendedStretching.length > 0 && (
                  <div className="detail-section">
                    <h5 className="detail-section-title">추천 스트레칭</h5>
                    <div className="detail-tags">
                      {selectedItemDetail.detail.recommendedStretching.map((stretching, index) => (
                        <span key={index} className="detail-tag">
                          {stretching}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {selectedItemDetail.detail.note && (
                <div className="detail-section">
                  <h5 className="detail-section-title">참고</h5>
                  <p className="detail-text">{selectedItemDetail.detail.note}</p>
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

