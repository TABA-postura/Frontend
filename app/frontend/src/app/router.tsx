import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import SignupPage from '../features/auth/pages/SignupPage';
import MonitorPage from '../features/monitor/pages/MonitorPage';
import InformationPage from '../features/information/pages/InformationPage';
import SelfCarePage from '../features/selfcare/pages/SelfCarePage';

export const router = createBrowserRouter([
  {
    path: '/',
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
