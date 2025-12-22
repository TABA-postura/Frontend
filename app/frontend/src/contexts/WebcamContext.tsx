import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface WebcamContextType {
  isWebcamRunning: boolean;
  stopWebcam: () => Promise<void>;
}

const WebcamContext = createContext<WebcamContextType | undefined>(undefined);

export const WebcamProvider = ({ 
  children, 
  isWebcamRunning, 
  stopWebcam 
}: { 
  children: ReactNode;
  isWebcamRunning: boolean;
  stopWebcam: () => Promise<void>;
}) => {
  return (
    <WebcamContext.Provider value={{ isWebcamRunning, stopWebcam }}>
      {children}
    </WebcamContext.Provider>
  );
};

export const useWebcamContext = () => {
  const context = useContext(WebcamContext);
  if (context === undefined) {
    // Context가 없으면 웹캠이 실행 중이지 않은 것으로 간주
    return { isWebcamRunning: false, stopWebcam: async () => {} };
  }
  return context;
};
