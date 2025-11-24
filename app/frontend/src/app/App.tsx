import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import '../assets/styles/globals.css';

function App() {
  console.log('App 컴포넌트 렌더링됨');

  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
