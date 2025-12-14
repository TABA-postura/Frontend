import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../assets/styles/globals.css'
import App from './App.tsx'
import { setupGlobalErrorHandler } from '../utils/errorHandler'

// 전역 에러 핸들러 설정 (Chrome 확장 프로그램 에러 필터링)
setupGlobalErrorHandler()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
