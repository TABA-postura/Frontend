// src/ai/hooks/usePoseInference.ts
import React, { useMemo, useCallback } from "react";
import { AiClient } from "../api/aiClient";
import type { AnalyzeResponse } from "../api/aiClient";

const DEFAULT_AI_BASE_URL =
  (import.meta as any).env?.VITE_AI_BASE_URL ?? "https://ai.taba-postura.com";

export type SessionStatus = "IDLE" | "RUNNING" | "PAUSED" | "ENDED";

export interface UsePoseInferenceOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  sessionId: number;
  debugLogRaw?: boolean;
  onResult?: (result: AnalyzeResponse) => void;
}

export interface UsePoseInferenceResult {
  /**
   * 현재 비디오 프레임을 캡처하여 AI 서버로 전송하는 함수
   * @param reset - true일 경우 baseline을 리셋 (새 세션 시작 시 사용)
   * @param abortSignal - 요청 취소를 위한 AbortSignal (선택적)
   * @returns Promise<AnalyzeResponse | null> - 성공 시 결과, 실패 시 null
   */
  sendFrame: (reset?: boolean, abortSignal?: AbortSignal) => Promise<AnalyzeResponse | null>;
  /**
   * 현재 세션 ID
   */
  sessionId: number;
}

/**
 * 웹캠 프레임을 수동으로 캡처해서 AI 서버로 보내는 훅.
 * 
 * - 자동 루프 없이 sendFrame() 함수를 반환
 * - 호출자가 원하는 시점에 sendFrame()을 호출하여 프레임 전송
 * - reset 플래그로 baseline 리셋 가능
 * 
 * @example
 * ```tsx
 * const { sendFrame, sessionId } = usePoseInference({
 *   videoRef,
 *   sessionId: 123,
 *   onResult: (result) => console.log(result),
 * });
 * 
 * // tick에서 호출
 * await sendFrame(isFirstFrame);
 * ```
 */
export function usePoseInference(
  options: UsePoseInferenceOptions
): UsePoseInferenceResult {
  const {
    videoRef,
    sessionId,
    debugLogRaw = false,
    onResult,
  } = options;

  const aiClient = useMemo(
    () => new AiClient(DEFAULT_AI_BASE_URL),
    [],
  );

  const sendFrame = useCallback(
    async (reset = false, abortSignal?: AbortSignal): Promise<AnalyzeResponse | null> => {
      // 취소 신호가 이미 발생했으면 즉시 중단
      if (abortSignal?.aborted) {
        return null;
      }

      const video = videoRef.current;
      if (!video || video.readyState < 2) {
        return null;
      }

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return null;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        const blob = await new Promise<Blob | null>((resolve) => {
          // 취소 신호 확인
          if (abortSignal?.aborted) {
            resolve(null);
            return;
          }
          canvas.toBlob(resolve, "image/jpeg", 0.9);
        });

        if (!blob || abortSignal?.aborted) {
          return null;
        }

        const result = await aiClient.analyze({
          sessionId,
          imageBlob: blob,
          reset,
          debugLogRaw,
          abortSignal,
        });

        // 취소 신호 확인 후 결과 처리
        if (abortSignal?.aborted) {
          return null;
        }

        if (onResult) {
          onResult(result);
        }

        return result;
      } catch (e) {
        // AbortError는 정상적인 취소이므로 무시
        if (e instanceof Error && e.name === 'AbortError') {
          return null;
        }
        console.error("AI analyze 호출 실패:", e);
        return null;
      }
    },
    [aiClient, sessionId, debugLogRaw, onResult, videoRef]
  );

  return {
    sendFrame,
    sessionId,
  };
}
