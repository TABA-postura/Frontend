import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './OAuthRedirectPage.css';

export default function OAuthRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const error = params.get("error");
    const message = params.get("message");
    const provider = params.get("provider");

    // 에러 케이스 처리
    if (error) {
      const decodedMessage = message ? decodeURIComponent(message) : "소셜 로그인에 실패했습니다.";
      
      // URL에서 에러 파라미터 제거
      window.history.replaceState({}, '', window.location.pathname);

      // provider_mismatch 케이스
      if (error === "provider_mismatch") {
        // 에러 메시지를 로컬 스토리지에 임시 저장 (로그인 페이지에서 표시)
        localStorage.setItem("oauth_error", JSON.stringify({
          type: "provider_mismatch",
          message: decodedMessage || "이미 가입된 이메일입니다. 기존 로그인 방식으로 로그인해 주세요.",
          provider: provider || null
        }));
        
        // 로그인 페이지로 이동
        navigate("/login", { replace: true });
        return;
      }

      // 기타 에러 케이스
      localStorage.setItem("oauth_error", JSON.stringify({
        type: error,
        message: decodedMessage || "소셜 로그인에 실패했습니다. 다시 시도해 주세요.",
        provider: provider || null
      }));
      
      navigate("/login", { replace: true });
      return;
    }

    // 성공 케이스
    if (accessToken && refreshToken) {
      // 토큰 저장
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // URL에서 토큰 제거 (보안을 위해 주소창에 토큰이 남지 않도록)
      window.history.replaceState({}, '', window.location.pathname);

      // 모니터 페이지로 이동
      navigate("/monitor", { replace: true });
      return;
    }

    // 토큰이 없는 경우 (알 수 없는 실패)
    console.error("OAuth: accessToken 또는 refreshToken 없음");
    localStorage.setItem("oauth_error", JSON.stringify({
      type: "unknown",
      message: "소셜 로그인에 실패했습니다. 다시 시도해 주세요."
    }));
    navigate("/login", { replace: true });
  }, [navigate]);

  return <div className="oauth-redirect-container">로그인 처리 중...</div>;
}

