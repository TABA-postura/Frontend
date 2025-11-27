import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../../auth/api/axios';
import '../../../assets/styles/Home.css';
import '../../../assets/styles/Information.css';

// ✨ 백엔드 ContentListResponse 구조에 맞춘 타입
interface InformationItem {
  id: number;
  title: string;
  category: string;
  s3ImageUrl: string;
  relatedPosture: string;
}

function InformationPage() {
  const location = useLocation();
  const [items, setItems] = useState<InformationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedItem, setSelectedItem] = useState<InformationItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ['전체', '질환', '운동'];

  // 🔍 목록 불러오기
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await api.post('/api/content', {
          keyword: searchQuery || null,
          category: selectedCategory !== '전체' ? selectedCategory : null,
        });

        // 백엔드 응답 구조 확인: 배열 또는 { contents: [] } 형태일 수 있음
        const data = response.data;
        const itemsArray = Array.isArray(data) ? data : (data?.contents || data?.data || []);
        
        setItems(itemsArray);
      } catch (error: any) {
        console.error('콘텐츠 불러오기 실패:', error);
        setError('콘텐츠를 불러오는 중 오류가 발생했습니다.');
        // 개발 환경에서는 임시 더미 데이터 표시
        if (import.meta.env.DEV) {
          setItems([
            {
              id: 1,
              title: '거북목 증후군',
              category: '질환',
              s3ImageUrl: '',
              relatedPosture: '거북목은 목이 앞으로 나오는 자세로 인해 발생하는 질환입니다.',
            },
            {
              id: 2,
              title: '목 스트레칭',
              category: '운동',
              s3ImageUrl: '',
              relatedPosture: '거북목을 예방하기 위한 목 스트레칭 방법입니다.',
            },
            {
              id: 3,
              title: '허리 디스크',
              category: '질환',
              s3ImageUrl: '',
              relatedPosture: '잘못된 자세로 인해 발생하는 허리 디스크 질환입니다.',
            },
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [searchQuery, selectedCategory]);

  // 📌 상세 조회
  const handleItemClick = async (id: number) => {
    try {
      const response = await api.get(`/api/content/${id}`);
      setSelectedItem(response.data);
    } catch (error) {
      console.error('상세정보 조회 실패:', error);
    }
  };

  return (
    <div className="information-container" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <div className="dashboard-content">
        {/* 왼쪽 사이드바 */}
        <aside className="sidebar left-sidebar">
          <nav className="sidebar-nav">
            <Link to="/monitor" className={`nav-item ${location.pathname === '/monitor' ? 'active' : ''}`}>
              <div className="nav-icon blue">📊</div>
              <div className="nav-text"><span className="nav-title">실시간 자세 분석</span></div>
            </Link>
            <div className={`nav-item ${location.pathname === '/information' ? 'active' : ''}`}>
              <div className="nav-icon blue">📚</div>
              <div className="nav-text"><span className="nav-title">정보 제공</span></div>
            </div>
            <Link to="/selfcare" className={`nav-item ${location.pathname === '/selfcare' ? 'active' : ''}`}>
              <div className="nav-icon">👤</div>
              <div className="nav-text"><span className="nav-title">자기 관리</span></div>
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

          {/* 검색 & 카테고리 */}
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
                <button className="refresh-button" onClick={() => setSearchQuery('')}>↻</button>
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
            {isLoading ? (
              <div className="information-empty">
                <div className="empty-icon">⏳</div>
                <p className="empty-text">콘텐츠를 불러오는 중...</p>
              </div>
            ) : error && items.length === 0 ? (
              <div className="information-empty">
                <div className="empty-icon">⚠️</div>
                <p className="empty-text">{error}</p>
              </div>
            ) : items.length === 0 ? (
              <div className="information-empty">
                <div className="empty-icon">📭</div>
                <p className="empty-text">표시할 콘텐츠가 없습니다.</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className={`info-card ${selectedItem?.id === item.id ? 'selected' : ''}`}
                  onClick={() => handleItemClick(item.id)}
                >
                  <div className="card-header">
                    <span className="card-icon">📘</span>
                    <h3 className="card-title">{item.title}</h3>
                  </div>

                  {/* 설명: relatedPosture 표시 */}
                  <p className="card-description">{item.relatedPosture}</p>

                  {/* 태그 대신 posture 하나만 표시 */}
                  <div className="card-tags">
                    <span className="tag">{item.category}</span>
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

              <p className="detail-description">{selectedItem.relatedPosture}</p>

              <div className="detail-tags">
                <span className="detail-tag">{selectedItem.category}</span>
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

      <button className="help-button">?</button>
    </div>
  );
}

export default InformationPage;