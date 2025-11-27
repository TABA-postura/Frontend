// src/app/router.tsx

import { createBrowserRouter } from 'react-router-dom';

import MainPage from '../features/home/pages/MainPage';
import RealtimePosturePage from '../features/monitor/pages/RealtimePosturePage';
import MonitorPage from '../features/monitor/pages/MonitorPage';
import LoginPage from '../features/auth/pages/LoginPage';
import SignupPage from '../features/auth/pages/SignupPage';
import InformationPage from '../features/selfcare/pages/InformationPage';
import SelfCarePage from '../features/selfcare/pages/SelfCarePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,    // ⭐ 메인 페이지를 MainPage로 변경
  },
  {
    path: '/realtime',
    element: <RealtimePosturePage />,
  },
  {
    path: '/monitor',
    element: <MonitorPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/information',
    element: <InformationPage />,
  },
  {
    path: '/selfcare',
    element: <SelfCarePage />,
  },
]);
