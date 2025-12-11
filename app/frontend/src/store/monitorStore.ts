import type { MonitoringStatus, RealtimeFeedbackResponse } from '../types/monitor';

interface MonitorState {
  sessionId: number | null;
  status: MonitoringStatus;
  startTime: string | null;
  feedback: RealtimeFeedbackResponse | null;
  imageSendInterval: number | null;
  pollingInterval: number | null;
}

class MonitorStore {
  private state: MonitorState = {
    sessionId: null,
    status: 'IDLE',
    startTime: null,
    feedback: null,
    imageSendInterval: null,
    pollingInterval: null,
  };

  private listeners: Set<() => void> = new Set();

  getState(): MonitorState {
    return { ...this.state };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  startSession(sessionId: number, startTime: string): void {
    this.state.sessionId = sessionId;
    this.state.startTime = startTime;
    this.state.status = 'STARTED';
    this.notify();
  }

  pauseSession(): void {
    if (this.state.status === 'STARTED' || this.state.status === 'RESUMED') {
      this.state.status = 'PAUSED';
      this.notify();
    }
  }

  resumeSession(): void {
    if (this.state.status === 'PAUSED') {
      this.state.status = 'RESUMED';
      this.notify();
    }
  }

  completeSession(): void {
    this.state.status = 'COMPLETED';
    this.clearIntervals();
    this.notify();
  }

  setFeedback(feedback: RealtimeFeedbackResponse): void {
    this.state.feedback = feedback;
    this.notify();
  }

  setImageSendInterval(intervalId: number | null): void {
    this.state.imageSendInterval = intervalId;
  }

  setPollingInterval(intervalId: number | null): void {
    this.state.pollingInterval = intervalId;
  }

  clearIntervals(): void {
    if (this.state.imageSendInterval !== null) {
      clearInterval(this.state.imageSendInterval);
      this.state.imageSendInterval = null;
    }
    if (this.state.pollingInterval !== null) {
      clearInterval(this.state.pollingInterval);
      this.state.pollingInterval = null;
    }
  }

  reset(): void {
    this.clearIntervals();
    this.state = {
      sessionId: null,
      status: 'IDLE',
      startTime: null,
      feedback: null,
      imageSendInterval: null,
      pollingInterval: null,
    };
    this.notify();
  }
}

export const monitorStore = new MonitorStore();
