import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import SignupPage from '../features/auth/pages/SignupPage';
import MonitorPage from '../features/monitor/pages/MonitorPage';
import InformationPage from '../features/information/pages/InformationPage';
import SelfCarePage from '../features/selfcare/pages/SelfCarePage';
import ProtectedRoute from '../features/auth/components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MonitorPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/information',
    element: (
      <ProtectedRoute>
        <InformationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/self-management',
    element: (
      <ProtectedRoute>
        <SelfCarePage />
      </ProtectedRoute>
    ),
  },
]);
