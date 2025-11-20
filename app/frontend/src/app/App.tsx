import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import '../assets/styles/globals.css';

function App() {
  console.log('App 컴포넌트 렌더링됨');
  return <RouterProvider router={router} />;
}

export default App;
