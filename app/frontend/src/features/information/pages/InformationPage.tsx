import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../../assets/styles/Information.css';

interface InformationItem {
  id: number;
  title: string;
  description: string;
  tags: string[];
  category: string;
  icon: string;
}

function InformationPage() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedItem, setSelectedItem] = useState<InformationItem | null>(null);

  const categories = ['전체', '질환', '운동'];

  const informationItems: InformationItem[] = [
    {
      id: 1,
      title: '거북목 증후군',
      description: '목이 앞으로 빠져나간 자세로 인해 발생하는 목 통증',
      tags: ['목', '통증', '자세', '질환'],
      category: '질환',
      icon: '⚠️'
    },
    {
      id: 2,
      title: '목 스트레칭',
      description: '목 근육을 풀어주는 기본 스트레칭 동작',
      tags: ['목', '스트레칭', '기본', '운동'],
      category: '운동',
      icon: '📈'
    },
    {
      id: 3,
      title: '일자목',
      description: '목의 자연스러운 곡선이 사라진 상태',
      tags: ['목', '자세', '질환'],
      category: '질환',
      icon: '⚠️'
    }
  ];

  const filteredItems = informationItems.filter(item => {
    // 카테고리 필터링
    const matchesCategory = selectedCategory === '전체' || item.category === selectedCategory;
    
    // 검색어 필터링 (제목, 설명, 태그에서 검색)
    const matchesSearch = searchQuery.trim() === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const handleItemClick = (item: InformationItem) => {
    setSelectedItem(item);
  };

  // 디버깅용
  console.log('InformationPage 렌더링됨', { filteredItems });

  return (
    <div className="information-container" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <div className="dashboard-content">
        {/* 왼쪽 사이드바 */}
        <aside className="sidebar left-sidebar">
          <nav className="sidebar-nav">
            <Link
              to="/monitor"
              className={`nav-item ${location.pathname === '/monitor' ? 'active' : ''}`}
            >
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
            <Link
              to="/self-management"
              className={`nav-item ${location.pathname === '/self-management' ? 'active' : ''}`}
            >
              <div className="nav-icon">👤</div>
              <div className="nav-text">
                <span className="nav-title">자기 관리</span>
              </div>
            </Link>
          </nav>
          <div className="cookie-link">쿠키 관리 또는 옵트 아웃</div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="main-content information-main">
          <div className="content-header">
            <h1 className="main-title">정보 제공</h1>
            <p className="main-subtitle">자세 관련 질환과 스트레칭 방법을 확인하세요</p>
          </div>

          {/* 검색 및 카테고리 */}
          <div className="search-section">
            <div className="search-container">
              <label className="search-label">검색</label>
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Q 검색어 입력..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="refresh-button">↻</button>
              </div>
            </div>
            <div className="category-section">
              <label className="category-label">카테고리</label>
              <div className="category-buttons">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 정보 리스트 */}
          <div className="information-list">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`info-card ${selectedItem?.id === item.id ? 'selected' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                <div className="card-header">
                  <span className="card-icon">{item.icon}</span>
                  <h3 className="card-title">{item.title}</h3>
                </div>
                <p className="card-description">{item.description}</p>
                <div className="card-tags">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`tag ${tag === '질환' || tag === '운동' ? 'highlight' : ''}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* 오른쪽 상세 정보 패널 */}
        <aside className="detail-panel">
          <h3 className="detail-title">상세 정보</h3>
          {selectedItem ? (
            <div className="detail-content">
              <div className="detail-header">
                <span className="detail-icon">{selectedItem.icon}</span>
                <h4 className="detail-item-title">{selectedItem.title}</h4>
              </div>
              <p className="detail-description">{selectedItem.description}</p>
              <div className="detail-tags">
                {selectedItem.tags.map((tag: string, index: number) => (
                  <span key={index} className="detail-tag">{tag}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="detail-empty">
              <div className="empty-icon">⚠️</div>
              <p className="empty-text">왼쪽에서 항목을 선택하세요</p>
            </div>
          )}
        </aside>
      </div>

      {/* 도움말 버튼 */}
      <button className="help-button">?</button>
    </div>
  );
}

export default InformationPage;