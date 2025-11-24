// src/ai/api/aiClient.ts

export type PostureState = "GOOD" | "WARN" | "ERROR";

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
  state: PostureState;
  violations: string[];
  violation_details: ViolationDetail[];
  advices: AdviceItem[];
  metrics: Record<string, number>;
  timestamp_ms: number;
}

export interface AnalyzeParams {
  userId: number;
  sessionId: number;
  imageBlob: Blob;
  reset?: boolean;
  debugLogRaw?: boolean;
}

export class AiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  async health(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/posture/health`);
      return res.ok;
    } catch {
      return false;
    }
  }

  async analyze(params: AnalyzeParams): Promise<AnalyzeResponse> {
    const { userId, sessionId, imageBlob, reset = false, debugLogRaw = false } =
      params;

    const formData = new FormData();
    formData.append("userId", String(userId));
    formData.append("sessionId", String(sessionId));
    formData.append("reset", reset ? "true" : "false");
    formData.append("file", imageBlob, "frame.jpg");

    const res = await fetch(`${this.baseUrl}/posture/analyze`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `AI analyze 실패: ${res.status} ${res.statusText} - ${text}`,
      );
    }

    const data = (await res.json()) as AnalyzeResponse;

    if (debugLogRaw) {
      console.log("[AI analyze raw response]", data);
    }

    return data;
  }
}
