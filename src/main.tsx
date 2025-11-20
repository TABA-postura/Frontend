import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../app/frontend/src/assets/styles/globals.css'
import App from '../app/frontend/src/app/App.tsx'

console.log('main.tsx 실행됨');
console.log('root element:', document.getElementById('root'));

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('root element를 찾을 수 없습니다!');
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
