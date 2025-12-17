import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  // TODO: 개발 완료 후 아래 주석 해제하고 return <Outlet /> 삭제
  // const accessToken = localStorage.getItem("accessToken");
  // if (!accessToken) {
  //   return <Navigate to="/login" replace />;
  // }

  return <Outlet />;
}

