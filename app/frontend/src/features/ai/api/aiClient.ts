// src/ai/api/aiClient.ts

export type PostureState = "GOOD" | "WARN" | "ERROR" | "UNKNOWN";

export interface ViolationDetail {
  code: string;
  severity: number;   // 1~3
  confidence: number; // 0.0~1.0
}

export interface AdviceItem {
  code: string;
  message: string;
  content_id?: string;
}

export interface AnalyzeResponse {
  state: PostureState[]; // state가 여러 개일 수 있도록 배열로 수정
  advices: AdviceItem[];
  metrics: Record<string, number>;
  timestamp_ms: number;
}

export interface AnalyzeParams {
  sessionId: number;
  imageBlob: Blob;
  reset?: boolean;
  debugLogRaw?: boolean;
  abortSignal?: AbortSignal;
}

export class AiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  async analyze(params: AnalyzeParams): Promise<AnalyzeResponse> {
    const { sessionId, imageBlob, reset = false, debugLogRaw = false, abortSignal } =
      params;

    // 취소 신호가 이미 발생했으면 즉시 중단
    if (abortSignal?.aborted) {
      throw new DOMException('요청이 취소되었습니다.', 'AbortError');
    }

    const formData = new FormData();
    formData.append("sessionId", String(sessionId));
    formData.append("reset", reset ? "true" : "false");
    formData.append("file", imageBlob, "frame.jpg");

    const res = await fetch(`${this.baseUrl}/posture/analyze`, {
      method: "POST",
      body: formData,
      //signal: abortSignal, // AbortSignal을 fetch에 전달하여 요청 취소 가능하게 함
    });

    // 취소 신호 확인
    if (abortSignal?.aborted) {
      throw new DOMException('요청이 취소되었습니다.', 'AbortError');
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `AI analyze 실패: ${res.status} ${res.statusText} - ${text}`,
      );
    }

    const data = (await res.json()) as AnalyzeResponse;

    // 취소 신호 재확인 (응답 처리 전)
    if (abortSignal?.aborted) {
      throw new DOMException('요청이 취소되었습니다.', 'AbortError');
    }

    if (debugLogRaw) {
      console.log("[AI analyze raw response]", data);
    }

    return data;
  }
}
