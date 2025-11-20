import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, selectIsAuthenticated } from '../../../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const location = useLocation();

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  // location.state.from에 현재 경로를 저장하여 로그인 후 돌아올 수 있도록 함
  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

