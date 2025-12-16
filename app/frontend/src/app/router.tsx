// src/app/router.tsx

import { createBrowserRouter } from 'react-router-dom';

import MainPage from '../features/home/pages/MainPage';
import RealtimePosturePage from '../features/monitor/pages/RealtimePosturePage';
import MonitorPage from '../features/monitor/pages/MonitorPage';
import LoginPage from '../features/auth/pages/LoginPage';
import SignupPage from '../features/auth/pages/SignupPage';
import OAuthRedirectPage from '../features/auth/pages/OAuthRedirectPage';
import InformationPage from '../features/information/pages/InformationPage';
import ContentDetailPage from '../features/information/pages/ContentDetailPage';
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
  // 정보 제공 페이지는 public으로 접근 가능
  {
    path: '/information',
    element: <InformationPage />,
  },
  {
    path: '/content/:id',
    element: <ContentDetailPage />,
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
        path: '/selfcare',
        element: <SelfCarePage />,
      },
    ],
  },
]);
