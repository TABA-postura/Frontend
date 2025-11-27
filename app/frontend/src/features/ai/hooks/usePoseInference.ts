// src/ai/hooks/usePoseInference.ts
import React, { useEffect, useMemo, useRef } from "react";
import { AiClient } from "../api/aiClient";
import type { AnalyzeResponse } from "../api/aiClient";

const DEFAULT_AI_BASE_URL =
  (import.meta as any).env?.VITE_AI_BASE_URL ?? "http://127.0.0.1:8000";

export type SessionStatus = "IDLE" | "RUNNING" | "PAUSED" | "ENDED";

export interface UsePoseInferenceOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: SessionStatus;
  userId: number;
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
    userId,
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
    const canvas = document.createElement("canvas");
    const video = videoRef.current;

    const loop = async () => {
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
          if (!blob) {
            timer = window.setTimeout(loop, intervalMs);
            return;
          }

          try {
            const result = await aiClient.analyze({
              userId,
              sessionId,
              imageBlob: blob,
              reset: shouldResetRef.current,
              debugLogRaw,
            });

            onResult(result);
            shouldResetRef.current = false;
          } catch (e) {
            console.error("AI analyze 호출 실패:", e);
          } finally {
            timer = window.setTimeout(loop, intervalMs);
          }
        },
        "image/jpeg",
        0.9,
      );
    };

    timer = window.setTimeout(loop, intervalMs);

    return () => {
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
    userId,
    videoRef,
  ]);
}
