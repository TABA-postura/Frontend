// src/ai/hooks/usePoseInference.ts
import React, { useEffect, useMemo, useRef } from "react";
import { AiClient } from "../api/aiClient";
import type { AnalyzeResponse } from "../api/aiClient";

const DEFAULT_AI_BASE_URL =
  (import.meta as any).env?.VITE_AI_BASE_URL ?? "https://ai.taba-postura.com";

export type SessionStatus = "IDLE" | "RUNNING" | "PAUSED" | "ENDED";

export interface UsePoseInferenceOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: SessionStatus;
  sessionId: number;
  intervalMs?: number;
  debugLogRaw?: boolean;
  onResult: (result: AnalyzeResponse) => void;
}

/**
 * 웹캠 프레임을 주기적으로 캡처해서 AI 서버로 보내고,
 * 결과를 onResult 콜백으로 전달하는 훅.
 *
 * - status가 RUNNING일 때만 작동.
 * - IDLE/PAUSED/ENDED로 바뀌면 자동으로 정지.
 * - RUNNING으로 전환되는 순간 첫 프레임에 reset=true를 붙여서 baseline을 다시 잡음.
 */
export function usePoseInference(options: UsePoseInferenceOptions) {
  const {
    videoRef,
    status,
    sessionId,
    intervalMs = 1000,
    debugLogRaw = false,
    onResult,
  } = options;

  const aiClient = useMemo(
    () => new AiClient(DEFAULT_AI_BASE_URL),
    [],
  );

  const prevStatusRef = useRef<SessionStatus>("IDLE");
  const shouldResetRef = useRef<boolean>(false);

  useEffect(() => {
    const prev = prevStatusRef.current;
    if (prev !== "RUNNING" && status === "RUNNING") {
      // RUNNING으로 새로 진입하는 순간 → baseline 리셋
      shouldResetRef.current = true;
    }
    prevStatusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (status !== "RUNNING") {
      return;
    }

    let timer: number | null = null;
    let cancelled = false; // 취소 플래그

    const canvas = document.createElement("canvas");
    const video = videoRef.current;

    const loop = async () => {
      if (cancelled) return; // cleanup 이후에는 바로 종료

      if (!video || video.readyState < 2) {
        timer = window.setTimeout(loop, intervalMs);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        timer = window.setTimeout(loop, intervalMs);
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        async (blob) => {
          if (cancelled) return; // 중간에 취소됐으면 더 이상 진행 X

          if (!blob) {
            timer = window.setTimeout(loop, intervalMs);
            return;
          }

          try {
            const result = await aiClient.analyze({
              sessionId,
              imageBlob: blob,
              reset: shouldResetRef.current,
              debugLogRaw,
            });

            if (!cancelled) {    // 언마운트 후에는 콜백도 안 부르게
              onResult(result);
            }
            shouldResetRef.current = false;
          } catch (e) {
            if (!cancelled) {
             console.error("AI analyze 호출 실패:", e);
            }
          } finally {
            if (!cancelled && status === "RUNNING") {
              // 취소되지 않았고 여전히 RUNNING일 때만 다음 예약
              timer = window.setTimeout(loop, intervalMs);
            }
          }
        },
        "image/jpeg",
        0.9,
      );
    };

    timer = window.setTimeout(loop, intervalMs);

    return () => {
      cancelled = true;
      if (timer !== null) {
        window.clearTimeout(timer);
      }
    };
  }, [
    aiClient,
    debugLogRaw,
    intervalMs,
    onResult,
    sessionId,
    status,
    videoRef,
  ]);
}
