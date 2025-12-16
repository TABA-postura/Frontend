import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './OAuthRedirectPage.css';

export default function OAuthRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (!accessToken) {
      console.error("OAuth accessToken 없음");
      navigate("/login", { replace: true });
      return;
    }

    // 토큰 저장
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    // URL에서 토큰 제거 (보안을 위해 주소창에 토큰이 남지 않도록)
    window.history.replaceState({}, '', window.location.pathname);

    // 모니터 페이지로 이동
    navigate("/monitor", { replace: true });
  }, [navigate]);

  return <div className="oauth-redirect-container">로그인 처리 중...</div>;
}

