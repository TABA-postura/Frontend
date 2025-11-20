import { useState, useRef, useCallback } from 'react';

export interface UseWebcamResult {
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  start: () => Promise<void>;
  stop: () => void;
  freeze: () => void;
  unfreeze: () => void;
}

export function useWebcam(): UseWebcamResult {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsActive(true);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : '웹캠에 접근할 수 없습니다. 권한을 확인해주세요.';
      setError(errorMessage);
      setIsActive(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    setError(null);
  }, []);

  const freeze = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.enabled = false;
      });
    }
  }, []);

  const unfreeze = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.enabled = true;
      });
    }
  }, []);

  return {
    isActive,
    isLoading,
    error,
    videoRef,
    start,
    stop,
    freeze,
    unfreeze,
  };
}
