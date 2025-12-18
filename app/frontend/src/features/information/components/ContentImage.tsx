/**
 * 콘텐츠 이미지 컴포넌트
 * s3ImageUrl 우선, 없으면 fallback 이미지 사용
 */

import { useState, useEffect } from 'react';
import { resolveImageUrl } from '../utils/imageUtils';

interface ContentImageProps {
  s3ImageUrl?: string | null;
  fallbackImageUrl?: string;
  alt: string;
  style?: React.CSSProperties;
}

export function ContentImage({ 
  s3ImageUrl, 
  fallbackImageUrl = '/images/content/목_측면_스트레칭.png',
  alt,
  style 
}: ContentImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // s3ImageUrl 우선, 없으면 fallback 사용
  const primaryImageUrl = s3ImageUrl ? resolveImageUrl(s3ImageUrl) : null;
  const fallbackUrl = fallbackImageUrl ? resolveImageUrl(fallbackImageUrl) : null;
  const imageUrl = primaryImageUrl || fallbackUrl;

  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [s3ImageUrl, fallbackImageUrl]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageError(true);
    setImageLoading(false);
    
    // 이미지 로딩 에러를 전역 에러 핸들러로 전파하지 않도록 방지
    e.stopPropagation();
    
    if (import.meta.env.DEV) {
      console.warn('[ContentImage] 이미지 로드 실패 (이미 fallback 처리됨):', {
        alt,
        s3ImageUrl,
        fallbackImageUrl,
      });
    }
  };

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        position: 'relative',
        ...style,
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
              <span style={{ color: '#999', fontSize: '14px' }}>로딩 중...</span>
            </div>
          )}
          <img
            src={imageUrl}
            alt={alt}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              opacity: imageLoading ? 0 : 1,
              transition: 'opacity 0.3s ease',
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </>
      ) : (
        <span style={{ color: '#999', fontSize: '14px', textAlign: 'center', padding: '16px' }}>
          이미지를 불러올 수 없습니다.
        </span>
      )}
    </div>
  );
}

