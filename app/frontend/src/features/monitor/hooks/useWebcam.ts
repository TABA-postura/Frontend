import { useRef, useState, useCallback, useEffect } from 'react';

export interface UseWebcamResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  freeze: () => void;   // 비디오 일시정지
  unfreeze: () => void; // 비디오 다시 재생
}

interface UseWebcamReturn extends UseWebcamResult {}

export function useWebcam(): UseWebcamReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    setError(null);
  }, []);

  // 비디오 일시정지 (스트림은 유지)
  const freeze = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  // 비디오 재생 재개
  const unfreeze = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.error('비디오 재생 실패:', err);
      });
    }
  }, []);

  const start = useCallback(async () => {
    // 브라우저 지원 확인
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('이 브라우저에서는 웹캠을 지원하지 않습니다.');
      setIsLoading(false);
      setIsActive(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsActive(true);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      // 에러 타입에 따른 사용자 친화적 메시지
      let errorMessage = '웹캠에 접근할 수 없습니다. 브라우저 권한을 확인해주세요.';

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = '웹캠 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMessage = '웹캠을 찾을 수 없습니다. 웹캠이 연결되어 있는지 확인해주세요.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMessage = '웹캠을 사용할 수 없습니다. 다른 프로그램에서 사용 중일 수 있습니다.';
        }
      }

      setError(errorMessage);
      setIsActive(false);
      setIsLoading(false);

      // 실패 시 스트림 정리
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        streamRef.current = null;
      }
    }
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    videoRef,
    isActive,
    isLoading,
    error,
    start,
    stop,
    freeze,
    unfreeze,
  };
}
