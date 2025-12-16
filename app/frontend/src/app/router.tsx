// src/app/router.tsx

import { createBrowserRouter } from 'react-router-dom';

import MainPage from '../features/home/pages/MainPage';
import RealtimePosturePage from '../features/monitor/pages/RealtimePosturePage';
import MonitorPage from '../features/monitor/pages/MonitorPage';
import LoginPage from '../features/auth/pages/LoginPage';
import SignupPage from '../features/auth/pages/SignupPage';
import OAuthRedirectPage from '../features/auth/pages/OAuthRedirectPage';
import InformationPage from '../features/information/pages/InformationPage';
import SelfCarePage from '../features/selfcare/pages/SelfCarePage';
import PrivateRoute from '../routes/PrivateRoute';

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
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/oauth/redirect',
    element: <OAuthRedirectPage />,
  },
  // 인증이 필요한 페이지들
  {
    element: <PrivateRoute />,
    children: [
      {
        path: '/monitor',
        element: <MonitorPage />,
      },
      {
        path: '/information',
        element: <InformationPage />,
      },
      {
        path: '/selfcare',
        element: <SelfCarePage />,
      },
    ],
  },
]);
