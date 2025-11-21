import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import SignupPage from '../features/auth/pages/SignupPage';
import MonitorPage from '../features/monitor/pages/MonitorPage';
import RealtimePosturePage from '../features/monitor/pages/RealtimePosturePage';
import InformationPage from '../features/information/pages/InformationPage';
import SelfCarePage from '../features/selfcare/pages/SelfCarePage';
import MainPage from '../features/home/pages/MainPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
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
    path: '/self-management',
    element: <SelfCarePage />,
  },
]);
