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
          <p
            style={{
              color: '#d32f2f',
              fontSize: '16px',
              marginBottom: '16px',
              fontFamily: "'Pretendard', sans-serif",
            }}
          >
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

  // =========================================================
  // [FIX] contentText 파서 개선
  // - 기존: 알려진 소제목(주요 원인/설명...)만 분리
  // - 개선:
  //   1) 맨 위 "전체 제목(예: ~의 원인과 영향)"을 별도 섹션으로 분리
  //   2) "1. 제목: 내용" (한 줄) 형식을 정확히 title/content로 분리
  //   3) "1. 제목" + 다음 줄 내용 형식도 지원
  // =========================================================
  const parseContentSections = (text: string) => {
    const normalized = (text ?? '').replace(/\r\n/g, '\n').trim();
    if (!normalized) return [];

    const sections: { title: string; content: string }[] = [];

    // 알려진 소제목 목록 (정규식으로 매칭)
    const knownTitles = ['자세 유형', '체간 기울기 이상', '탐지 특징', '설명', '주요 원인', '동반 증상', '교정 필요성'];

    // [FIX] 번호 섹션을 분리하는 유틸
    // - 지원1: 1. 제목: 내용(같은 줄)
    // - 지원2: 1. 제목\n내용(다음 줄)
    // - 맨 앞에 전체 제목(번호 전 첫 줄)이 있으면 title 섹션으로 분리
    const splitNumberedSections = (srcText: string) => {
      const src = (srcText ?? '').replace(/\r\n/g, '\n').trim();
      if (!src) return [];

      const out: { title: string; content: string }[] = [];

      // 번호 시작 위치 탐색 (줄 시작 기준)
      const startRe = /^\s*(\d+)\.\s+/gm;
      const starts: number[] = [];
      let m: RegExpExecArray | null;

      while ((m = startRe.exec(src)) !== null) {
        starts.push(m.index);
      }

      // 번호 섹션이 없으면 그대로 반환
      if (starts.length === 0) {
        out.push({ title: '', content: src });
        return out;
      }

      // 번호 이전 텍스트(보통 "~~의 원인과 영향")를 분리
      const intro = src.slice(0, starts[0]).trim();
      if (intro) {
        // intro가 여러 줄이면 첫 줄은 title, 나머지는 content로 분리
        const lines = intro.split('\n').map(s => s.trim()).filter(Boolean);
        const introTitle = lines[0] ?? '';
        const introBody = lines.slice(1).join('\n').trim();
        out.push({ title: introTitle, content: introBody });
      }

      // 각 번호 섹션 블록 추출
      for (let i = 0; i < starts.length; i++) {
        const start = starts[i];
        const end = i + 1 < starts.length ? starts[i + 1] : src.length;
        const block = src.slice(start, end).trim();

        // 첫 줄(헤더) + 나머지(바디)
        const lines = block.split('\n');
        const headLine = (lines[0] ?? '').trim();
        const restLines = lines.slice(1).join('\n').trim();

        // [FIX] "1. 제목: 내용" 같은 줄 처리
        // 예: "1. 어깨 기울임의 주요 원인: 생활 습관과 근육 불균형 ..."
        const inlineRe = /^(\d+\.\s*[^:\n]+)\s*:\s*(.*)$/;
        const inlineMatch = headLine.match(inlineRe);

        if (inlineMatch) {
          const title = inlineMatch[1].trim(); // "1. 어깨 기울임의 주요 원인"
          const inlineBody = (inlineMatch[2] ?? '').trim(); // ":" 뒤 내용
          const content = [inlineBody, restLines].filter(Boolean).join('\n').trim();
          out.push({ title, content });
        } else {
          // "1. 제목" + 다음 줄 내용
          out.push({ title: headLine, content: restLines });
        }
      }

      return out;
    };

    // 1) 먼저 "알려진 소제목"으로 큰 덩어리 분리 (기존 방식 유지)
    const titlePattern = new RegExp(`(${knownTitles.join('|')})\\s*`, 'g');
    const parts = normalized.split(titlePattern).filter(part => part.trim().length > 0);

    let i = 0;
    while (i < parts.length) {
      const part = parts[i].trim();

      if (knownTitles.includes(part)) {
        const content =
          i + 1 < parts.length && !knownTitles.includes(parts[i + 1].trim())
            ? parts[i + 1].trim()
            : '';
        sections.push({ title: part, content });
        i += content ? 2 : 1;
      } else {
        sections.push({ title: '', content: part });
        i++;
      }
    }

    // 2) [FIX] 각 섹션에서 번호 섹션을 추가로 분해 (DB가 "1. 제목: 내용"이든 "1. 제목\n내용"이든 모두 커버)
    const flattened = sections.flatMap(s => {
      // title이 따로 있는 섹션이면 그 내부 content만 번호로 분해
      if (s.title) {
        const inner = splitNumberedSections(s.content);
        // inner가 "title 없음 + content"로 나올 수 있으니, title을 유지해서 합친다.
        if (inner.length === 1 && !inner[0].title) {
          return [{ title: s.title, content: inner[0].content }];
        }
        // 번호로 쪼개진 경우: 섹션 title을 prefix로 붙이는 대신 그대로 두고, title 섹션 하나는 유지
        // (UI상 카드가 너무 길어지는 것을 방지)
        return [{ title: s.title, content: '' }, ...inner];
      }

      // title 없는 섹션(본문 시작부)은 통째로 번호 분해
      return splitNumberedSections(s.content);
    });

    // 3) 빈 섹션 정리
    return flattened
      .map(s => ({ title: (s.title ?? '').trim(), content: (s.content ?? '').trim() }))
      .filter(s => s.title || s.content);
  };

  const contentSections = parseContentSections(content.contentText);

  // '주요 원인' 섹션 병합 함수
  const mergeCauseSections = (sections: { title: string; content: string }[]) => {
    const merged: { title: string; content: string }[] = [];
    const CAUSE_SECTION_TITLE = '주요 원인';
    
    for (let i = 0; i < sections.length; i++) {
      const current = sections[i];
      
      // '주요 원인' 섹션을 찾은 경우
      if (current.title === CAUSE_SECTION_TITLE) {
        // 이전 블록과 다음 블록 확인
        const prevBlock = i > 0 ? sections[i - 1] : null;
        const nextBlock = i + 1 < sections.length ? sections[i + 1] : null;
        
        // 병합된 title 생성: 이전 블록의 title + '주요 원인'
        let mergedTitle = '';
        if (prevBlock && prevBlock.title && !prevBlock.title.includes(CAUSE_SECTION_TITLE)) {
          mergedTitle = prevBlock.title.trim() + ' ' + CAUSE_SECTION_TITLE;
        } else {
          mergedTitle = CAUSE_SECTION_TITLE;
        }
        
        // 병합된 content 생성
        const contentParts: string[] = [];
        
        // 이전 블록의 content 추가
        if (prevBlock && prevBlock.content) {
          contentParts.push(prevBlock.content.trim());
        }
        
        // 현재 블록의 content 추가
        if (current.content) {
          contentParts.push(current.content.trim());
        }
        
        // 다음 블록 처리
        if (nextBlock) {
          // 다음 블록의 title이 ':'로 시작하면 content로 취급
          if (nextBlock.title.startsWith(':')) {
            contentParts.push(nextBlock.title.trim().replace(/^:\s*/, ''));
          } else if (nextBlock.title && !nextBlock.title.match(/^\d+\./)) {
            // 번호로 시작하지 않는 title도 content로 취급
            contentParts.push(nextBlock.title.trim());
          }
          
          // 다음 블록의 content 추가
          if (nextBlock.content) {
            contentParts.push(nextBlock.content.trim());
          }
        }
        
        merged.push({
          title: mergedTitle.trim(),
          content: contentParts.join(' ').trim(),
        });
        
        // 이전 블록이 병합되었으므로 이미 추가된 경우가 아니면 건너뛰기
        // 다음 블록도 병합되었으므로 건너뛰기
        if (nextBlock) {
          i++; // nextBlock 건너뛰기
        }
      } else {
        // '주요 원인' 섹션이 아니면 그대로 추가
        // 단, 다음 블록이 '주요 원인'이면 현재 블록은 병합될 예정이므로 건너뛰기
        const nextBlock = i + 1 < sections.length ? sections[i + 1] : null;
        if (nextBlock && nextBlock.title === CAUSE_SECTION_TITLE) {
          // 다음에 병합될 예정이므로 건너뛰기
          continue;
        }
        merged.push(current);
      }
    }
    
    return merged;
  };

  // '주요 원인' 섹션 병합 적용
  const mergedSections = mergeCauseSections(contentSections);

  // 메타 정보 추출
  const targetParts = getTargetParts(content.relatedPart, (content as any).posture);
  const expectedEffects = getExpectedEffects(content.contentText);
  const recommendedSituations = getRecommendedSituations(content.contentText);
  const postureKoreanName = (content as any).posture ? getPostureKoreanName((content as any).posture) : null;

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
        {mergedSections.length > 0 && (
          <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mergedSections.map((section, index) => (
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
                {(section.title || '').trim() && (
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

                {/* [FIX] content가 비어있으면 렌더링하지 않음 (빈 카드/잘린 느낌 방지) */}
                {(section.content || '').trim() && (
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
                )}
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
            <MetaInfoCard title="관련 자세 문제" items={[postureKoreanName]} style={{ marginBottom: '16px' }} />
          )}
          <MetaInfoCard title="주요 타깃 부위" items={targetParts} />
        </div>

        {/* 기대 효과 섹션 */}
        {expectedEffects.length > 0 && <BulletListSection title="기대 효과" items={expectedEffects} />}

        {/* 권장 상황 섹션 */}
        {recommendedSituations.length > 0 && <BulletListSection title="권장 상황" items={recommendedSituations} />}
      </div>
    </div>
  );
}

export default ContentDetailPage;
