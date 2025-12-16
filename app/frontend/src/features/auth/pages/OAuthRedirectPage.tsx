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
      navigate("/login");
      return;
    }

    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    navigate("/monitor", { replace: true });
  }, [navigate]);

  return <div className="oauth-redirect-container">로그인 처리 중...</div>;
}

