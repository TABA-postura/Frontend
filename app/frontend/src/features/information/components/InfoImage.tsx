/**
 * 정보 아이템의 이미지를 표시하는 컴포넌트
 * 이미지 로딩 실패 시 fallback 처리 포함
 */

import { useState, useEffect } from 'react';
import { resolveImageUrl } from '../utils/imageUtils';

interface InfoImageProps {
  s3ImageUrl?: string | null;
  title: string;
  fallbackText?: string;
}

export function InfoImage({ s3ImageUrl, title, fallbackText }: InfoImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const imageUrl = s3ImageUrl ? resolveImageUrl(s3ImageUrl) : null;

  // s3ImageUrl이 변경될 때마다 상태 초기화
  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [s3ImageUrl]);

  const handleImageLoad = () => {
    setImageLoading(false);
    if (import.meta.env.DEV) {
      console.log('[InfoImage] 이미지 로드 성공:', {
        title,
        imageUrl,
      });
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageError(true);
    setImageLoading(false);
    
    // 이미지 로딩 에러를 전역 에러 핸들러로 전파하지 않도록 방지
    e.stopPropagation();
    
    if (import.meta.env.DEV) {
      const img = e.currentTarget;
      console.warn('[InfoImage] 이미지 로드 실패 (이미 fallback 처리됨):', {
        title,
        originalUrl: s3ImageUrl,
        resolvedUrl: imageUrl,
        networkUrl: img.src,
      });
    }
  };

  return (
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
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {imageUrl && !imageError ? (
        <>
          {imageLoading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                zIndex: 1,
              }}
            >
              <span style={{ color: '#999', fontSize: '12px' }}>로딩 중...</span>
            </div>
          )}
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              opacity: imageLoading ? 0 : 1,
              transition: 'opacity 0.3s ease',
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </>
      ) : (
        <span style={{ color: '#999', fontSize: '14px', textAlign: 'center', padding: '8px' }}>
          {fallbackText || '이미지 없음'}
        </span>
      )}
    </div>
  );
}

