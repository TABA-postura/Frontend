import { useState, useEffect, useCallback, useRef } from 'react';
import { monitorStore } from '../store/monitorStore';
import * as monitorApi from '../api/monitor';

interface UseMonitoringOptions {
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  onFeedbackUpdate?: (feedback: any) => void;
  imageSendIntervalMs?: number;
}

export function useMonitoring(options: UseMonitoringOptions = {}) {
  const { videoRef, onFeedbackUpdate, imageSendIntervalMs = 400 } = options;
  const [state, setState] = useState(monitorStore.getState());
  const isPollingRef = useRef(false);

  useEffect(() => {
    const unsubscribe = monitorStore.subscribe(() => {
      setState(monitorStore.getState());
    });
    return unsubscribe;
  }, []);

  // 피드백 폴링
  useEffect(() => {
    if (state.status === 'STARTED' || state.status === 'RESUMED') {
      // 이미 폴링 중이면 중복 실행 방지
      if (isPollingRef.current) return;

      isPollingRef.current = true;
      const pollFeedback = async () => {
        try {
          const feedback = await monitorApi.getRealtimeFeedback();
          monitorStore.setFeedback(feedback);
          if (onFeedbackUpdate) {
            onFeedbackUpdate(feedback);
          }
        } catch (error) {
          console.error('피드백 폴링 실패:', error);
        }
      };

      // 즉시 한 번 호출
      pollFeedback();

      // 1초마다 폴링
      const intervalId = window.setInterval(pollFeedback, 1000);
      monitorStore.setPollingInterval(intervalId);

      return () => {
        isPollingRef.current = false;
        clearInterval(intervalId);
        monitorStore.setPollingInterval(null);
      };
    } else {
      // 상태가 STARTED/RESUMED가 아니면 폴링 중지
      if (isPollingRef.current) {
        isPollingRef.current = false;
        if (state.pollingInterval !== null) {
          clearInterval(state.pollingInterval);
          monitorStore.setPollingInterval(null);
        }
      }
    }
  }, [state.status, state.pollingInterval, onFeedbackUpdate]);

  // 이미지 전송 (웹캠이 있는 경우)
  useEffect(() => {
    if (
      (state.status === 'STARTED' || state.status === 'RESUMED') &&
      videoRef?.current &&
      state.sessionId !== null
    ) {
      const sendImage = async () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) return;

        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = canvas.toDataURL('image/jpeg', 0.9);

          await monitorApi.sendFrame(state.sessionId!, imageData);
        } catch (error) {
          console.error('이미지 전송 실패:', error);
        }
      };

      // 즉시 한 번 전송
      sendImage();

      // 설정된 간격으로 전송
      const intervalId = window.setInterval(sendImage, imageSendIntervalMs);
      monitorStore.setImageSendInterval(intervalId);

      return () => {
        clearInterval(intervalId);
        monitorStore.setImageSendInterval(null);
      };
    }
  }, [state.status, state.sessionId, videoRef, imageSendIntervalMs]);

  const startSession = useCallback(async (): Promise<void> => {
    try {
      const response = await monitorApi.startMonitoringSession();
      monitorStore.startSession(response.sessionId, response.startTime);
    } catch (error) {
      console.error('세션 시작 실패:', error);
      throw error;
    }
  }, []);

  const pauseSession = useCallback(async (): Promise<void> => {
    if (state.sessionId === null) return;
    try {
      await monitorApi.pauseMonitoringSession(state.sessionId);
      monitorStore.pauseSession();
    } catch (error) {
      console.error('세션 일시정지 실패:', error);
      throw error;
    }
  }, [state.sessionId]);

  const resumeSession = useCallback(async (): Promise<void> => {
    if (state.sessionId === null) return;
    try {
      await monitorApi.resumeMonitoringSession(state.sessionId);
      monitorStore.resumeSession();
    } catch (error) {
      console.error('세션 재개 실패:', error);
      throw error;
    }
  }, [state.sessionId]);

  const completeSession = useCallback(async (): Promise<void> => {
    if (state.sessionId === null) return;
    try {
      await monitorApi.completeMonitoringSession(state.sessionId);
      monitorStore.completeSession();
    } catch (error) {
      console.error('세션 종료 실패:', error);
      throw error;
    }
  }, [state.sessionId]);

  const resetSession = useCallback(() => {
    monitorStore.reset();
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      monitorStore.clearIntervals();
    };
  }, []);

  return {
    sessionId: state.sessionId,
    status: state.status,
    startTime: state.startTime,
    feedback: state.feedback,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    resetSession,
  };
}

