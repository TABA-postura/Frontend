import { useState, useEffect } from 'react';
import TopBar from '../../../components/TopBar';
import '../../../assets/styles/Information.css';

function InformationPage() {
  const videoSrc = '/videos/info-bg0001-0040.mp4';
  const [activeButton, setActiveButton] = useState<string>('전체');
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  useEffect(() => {
    // 페이지 로드 시 애니메이션 시작
    const timer = setTimeout(() => {
      setIsVideoVisible(true);
    }, 100);
    // 검색창은 동영상보다 약간 늦게 나타나게
    const searchTimer = setTimeout(() => {
      setIsSearchVisible(true);
    }, 600);
    return () => {
      clearTimeout(timer);
      clearTimeout(searchTimer);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>
      <TopBar />
      
      {/* 16:9 동영상 섹션 - 중간 크기 */}
      <div
        style={{
          width: '100%',
          position: 'relative',
          aspectRatio: '20 / 9',
          overflow: 'hidden',
          backgroundColor: '#000',
        }}
      >
        <video
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            opacity: isVideoVisible ? 1 : 0,
            transform: isVideoVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 1.2s ease-out, transform 1.2s ease-out',
          }}
          onError={(e) => {
            console.error('동영상 로드 실패:', videoSrc);
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* 위에서 아래로 그라데이션 오버레이 - 위쪽이 가장 어둡게 (검정색) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 20%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.2) 80%, rgba(0, 0, 0, 0) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        
        {/* 텍스트 오버레이 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            zIndex: 2,
            padding: '40px',
            paddingLeft: '80px',
          }}
        >
          <h1
            style={{
              color: 'white',
              fontSize: '48px',
              fontWeight: 700,
              margin: 0,
              marginBottom: '16px',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              fontFamily: "'Pretendard', sans-serif",
              textAlign: 'left',
              pointerEvents: 'none',
            }}
          >
            정보 제공
          </h1>
          <p
            style={{
              color: 'white',
              fontSize: '20px',
              fontWeight: 400,
              margin: 0,
              marginBottom: '16px',
              textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',
              fontFamily: "'Pretendard', sans-serif",
              textAlign: 'left',
              pointerEvents: 'none',
            }}
          >
            자세 관련 질환과 스트레칭 방법을 확인하세요
          </p>
          
          {/* 검색창 */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '800px',
              alignSelf: 'center',
              marginTop: '180px',
              opacity: isSearchVisible ? 1 : 0,
              transform: isSearchVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 1s ease-out, transform 1s ease-out',
            }}
          >
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: '50px',
                border: '1px solid #66cccc',
                backgroundColor: isSearchVisible ? 'rgba(0, 0, 0, 0.01)' : 'rgba(0, 0, 0, 0)',
                color: '#e6f5f5',
                fontSize: '16px',
                fontFamily: "'Pretendard', sans-serif",
                outline: 'none',
                backdropFilter: isSearchVisible ? 'blur(10px) brightness(0.6)' : 'blur(0px) brightness(1)',
                transition: 'all 1s ease-out',
                boxShadow: '0 0 2px rgba(102, 204, 204, 0.2)',
              }}
              className="search-input"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#66cccc';
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.backdropFilter = 'blur(10px) brightness(0.7)';
                e.currentTarget.style.boxShadow = '0 0 3px rgba(102, 204, 204, 0.3)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#66cccc';
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.01)';
                e.currentTarget.style.backdropFilter = 'blur(10px) brightness(0.6)';
                e.currentTarget.style.boxShadow = '0 0 2px rgba(102, 204, 204, 0.2)';
              }}
            />
          </div>
        </div>
      </div>

      {/* 버튼 섹션 */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          padding: '20px 80px',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => setActiveButton('전체')}
          style={{
            padding: '8px 24px',
            borderRadius: '8px',
            border: `1px solid ${activeButton === '전체' ? '#8bb3c0' : '#d3d3d3'}`,
            borderWidth: '1px',
            borderStyle: 'solid',
            backgroundColor: 'transparent',
            color: activeButton === '전체' ? '#8bb3c0' : '#d3d3d3',
            fontSize: '14px',
            fontWeight: 300,
            fontFamily: "'Pretendard', sans-serif",
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none',
            boxShadow: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
          } as React.CSSProperties}
          onMouseEnter={(e) => {
            if (activeButton !== '전체') {
              e.currentTarget.style.borderColor = '#b0b0b0';
              e.currentTarget.style.color = '#b0b0b0';
            }
          }}
          onMouseLeave={(e) => {
            if (activeButton !== '전체') {
              e.currentTarget.style.borderColor = '#d3d3d3';
              e.currentTarget.style.color = '#d3d3d3';
            }
          }}
        >
          전체
        </button>
        <button
          onClick={() => setActiveButton('자세')}
          style={{
            padding: '8px 24px',
            borderRadius: '8px',
            border: `1px solid ${activeButton === '자세' ? '#8bb3c0' : '#d3d3d3'}`,
            borderWidth: '1px',
            borderStyle: 'solid',
            backgroundColor: 'transparent',
            color: activeButton === '자세' ? '#8bb3c0' : '#d3d3d3',
            fontSize: '14px',
            fontWeight: 300,
            fontFamily: "'Pretendard', sans-serif",
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none',
            boxShadow: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
          } as React.CSSProperties}
          onMouseEnter={(e) => {
            if (activeButton !== '자세') {
              e.currentTarget.style.borderColor = '#b0b0b0';
              e.currentTarget.style.color = '#b0b0b0';
            }
          }}
          onMouseLeave={(e) => {
            if (activeButton !== '자세') {
              e.currentTarget.style.borderColor = '#d3d3d3';
              e.currentTarget.style.color = '#d3d3d3';
            }
          }}
        >
          자세
        </button>
        <button
          onClick={() => setActiveButton('스트레칭')}
          style={{
            padding: '8px 24px',
            borderRadius: '8px',
            border: `1px solid ${activeButton === '스트레칭' ? '#8bb3c0' : '#d3d3d3'}`,
            borderWidth: '1px',
            borderStyle: 'solid',
            backgroundColor: 'transparent',
            color: activeButton === '스트레칭' ? '#8bb3c0' : '#d3d3d3',
            fontSize: '14px',
            fontWeight: 300,
            fontFamily: "'Pretendard', sans-serif",
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none',
            boxShadow: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
          } as React.CSSProperties}
          onMouseEnter={(e) => {
            if (activeButton !== '스트레칭') {
              e.currentTarget.style.borderColor = '#b0b0b0';
              e.currentTarget.style.color = '#b0b0b0';
            }
          }}
          onMouseLeave={(e) => {
            if (activeButton !== '스트레칭') {
              e.currentTarget.style.borderColor = '#d3d3d3';
              e.currentTarget.style.color = '#d3d3d3';
            }
          }}
        >
          스트레칭
        </button>
                    </div>

      {/* 카드 그리드 섹션 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '40px',
          padding: '40px 80px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {Array.from({ length: 28 }).map((_, index) => (
          <div
            key={index}
            style={{
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid #e0e0e0',
              padding: '24px',
              aspectRatio: '1 / 1',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)';
              e.currentTarget.style.borderColor = '#8bb3c0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = '#e0e0e0';
            }}
          >
            {/* 제목 */}
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#333',
                margin: 0,
                fontFamily: "'Pretendard', sans-serif",
              }}
            >
              제목 {index + 1}
            </h3>
            
            {/* 사진 영역 */}
            <div
              style={{
                width: '100%',
                flex: 1.5,
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                minHeight: '180px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e0e0e0',
              }}
            >
              <span style={{ color: '#999', fontSize: '14px' }}>이미지</span>
            </div>
            
            {/* 한 줄 설명 */}
            <p
              style={{
                fontSize: '14px',
                color: '#666',
                margin: 0,
                fontFamily: "'Pretendard', sans-serif",
                lineHeight: '1.5',
              }}
            >
              설명 텍스트가 여기에 표시됩니다.
            </p>
            
            {/* 둥근 모서리 버튼 2개 */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginTop: 'auto',
              }}
            >
              <button
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  fontSize: '13px',
                  fontWeight: 400,
                  fontFamily: "'Pretendard', sans-serif",
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxShadow: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#8bb3c0';
                  e.currentTarget.style.color = '#8bb3c0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.color = '#666';
                }}
              >
                버튼 1
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  fontSize: '13px',
                  fontWeight: 400,
                  fontFamily: "'Pretendard', sans-serif",
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxShadow: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#8bb3c0';
                  e.currentTarget.style.color = '#8bb3c0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.color = '#666';
                }}
              >
                버튼 2
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InformationPage;
