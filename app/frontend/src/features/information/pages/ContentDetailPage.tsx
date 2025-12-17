/**
 * 콘텐츠 상세 페이지
 * GET /api/content/{id}를 사용하여 콘텐츠 상세 정보를 표시
 */

import { useParams } from 'react-router-dom';
import TopBar from '../../../components/TopBar';
import { useContentDetail } from '../hooks/useContentDetail';
import { CategoryBadge } from '../components/CategoryBadge';
import { ContentImage } from '../components/ContentImage';
import { MetaInfoCard } from '../components/MetaInfoCard';
import { BulletListSection } from '../components/BulletListSection';

/**
 * 자세 타입을 한글 이름으로 변환
 */
function getPostureKoreanName(posture: string): string {
  const postureMap: Record<string, string> = {
    HEAD_TILT: '머리 기울임 자세',
    UNEQUAL_SHOULDERS: '한쪽 어깨 기울임 자세',
    // 추가 자세 타입 매핑 가능
  };
  return postureMap[posture] || posture;
}

/**
 * 관련 부위를 기반으로 타깃 부위 추출
 * TODO: 실제로는 API에서 받아오거나 별도 매핑 데이터에서 가져와야 함
 */
function getTargetParts(relatedPart: string, posture?: string): string[] {
  // 예시: 목 관련 + HEAD_TILT인 경우
  if (relatedPart === '목' && posture === 'HEAD_TILT') {
    return [
      '상부 승모근 (Upper Trapezius)',
      '견갑거근 (Levator Scapulae)',
      '사각근 (Scalenes)',
    ];
  }
  // 기본값
  return [`${relatedPart} 관련 근육`];
}

/**
 * 기대 효과 목록 추출
 * TODO: 실제로는 API에서 받아오거나 contentText에서 파싱해야 함
 */
function getExpectedEffects(contentText: string): string[] {
  // contentText에서 기대 효과 섹션을 찾거나, 별도 필드로 받아야 함
  // 현재는 하드코딩된 예시 데이터 사용
  if (contentText.includes('목과 어깨')) {
    return [
      '목과 어깨 연결 부위의 긴장 완화 및 뭉침 해소',
      '긴장성 두통 감소',
      '목의 측면 굴곡 가동 범위 개선',
      '일자목·거북목으로 인한 통증 완화',
    ];
  }
  return [];
}

/**
 * 권장 상황 목록 추출
 * TODO: 실제로는 API에서 받아오거나 contentText에서 파싱해야 함
 */
function getRecommendedSituations(contentText: string): string[] {
  // contentText에서 권장 상황 섹션을 찾거나, 별도 필드로 받아야 함
  // 현재는 하드코딩된 예시 데이터 사용
  if (contentText.includes('목과 어깨')) {
    return [
      '어깨가 한쪽으로 솟아오른 느낌이 들 때',
      '목덜미부터 어깨까지 뻐근한 통증이 있을 때',
      '장시간 업무·공부 후 목이 경직되었을 때',
    ];
  }
  return [];
}

function ContentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const contentId = id ? parseInt(id, 10) : null;
  
  const { data: content, isLoading, error, refetch } = useContentDetail(contentId);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <TopBar />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: '#666', fontSize: '16px', fontFamily: "'Pretendard', sans-serif" }}>
            로딩 중...
          </p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <TopBar />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: '#d32f2f', fontSize: '16px', marginBottom: '16px', fontFamily: "'Pretendard', sans-serif" }}>
            {error?.message || '콘텐츠를 불러오는데 실패했습니다.'}
          </p>
          <button
            onClick={() => refetch()}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #8bb3c0',
              backgroundColor: '#e0f2f7',
              color: '#265d70',
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: "'Pretendard', sans-serif",
            }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // contentText를 소제목별로 파싱하여 섹션으로 분리
  const parseContentSections = (text: string) => {
    const sections: { title: string; content: string }[] = [];
    
    // 알려진 소제목 목록 (정규식으로 매칭)
    const knownTitles = ['자세 유형', '체간 기울기 이상', '탐지 특징', '설명', '주요 원인', '동반 증상', '교정 필요성'];
    
    // 소제목 패턴으로 분리 (소제목 + 그 뒤 내용)
    const titlePattern = new RegExp(`(${knownTitles.join('|')})\\s*`, 'g');
    
    // 텍스트를 소제목 기준으로 분할
    const parts = text.split(titlePattern).filter(part => part.trim().length > 0);
    
    let i = 0;
    while (i < parts.length) {
      const part = parts[i].trim();
      
      if (knownTitles.includes(part)) {
        // 소제목인 경우, 다음 파트가 내용
        const content = (i + 1 < parts.length && !knownTitles.includes(parts[i + 1].trim()))
          ? parts[i + 1].trim()
          : '';
        sections.push({ title: part, content });
        i += content ? 2 : 1;
      } else {
        // 소제목 없이 시작하는 내용
        sections.push({ title: '', content: part });
        i++;
      }
    }
    
    return sections;
  };
  
  const contentSections = parseContentSections(content.contentText);

  // 메타 정보 추출
  const targetParts = getTargetParts(content.relatedPart, (content as any).posture);
  const expectedEffects = getExpectedEffects(content.contentText);
  const recommendedSituations = getRecommendedSituations(content.contentText);
  const postureKoreanName = (content as any).posture 
    ? getPostureKoreanName((content as any).posture)
    : null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <TopBar />
      
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        {/* 상단: 제목 및 카테고리 */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <CategoryBadge category={content.category} />
          </div>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#333',
              margin: 0,
              fontFamily: "'Pretendard', sans-serif",
              lineHeight: '1.4',
            }}
          >
            {content.title}
          </h1>
        </div>

        {/* 대표 이미지 */}
        <div style={{ marginBottom: '40px' }}>
          <ContentImage
            s3ImageUrl={content.s3ImageUrl}
            fallbackImageUrl="/images/content/목_측면_스트레칭.png"
            alt={content.title}
          />
        </div>

        {/* 본문 설명 - 소제목별 개별 카드 */}
        {contentSections.length > 0 && (
          <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {contentSections.map((section, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '20px 24px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                }}
              >
                {section.title && (
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#333',
                      margin: '0 0 12px 0',
                      fontFamily: "'Pretendard', sans-serif",
                      borderBottom: '2px solid #667eea',
                      paddingBottom: '8px',
                      display: 'inline-block',
                    }}
                  >
                    {section.title}
                  </h3>
                )}
                <p
                  style={{
                    fontSize: '15px',
                    color: '#555',
                    lineHeight: '1.8',
                    margin: 0,
                    fontFamily: "'Pretendard', sans-serif",
                    whiteSpace: 'pre-line',
                  }}
                >
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 메타 정보 섹션 */}
        <div style={{ marginBottom: '40px' }}>
          <MetaInfoCard
            title="분류"
            items={[`${content.category} (${content.category === '스트레칭' ? 'Stretching' : content.category})`]}
            style={{ marginBottom: '16px' }}
          />
          {postureKoreanName && (
            <MetaInfoCard
              title="관련 자세 문제"
              items={[postureKoreanName]}
              style={{ marginBottom: '16px' }}
            />
          )}
          <MetaInfoCard
            title="주요 타깃 부위"
            items={targetParts}
          />
        </div>

        {/* 기대 효과 섹션 */}
        {expectedEffects.length > 0 && (
          <BulletListSection
            title="기대 효과"
            items={expectedEffects}
          />
        )}

        {/* 권장 상황 섹션 */}
        {recommendedSituations.length > 0 && (
          <BulletListSection
            title="권장 상황"
            items={recommendedSituations}
          />
        )}
      </div>
    </div>
  );
}

export default ContentDetailPage;

